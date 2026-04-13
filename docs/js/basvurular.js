// Başvuru listesi sayfası (localStorage tabanlı)
(function () {
  let allApps = [];

  function render() {
    const listEl = document.getElementById('app-list');
    const status = document.getElementById('filter-status').value;
    const category = document.getElementById('filter-category').value;
    const search = document.getElementById('filter-search').value.toLowerCase().trim();

    let list = allApps.slice();
    if (status) list = list.filter((a) => a.status === status);
    if (category) list = list.filter((a) => a.category === category);
    if (search) {
      list = list.filter(
        (a) =>
          (a.projectName || '').toLowerCase().includes(search) ||
          (a.applicantName || '').toLowerCase().includes(search) ||
          (a.id || '').toLowerCase().includes(search)
      );
    }

    if (list.length === 0) {
      listEl.innerHTML = `<div class="alert alert-info">Kriterlere uyan başvuru bulunamadı.</div>`;
      return;
    }

    listEl.innerHTML = list
      .map(
        (a) => `
      <div class="app-item">
        <div>
          <h4>${window.CAKU.escape(a.projectName)}</h4>
          <div class="app-meta">
            <span>#${window.CAKU.escape(a.id)}</span>
            <span>👤 ${window.CAKU.escape(a.applicantName)}</span>
            <span>📂 ${window.CAKU.categoryLabel(a.category)}</span>
            <span>₺ ${window.CAKU.formatTL(a.budget)}</span>
            <span>⏱ ${a.duration} ay</span>
            <span>📅 ${window.CAKU.formatDate(a.createdAt)}</span>
            ${
              a.averageScore !== null
                ? `<span>⭐ ${a.averageScore}/100 (${a.evaluationCount} değ.)</span>`
                : ''
            }
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <span class="badge badge-${a.status}">${window.CAKU.statusLabel(a.status)}</span>
          <button class="btn btn-ghost" data-id="${a.id}">Detay</button>
        </div>
      </div>
    `
      )
      .join('');

    listEl.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => openDetail(btn.dataset.id));
    });
  }

  function openDetail(id) {
    const detailEl = document.getElementById('detail');
    const contentEl = document.getElementById('detail-content');
    detailEl.classList.remove('hidden');
    detailEl.scrollIntoView({ behavior: 'smooth' });

    const a = window.CAKUStorage.get(id);
    if (!a) {
      contentEl.innerHTML = `<div class="alert alert-error">Başvuru bulunamadı.</div>`;
      return;
    }

    const evals = (a.evaluations || [])
      .map(
        (e) => `
        <div class="card" style="margin-top:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>${window.CAKU.escape(e.evaluator)}</strong>
            <span class="badge badge-degerlendirildi">${e.total}/100</span>
          </div>
          <div class="score-grid">
            <div class="score"><div class="val">${e.scores.innovation}</div><div class="lbl">Yenilikçilik</div></div>
            <div class="score"><div class="val">${e.scores.feasibility}</div><div class="lbl">Uygulanabilirlik</div></div>
            <div class="score"><div class="val">${e.scores.impact}</div><div class="lbl">Sosyal Etki</div></div>
            <div class="score"><div class="val">${e.scores.sustainability}</div><div class="lbl">Sürdürülebilirlik</div></div>
            <div class="score"><div class="val">${e.scores.spread}</div><div class="lbl">Yaygınlaştırma</div></div>
          </div>
          ${e.note ? `<p style="margin:6px 0 0;color:var(--text-muted);">${window.CAKU.escape(e.note)}</p>` : ''}
        </div>
      `
      )
      .join('');

    contentEl.innerHTML = `
      <div class="detail-card">
        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px;">
          <div>
            <h2>${window.CAKU.escape(a.projectName)}</h2>
            <div class="app-meta">
              <span>#${window.CAKU.escape(a.id)}</span>
              <span>📅 ${window.CAKU.formatDate(a.createdAt)}</span>
            </div>
          </div>
          <span class="badge badge-${a.status}">${window.CAKU.statusLabel(a.status)}</span>
        </div>

        <dl>
          <dt>Başvuru Sahibi</dt>
          <dd>${window.CAKU.escape(a.applicantName)} (${window.CAKU.applicantLabel(a.applicantType)})</dd>
          <dt>İletişim</dt>
          <dd>${window.CAKU.escape(a.email)} ${a.phone ? '· ' + window.CAKU.escape(a.phone) : ''}</dd>
          <dt>Birim / Bölüm</dt>
          <dd>${window.CAKU.escape(a.unit || '-')}</dd>
          <dt>Kategori</dt>
          <dd>${window.CAKU.categoryLabel(a.category)}</dd>
          <dt>Süre</dt>
          <dd>${a.duration} ay</dd>
          <dt>Talep Edilen Bütçe</dt>
          <dd>${window.CAKU.formatTL(a.budget)}</dd>
          <dt>Bütçe Kalemleri</dt>
          <dd>${window.CAKU.escape(a.budgetBreakdown || '-')}</dd>
          <dt>Amaç ve Hedefler</dt>
          <dd>${window.CAKU.escape(a.objective)}</dd>
          <dt>Hedef Kitle</dt>
          <dd>${window.CAKU.escape(a.targetAudience)}</dd>
          <dt>Faaliyet Planı</dt>
          <dd>${window.CAKU.escape(a.activityPlan)}</dd>
          <dt>Beklenen Çıktı / Etki</dt>
          <dd>${window.CAKU.escape(a.expectedOutcome)}</dd>
          <dt>Ekip</dt>
          <dd>${window.CAKU.escape(a.team)}</dd>
          <dt>Erasmus+ İlgi</dt>
          <dd>${a.erasmusInterest ? '✓ KA210/KA220 pipeline dahil' : '—'}</dd>
        </dl>
      </div>

      <div class="detail-card">
        <h3 style="margin-top:0;color:var(--primary);">Değerlendirmeler</h3>
        ${
          a.averageScore !== null
            ? `<p>Ortalama Puan: <strong>${a.averageScore}/100</strong> (${a.evaluations.length} değerlendirici)</p>`
            : '<p style="color:var(--text-muted);">Henüz değerlendirme yapılmamış.</p>'
        }
        ${evals}

        <div style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap;">
          <a href="degerlendirme.html?id=${a.id}" class="btn btn-primary">Değerlendirme Ekle</a>
          <button class="btn btn-ghost" data-status="kabul">Kabul Et</button>
          <button class="btn btn-ghost" data-status="red">Reddet</button>
          <button class="btn btn-ghost" data-status="tamamlandi">Tamamlandı</button>
        </div>
        ${a.decisionNote ? `<p style="margin-top:10px;"><strong>Karar Notu:</strong> ${window.CAKU.escape(a.decisionNote)}</p>` : ''}
      </div>
    `;

    contentEl.querySelectorAll('button[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const note = prompt('Karar notu (opsiyonel):', a.decisionNote || '');
        if (note === null) return;
        const r = window.CAKUStorage.decide(a.id, btn.dataset.status, note);
        if (r.ok) {
          loadList();
          openDetail(a.id);
        } else {
          alert(r.error || 'İşlem başarısız.');
        }
      });
    });
  }

  function loadList() {
    const listEl = document.getElementById('app-list');
    allApps = window.CAKUStorage.list();
    if (allApps.length === 0) {
      listEl.innerHTML = `
        <div class="alert alert-info">
          Henüz başvuru bulunmuyor. <a href="basvuru.html">İlk başvuruyu yapın</a>.
        </div>`;
      return;
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadList();
    ['filter-status', 'filter-category', 'filter-search'].forEach((id) => {
      document.getElementById(id).addEventListener('input', render);
    });
  });
})();
