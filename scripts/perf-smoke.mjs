const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const iterations = Number.parseInt(process.env.PERF_ITERATIONS || '30', 10);

const scenarios = [
  { name: 'search', url: `${baseUrl}/api/search?q=namaz&limit=20&page=1` },
  { name: 'autocomplete', url: `${baseUrl}/api/autocomplete?q=oru&limit=8` },
  { name: 'categories', url: `${baseUrl}/api/categories` },
];

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

async function runScenario(scenario) {
  const durations = [];

  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    const response = await fetch(scenario.url, { cache: 'no-store' });
    const end = performance.now();

    if (!response.ok) {
      throw new Error(`${scenario.name} failed with status ${response.status}`);
    }

    durations.push(end - start);
  }

  return {
    name: scenario.name,
    avgMs: Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(2)),
    p50Ms: Number(percentile(durations, 50).toFixed(2)),
    p95Ms: Number(percentile(durations, 95).toFixed(2)),
    maxMs: Number(Math.max(...durations).toFixed(2)),
  };
}

async function main() {
  console.log(`[perf-smoke] BASE_URL=${baseUrl}, iterations=${iterations}`);

  for (const scenario of scenarios) {
    const result = await runScenario(scenario);
    console.log(
      `[perf-smoke] ${result.name} avg=${result.avgMs}ms p50=${result.p50Ms}ms p95=${result.p95Ms}ms max=${result.maxMs}ms`
    );
  }
}

main().catch((error) => {
  console.error('[perf-smoke] Failed:', error);
  process.exitCode = 1;
});
