'use client';

export function Footer() {
  return (
    <footer className="mt-auto pb-10 pt-5 border-t border-clean-border">
      <div className="max-w-editorial mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-muted tracking-[1px] uppercase">
        <div>&copy; {new Date().getFullYear()} FetvaBul — Güvenilir Bilgi Rehberi</div>
        <div className="hidden sm:block">İlmihal ve Fıkıh Veritabanı</div>
      </div>
    </footer>
  );
}
