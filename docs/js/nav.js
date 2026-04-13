// Paylaşılan header ve footer bileşenleri
(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = [
    { href: 'index.html', label: 'Ana Sayfa' },
    { href: 'surec.html', label: 'Süreç' },
    { href: 'basvurular.html', label: 'Başvurular' },
    { href: 'degerlendirme.html', label: 'Değerlendirme' },
    { href: 'hakkinda.html', label: 'Hakkında' },
    { href: 'basvuru.html', label: 'Başvur', cta: true },
  ];

  const headerHTML = `
    <header class="site-header">
      <div class="nav-container">
        <a href="index.html" class="brand">
          <div class="brand-logo">ÇAKÜ</div>
          <div class="brand-text">
            <strong>Mikro Hibe Platformu</strong>
            <small>ÇAKÜ TTO · Proje Başvuru Sistemi</small>
          </div>
        </a>
        <nav class="nav-menu">
          ${navLinks
            .map(
              (l) =>
                `<a href="${l.href}" class="${l.cta ? 'cta' : ''} ${
                  currentPath === l.href ? 'active' : ''
                }">${l.label}</a>`
            )
            .join('')}
        </nav>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <h4>ÇAKÜ Mikro Hibe Platformu</h4>
          <p style="color:#c5d1e8;font-size:14px;margin:0;max-width:420px;">
            Çankırı Karatekin Üniversitesi Teknoloji Transfer Ofisi bünyesinde yürütülen,
            sosyal sorumluluk, toplumsal farkındalık ve yerel kalkınma odaklı projeleri
            mikro hibelerle destekleyen platform.
          </p>
        </div>
        <div>
          <h4>Bağlantılar</h4>
          <a href="index.html">Ana Sayfa</a>
          <a href="basvuru.html">Başvuru</a>
          <a href="surec.html">Süreç Akışı</a>
          <a href="hakkinda.html">Hakkında</a>
        </div>
        <div>
          <h4>İletişim</h4>
          <a href="mailto:tto@karatekin.edu.tr">tto@karatekin.edu.tr</a>
          <a href="#">Çankırı Karatekin Üniversitesi</a>
          <a href="#">Uluyazı Kampüsü, Çankırı</a>
        </div>
      </div>
      <div class="footer-bottom">
        © ${new Date().getFullYear()} Çankırı Karatekin Üniversitesi TTO · Mikro Hibe Proje Başvuru Platformu
      </div>
    </footer>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    const headerMount = document.getElementById('site-header');
    const footerMount = document.getElementById('site-footer');
    if (headerMount) headerMount.outerHTML = headerHTML;
    if (footerMount) footerMount.outerHTML = footerHTML;
  });

  // Paylaşılan yardımcılar
  window.CAKU = {
    statusLabel(s) {
      return (
        {
          basvuruldu: 'Başvuruldu',
          'on-degerlendirme': 'Ön Değerlendirme',
          degerlendirildi: 'Değerlendirildi',
          kabul: 'Kabul',
          red: 'Reddedildi',
          tamamlandi: 'Tamamlandı',
        }[s] || s
      );
    },
    categoryLabel(c) {
      return (
        {
          sosyal: 'Sosyal Sorumluluk',
          farkindalik: 'Toplumsal Farkındalık',
          kalkinma: 'Yerel Kalkınma',
          surdurulebilirlik: 'Sürdürülebilirlik',
          kultur: 'Kültür & Sanat',
          diger: 'Diğer',
        }[c] || c
      );
    },
    applicantLabel(a) {
      return (
        {
          akademik: 'Akademik Personel',
          idari: 'İdari Personel',
          lisans: 'Lisans Öğrencisi',
          lisansustu: 'Lisansüstü Öğrenci',
          topluluk: 'Öğrenci Topluluğu',
          dis: 'Dış Paydaş',
        }[a] || a
      );
    },
    formatTL(n) {
      const num = Number(n) || 0;
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
      }).format(num);
    },
    formatDate(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    },
    escape(s) {
      return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
  };
})();
