// Ana sayfa – istatistikleri yükle
(function () {
  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      const statsEl = document.getElementById('stats');
      if (!statsEl) return;

      const approved = data.byStatus?.kabul || 0;
      const completed = data.byStatus?.tamamlandi || 0;

      statsEl.innerHTML = `
        <div class="stat"><span class="stat-num">${data.total || 0}</span><div class="stat-label">Toplam Başvuru</div></div>
        <div class="stat"><span class="stat-num">${approved + completed}</span><div class="stat-label">Kabul Edilen</div></div>
        <div class="stat"><span class="stat-num">${window.CAKU.formatTL(
          data.approvedBudget || 0
        )}</span><div class="stat-label">Aktarılan Hibe</div></div>
        <div class="stat"><span class="stat-num">${data.erasmusPipeline || 0}</span><div class="stat-label">Erasmus+ Pipeline</div></div>
      `;
    } catch (e) {
      console.error('İstatistik yüklenemedi', e);
    }
  }

  document.addEventListener('DOMContentLoaded', loadStats);
})();
