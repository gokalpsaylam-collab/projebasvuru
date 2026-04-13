// Değerlendirme sayfası
(function () {
  const scoreIds = ['innovation', 'feasibility', 'impact', 'sustainability', 'spread'];

  function showAlert(type, html) {
    document.getElementById('alert-area').innerHTML =
      `<div class="alert alert-${type}">${html}</div>`;
  }

  function updateTotal() {
    const total = scoreIds.reduce((s, id) => {
      const v = Number(document.getElementById(id).value) || 0;
      return s + v;
    }, 0);
    document.getElementById('total-val').textContent = total;
  }

  async function loadApps(preselectId) {
    const sel = document.getElementById('pick-app');
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      const items = data.applications || [];
      if (items.length === 0) {
        sel.innerHTML = '<option value="">Henüz başvuru yok</option>';
        return;
      }
      sel.innerHTML =
        '<option value="">Seçiniz...</option>' +
        items
          .map(
            (a) =>
              `<option value="${a.id}">${a.id} · ${a.projectName} (${a.applicantName})</option>`
          )
          .join('');
      if (preselectId) {
        sel.value = preselectId;
        sel.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      sel.innerHTML = '<option value="">Yüklenemedi</option>';
    }
  }

  async function loadSummary(id) {
    const box = document.getElementById('app-summary');
    const form = document.getElementById('eval-form');
    if (!id) {
      box.classList.add('hidden');
      form.classList.add('hidden');
      return;
    }
    try {
      const res = await fetch(`/api/applications/${id}`);
      const a = await res.json();
      if (!res.ok) {
        box.innerHTML = `<div class="alert alert-error">${a.error || 'Yüklenemedi'}</div>`;
        box.classList.remove('hidden');
        return;
      }
      box.innerHTML = `
        <h2>${window.CAKU.escape(a.projectName)}</h2>
        <div class="app-meta">
          <span>#${a.id}</span>
          <span>👤 ${window.CAKU.escape(a.applicantName)}</span>
          <span>📂 ${window.CAKU.categoryLabel(a.category)}</span>
          <span>₺ ${window.CAKU.formatTL(a.budget)}</span>
          <span>⏱ ${a.duration} ay</span>
          <span class="badge badge-${a.status}">${window.CAKU.statusLabel(a.status)}</span>
        </div>
        <dl>
          <dt>Amaç</dt><dd>${window.CAKU.escape(a.objective)}</dd>
          <dt>Hedef Kitle</dt><dd>${window.CAKU.escape(a.targetAudience)}</dd>
          <dt>Faaliyet Planı</dt><dd>${window.CAKU.escape(a.activityPlan)}</dd>
          <dt>Beklenen Çıktı</dt><dd>${window.CAKU.escape(a.expectedOutcome)}</dd>
          <dt>Ekip</dt><dd>${window.CAKU.escape(a.team)}</dd>
        </dl>
        ${
          a.averageScore !== null
            ? `<p style="margin-top:10px;">Mevcut ortalama: <strong>${a.averageScore}/100</strong> (${a.evaluations.length} değerlendirici)</p>`
            : ''
        }
      `;
      box.classList.remove('hidden');
      form.classList.remove('hidden');
    } catch (e) {
      box.innerHTML = '<div class="alert alert-error">Hata oluştu.</div>';
      box.classList.remove('hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    loadApps(params.get('id'));

    const sel = document.getElementById('pick-app');
    sel.addEventListener('change', () => loadSummary(sel.value));

    scoreIds.forEach((id) => {
      document.getElementById(id).addEventListener('input', updateTotal);
    });
    updateTotal();

    document.getElementById('eval-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = sel.value;
      if (!id) {
        showAlert('error', 'Lütfen bir başvuru seçin.');
        return;
      }
      const payload = {
        evaluator: document.getElementById('evaluator').value.trim(),
        innovation: Number(document.getElementById('innovation').value),
        feasibility: Number(document.getElementById('feasibility').value),
        impact: Number(document.getElementById('impact').value),
        sustainability: Number(document.getElementById('sustainability').value),
        spread: Number(document.getElementById('spread').value),
        note: document.getElementById('note').value.trim(),
      };
      try {
        const res = await fetch(`/api/applications/${id}/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          showAlert('error', data.error || 'Değerlendirme kaydedilemedi.');
          return;
        }
        showAlert(
          'success',
          `Değerlendirme kaydedildi. Güncel ortalama: <strong>${data.application.averageScore}/100</strong>`
        );
        loadSummary(id);
      } catch (err) {
        showAlert('error', 'Bağlantı hatası oluştu.');
      }
    });
  });
})();
