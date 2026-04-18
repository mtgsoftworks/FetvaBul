'use client';

export const DATA_SYNCED_EVENT = 'fetvabul:data-synced';

const DATA_SYNC_DB_NAME = 'fetvabul-data-sync';
const DATA_SYNC_STORE_NAME = 'datasets';
const DATASET_RECORD_KEY = 'fatwas-jsonl';
const DATA_SYNC_META_KEY = 'fetvabul-data-sync-meta';
const DATA_SYNC_LAST_CHECK_KEY = 'fetvabul-data-sync-last-check';
const DEFAULT_DATA_SYNC_CHECK_MS = 15 * 60 * 1000;
const DEFAULT_REMOTE_SYNC_BASE_URL = 'https://fetvabul.netlify.app';

const OFFLINE_BUILD = process.env.NEXT_PUBLIC_OFFLINE_BUILD === '1';
const ENABLE_DATA_SYNC = process.env.NEXT_PUBLIC_ENABLE_DATA_SYNC === '1' || OFFLINE_BUILD;
const DATA_SYNC_CHECK_MS = (() => {
  const parsed = Number.parseInt(process.env.NEXT_PUBLIC_DATA_SYNC_CHECK_MS ?? `${DEFAULT_DATA_SYNC_CHECK_MS}`, 10);
  return Number.isFinite(parsed) && parsed >= 60_000 ? parsed : DEFAULT_DATA_SYNC_CHECK_MS;
})();

export type DataManifest = {
  version: string;
  generatedAt: string;
  data: {
    fileName: string;
    relativePath: string;
    fallbackPath?: string;
    sha256: string;
    size: number;
    recordCount: number;
    updatedAt: string;
  };
};

type SyncedDatasetRecord = {
  id: string;
  version: string;
  sha256: string;
  updatedAt: string;
  syncedAt: string;
  content: string;
};

type DataSyncMeta = {
  version: string;
  sha256: string;
  syncedAt: string;
  updatedAt: string;
};

type DataSyncResult = {
  updated: boolean;
  version?: string;
  reason?: string;
};

let syncInFlight: Promise<DataSyncResult> | null = null;

function canUseBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isIndexedDbAvailable(): boolean {
  return canUseBrowser() && typeof window.indexedDB !== 'undefined';
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveSyncBaseUrl(): string | null {
  const configured =
    process.env.NEXT_PUBLIC_SYNC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    '';

  if (!configured) {
    return OFFLINE_BUILD ? DEFAULT_REMOTE_SYNC_BASE_URL : '';
  }

  return normalizeBaseUrl(configured);
}

function buildManifestUrls(baseUrl: string | null): string[] {
  if (baseUrl === null) {
    return [];
  }

  const candidates = baseUrl
    ? [`${baseUrl}/api/data/manifest`, `${baseUrl}/data/manifest.json`]
    : ['/api/data/manifest', '/data/manifest.json'];

  return Array.from(new Set(candidates));
}

function buildDataUrl(baseUrl: string | null, relativePath: string, version: string): string | null {
  if (baseUrl === null) {
    return null;
  }

  const normalizedRelativePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const basePath = baseUrl ? `${baseUrl}${normalizedRelativePath}` : normalizedRelativePath;
  const joinChar = basePath.includes('?') ? '&' : '?';
  return `${basePath}${joinChar}v=${encodeURIComponent(version)}`;
}

function isManifest(value: unknown): value is DataManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (!record.data || typeof record.data !== 'object') {
    return false;
  }

  const data = record.data as Record<string, unknown>;

  return (
    typeof record.version === 'string' &&
    typeof record.generatedAt === 'string' &&
    typeof data.fileName === 'string' &&
    typeof data.relativePath === 'string' &&
    typeof data.sha256 === 'string' &&
    typeof data.size === 'number' &&
    typeof data.recordCount === 'number' &&
    typeof data.updatedAt === 'string'
  );
}

function readLastCheckAt(): number {
  if (!canUseBrowser()) {
    return 0;
  }

  const raw = window.localStorage.getItem(DATA_SYNC_LAST_CHECK_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeLastCheckAt(value: number): void {
  if (!canUseBrowser()) {
    return;
  }

  window.localStorage.setItem(DATA_SYNC_LAST_CHECK_KEY, String(value));
}

function writeSyncMeta(meta: DataSyncMeta): void {
  if (!canUseBrowser()) {
    return;
  }

  window.localStorage.setItem(DATA_SYNC_META_KEY, JSON.stringify(meta));
}

function readSyncMeta(): DataSyncMeta | null {
  if (!canUseBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(DATA_SYNC_META_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DataSyncMeta;
    if (
      parsed &&
      typeof parsed.version === 'string' &&
      typeof parsed.sha256 === 'string' &&
      typeof parsed.syncedAt === 'string' &&
      typeof parsed.updatedAt === 'string'
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function openSyncDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = window.indexedDB.open(DATA_SYNC_DB_NAME, 1);

    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DATA_SYNC_STORE_NAME)) {
        db.createObjectStore(DATA_SYNC_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function readSyncedDatasetRecord(): Promise<SyncedDatasetRecord | null> {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  const db = await openSyncDb();

  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DATA_SYNC_STORE_NAME, 'readonly');
      const store = tx.objectStore(DATA_SYNC_STORE_NAME);
      const request = store.get(DATASET_RECORD_KEY);

      request.onerror = () => reject(request.error ?? new Error('Failed to read synced dataset record'));
      request.onsuccess = () => {
        const result = request.result as SyncedDatasetRecord | undefined;
        resolve(result ?? null);
      };
    });
  } finally {
    db.close();
  }
}

async function writeSyncedDatasetRecord(record: SyncedDatasetRecord): Promise<void> {
  if (!isIndexedDbAvailable()) {
    return;
  }

  const db = await openSyncDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DATA_SYNC_STORE_NAME, 'readwrite');
      const store = tx.objectStore(DATA_SYNC_STORE_NAME);
      const request = store.put(record);

      request.onerror = () => reject(request.error ?? new Error('Failed to write synced dataset record'));
      request.onsuccess = () => resolve();
    });
  } finally {
    db.close();
  }
}

async function fetchManifest(manifestUrls: string[]): Promise<DataManifest> {
  let lastError: unknown = new Error('Manifest request failed');

  for (const manifestUrl of manifestUrls) {
    try {
      const response = await fetch(manifestUrl, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Manifest request failed (${response.status})`);
      }

      const payload: unknown = await response.json();
      if (!isManifest(payload)) {
        throw new Error('Manifest payload is invalid');
      }

      return payload;
    } catch (error) {
      lastError = error;
      console.warn(`[data-sync] Manifest fetch failed from ${manifestUrl}`, error);
    }
  }

  throw lastError;
}

async function computeSha256FromText(text: string): Promise<string | null> {
  if (!canUseBrowser() || !window.crypto?.subtle) {
    return null;
  }

  const data = new TextEncoder().encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((value) => value.toString(16).padStart(2, '0')).join('');
}

function dispatchDataSynced(version: string): void {
  if (!canUseBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DATA_SYNCED_EVENT, {
      detail: { version },
    })
  );
}

function shouldCheckNow(force = false): boolean {
  if (force) {
    return true;
  }

  const now = Date.now();
  const lastCheckAt = readLastCheckAt();
  return now - lastCheckAt >= DATA_SYNC_CHECK_MS;
}

export async function getSyncedDatasetText(): Promise<string | null> {
  try {
    const record = await readSyncedDatasetRecord();
    return record?.content ?? null;
  } catch {
    return null;
  }
}

export async function syncDatasetIfNeeded(options: { force?: boolean } = {}): Promise<DataSyncResult> {
  const { force = false } = options;

  if (!ENABLE_DATA_SYNC) {
    return { updated: false, reason: 'sync-disabled' };
  }

  if (!canUseBrowser()) {
    return { updated: false, reason: 'not-browser' };
  }

  if (!navigator.onLine) {
    return { updated: false, reason: 'offline' };
  }

  if (!shouldCheckNow(force)) {
    return { updated: false, reason: 'throttled' };
  }

  const manifestUrls = buildManifestUrls(resolveSyncBaseUrl());
  if (manifestUrls.length === 0) {
    return { updated: false, reason: 'missing-sync-base-url' };
  }

  if (!syncInFlight) {
    syncInFlight = (async () => {
      writeLastCheckAt(Date.now());

      const manifest = await fetchManifest(manifestUrls);
      const existingMeta = readSyncMeta();

      if (existingMeta?.version === manifest.version) {
        const existingRecord = await readSyncedDatasetRecord();
        if (existingRecord?.version === manifest.version) {
          return { updated: false, reason: 'up-to-date', version: manifest.version };
        }
      }

      const baseUrl = resolveSyncBaseUrl();
      const primaryDataUrl = buildDataUrl(baseUrl, manifest.data.relativePath, manifest.version);
      const fallbackPath = manifest.data.fallbackPath ?? '/data/processed_fetvas.jsonl';
      const fallbackDataUrl = buildDataUrl(baseUrl, fallbackPath, manifest.version);

      if (!primaryDataUrl) {
        return { updated: false, reason: 'missing-sync-base-url' };
      }

      let dataResponse = await fetch(primaryDataUrl, { cache: 'no-store' });
      if (!dataResponse.ok && fallbackDataUrl && fallbackDataUrl !== primaryDataUrl) {
        dataResponse = await fetch(fallbackDataUrl, { cache: 'no-store' });
      }

      if (!dataResponse.ok) {
        throw new Error(`Dataset request failed (${dataResponse.status})`);
      }

      const content = await dataResponse.text();
      if (!content.trim()) {
        throw new Error('Dataset response is empty');
      }

      const computedSha = await computeSha256FromText(content);
      if (computedSha && manifest.data.sha256 && computedSha !== manifest.data.sha256) {
        throw new Error('Dataset integrity check failed (sha256 mismatch)');
      }

      const nowIso = new Date().toISOString();
      await writeSyncedDatasetRecord({
        id: DATASET_RECORD_KEY,
        version: manifest.version,
        sha256: manifest.data.sha256,
        updatedAt: manifest.data.updatedAt,
        syncedAt: nowIso,
        content,
      });

      writeSyncMeta({
        version: manifest.version,
        sha256: manifest.data.sha256,
        syncedAt: nowIso,
        updatedAt: manifest.data.updatedAt,
      });

      dispatchDataSynced(manifest.version);
      return { updated: true, version: manifest.version };
    })().finally(() => {
      syncInFlight = null;
    });
  }

  return syncInFlight;
}
