#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface FetvaRecord {
  id: string;
  q_in_file: number;
  question: string;
  answer: string;
  categories: string[];
  source?: string;
  date?: string;
  views: number;
  likes: number;
  searchKeywords?: string[];
  arabicText?: string;
  normalizedText?: string;
}

// Kategori konsolidasyon haritası
const categoryMapping: Record<string, string[]> = {
  "İbadet": [
    "namaz", "abdest", "farz", "sunnet", "sabah-namazi", "ikindi-namazi", "cuma-namazi",
    "cuma-hutbesi", "cemaat", "cemaatle-namaz", "imam", "imamlik", "kamet", "secde",
    "sehiv-secdesi", "abdest-namazi", "sunnet-namaz", "teheccud-namazi", "kaza-namazi",
    "vakit", "kerahet-vakti", "sahit", "sahitlik"
  ],
  "İnanç": [
    "allah", "iman", "kufur", "sirk", "tekbir", "tesbih", "dua", "niyet", "hadis",
    "kuran", "ayet", "tefsir", "peygamber", "islam", "musluman", "hadis-inkarcilari",
    "delil", "ilim", "i̇nanç", "allah-in-sifatlari", "allah-lafzi", "melekler"
  ],
  "Ahlak & Tasavvuf": [
    "ahlap", "tesettur", "giybet", "sadaka", "ziyaret", "mahrem", "iyilik", "edep",
    "adap", "adaplar", "helallik", "affetme", "hak", "hakaret", "selam", "tarikat",
    "seyh", "veli", "rabita", "tasavvuf", "mevlana"
  ],
  "Aile Hukuku & Sosyal İlişkiler": [
    "aile", "kadın", "erkek", "evlilik", "boşanma", "nikah", "cennet", "baba", "anne",
    "cocuk", "cocuk-egitimi", "kadinlar", "erkekler", "kadin-erkek-iliskileri", "mahremiyet",
    "nazar", "komsu", "akraba", "anne-baba", "amca", "dayi"
  ],
  "Muamelat & Ekonomi": [
    "ticaret", "faiz", "para", "borc", "satış", "alis", "rusvet", "hak", "hukum",
    "kanun", "demokrasi", "sistem", "banka", "katilim-bankasi", "borsa", "dolar",
    "altin", "altin-hesabi", "borc-verme", "alim-satim", "kazanc"
  ],
  "Helal Gıda & Beslenme": [
    "helal", "haram", "et", "domuz-eti", "beslenme", "yemek", "içmek", "lokanta",
    "i̇çki", "alkol", "sigara", "kurban", "kurban-kesimi", "hayvanlar", "balik",
    "at-eti", "av-yakalama", "avuk"
  ],
  "Sağlık": [
    "saglik", "tedavi", "hasta", "ilac", "doktor", "ameliyat", "engelli", "lohusa",
    "adetli", "hayiz", "nifas", "hamile", "doğum", "aşı", "tibbi", "göz-damlasi",
    "igne", "antibiyotik", "organ-bagisi"
  ],
  "Ölüm & Ahiret": [
    "olu", "ölum", "cenaze", "cenaze-namazi", "kabir", "cehennem", "azap", "kıyamet",
    "kıyamet-alametleri", "ahiret", "mezar", "mezarlik", "defin", "mukabele", "hatim"
  ],
  "İslam İlimleri": [
    "fikih", "hadis", "kuran", "tefsir", "siyer", "akaid", "kelam", "usul", "mezhep",
    "mezhepler", "hanefi", "safi", "maliki", "hanbeli", "müctehid", "icma", "kıyas",
    "kiraat", "mucize", "vahiy"
  ],
  "Mahremiyet & Tesettür": [
    "tesettur", "mahrem", "hijab", "niqab", "başörtüsü", "mahremiyet", "mahrem-sinirlari",
    "kadin-erkek-iliskileri", "mahrem-donem", "mahrem-bakim", "özel-alan"
  ],
  "Genel Sorular": [
    "genel", "soru", "cevap", "diğer", "bilgi", "öğrenme", "eğitim", "öğretim",
    "araştırma", "danışma", "rehberlik", "yardim", "destek", "öneri", "fikir"
  ]
};

function mapCategoriesToConsolidated(categories: string[]): string[] {
  const consolidatedCategories = new Set<string>();

  for (const category of categories) {
    const normalizedCategory = category.toLowerCase().trim();

    // Her kategori için hangi ana kategoriye ait olduğunu bul
    for (const [mainCategory, subCategories] of Object.entries(categoryMapping)) {
      // Alt kategorilerden biriyle eşleşiyorsa
      if (subCategories.some(sub => sub.toLowerCase() === normalizedCategory ||
                                  normalizedCategory.includes(sub.toLowerCase()) ||
                                  sub.toLowerCase().includes(normalizedCategory))) {
        consolidatedCategories.add(mainCategory);
        break;
      }

      // Ana kategori adıyla doğrudan eşleşiyorsa
      if (normalizedCategory.includes(mainCategory.toLowerCase()) ||
          mainCategory.toLowerCase().includes(normalizedCategory)) {
        consolidatedCategories.add(mainCategory);
        break;
      }
    }

    // Hiçbir ana kategoriye eşleşmediyse Genel Sorular'a ekle
    if (consolidatedCategories.size === 0) {
      consolidatedCategories.add("Genel Sorular");
    }
  }

  return Array.from(consolidatedCategories);
}

async function consolidateCategories() {
  console.log('🔄 Kategori konsolidasyonu başlatılıyor...');

  const sourcePath = path.join(process.cwd(), 'data', 'processed_fetvas.jsonl');
  const targetPath = path.join(process.cwd(), 'data', 'consolidated_fetvas.jsonl');

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Kaynak dosya bulunamadı: ${sourcePath}`);
    process.exit(1);
  }

  const readStream = fs.createReadStream(sourcePath, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(targetPath, { encoding: 'utf-8' });
  const reader = readline.createInterface({ input: readStream, crlfDelay: Infinity });

  let successCount = 0;
  let skippedCount = 0;
  let lineNumber = 0;

  const categoryStats = new Map<string, number>();

  for await (const line of reader) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const record: FetvaRecord = JSON.parse(trimmed);

      // Kategorileri konsolide et
      const oldCategories = record.categories;
      const newCategories = mapCategoriesToConsolidated(oldCategories);

      // İstatistik tut
      for (const cat of newCategories) {
        categoryStats.set(cat, (categoryStats.get(cat) || 0) + 1);
      }

      // Kaydı güncelle
      const updatedRecord = {
        ...record,
        categories: newCategories,
        oldCategories: oldCategories // Önceki kategorileri sakla
      };

      writeStream.write(`${JSON.stringify(updatedRecord)}\n`);
      successCount += 1;

      if (successCount % 50 === 0) {
        console.log(`   📝 ${successCount} kayıt işlendi...`);
      }
    } catch (error) {
      console.error(`❌ Satır ${lineNumber} işlenemedi:`, error);
      skippedCount += 1;
    }
  }

  writeStream.close();

  console.log('\n✅ Konsolidasyon tamamlandı!');
  console.log(`📄 Toplam kayıt: ${successCount}`);
  console.log(`⚠️ Atlanan satır: ${skippedCount}`);
  console.log(`📄 Çıktı dosyası: ${targetPath}`);

  console.log('\n📊 Yeni kategori dağılımı:');
  const sortedStats = Array.from(categoryStats.entries())
    .sort((a, b) => b[1] - a[1]);

  for (const [category, count] of sortedStats) {
    console.log(`   ${category}: ${count} fetva`);
  }
}

// Script'i çalıştır
if (require.main === module) {
  consolidateCategories()
    .then(() => {
      console.log('\n✅ Kategori konsolidasyonu başarıyla tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Konsolidasyon başarısız:', error);
      process.exit(1);
    });
}