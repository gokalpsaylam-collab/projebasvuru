// Başvuru formu - gönderim (localStorage tabanlı)
(function () {
  function showAlert(type, html) {
    const area = document.getElementById('alert-area');
    area.innerHTML = `<div class="alert alert-${type}">${html}</div>`;
    area.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('application-form');
    const submitBtn = document.getElementById('submit-btn');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {};
      for (const [k, v] of fd.entries()) {
        payload[k] = v;
      }
      payload.erasmusInterest = form.erasmusInterest.checked;

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<span class="spinner"></span> Gönderiliyor...';

      const result = window.CAKUStorage.create(payload);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      if (result.error) {
        const missing = (result.missing || [])
          .map((m) => `<code>${m}</code>`)
          .join(', ');
        showAlert(
          'error',
          `<strong>Başvuru gönderilemedi.</strong> ${result.error || ''} ${
            missing ? 'Eksik alanlar: ' + missing : ''
          }`
        );
        return;
      }

      form.reset();
      showAlert(
        'success',
        `<strong>Başvurunuz başarıyla alındı.</strong> Başvuru kodunuz:
        <code>${result.application.id}</code><br/>
        Başvurunuz tarayıcınızda saklanmaktadır. Komisyon üyesi
        "Değerlendirme" sayfası üzerinden projenizi puanlayabilir.
        <div style="margin-top:10px;">
          <a href="basvurular.html" class="btn btn-ghost">Tüm Başvurular</a>
          <a href="index.html" class="btn btn-ghost">Ana Sayfa</a>
        </div>`
      );
    });
  });
})();
