// Başvuru formu - gönderim mantığı
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

    form.addEventListener('submit', async (e) => {
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

      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          const missing = (data.missing || [])
            .map((m) => `<code>${m}</code>`)
            .join(', ');
          showAlert(
            'error',
            `<strong>Başvuru gönderilemedi.</strong> ${data.error || ''} ${
              missing ? 'Eksik alanlar: ' + missing : ''
            }`
          );
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          return;
        }

        form.reset();
        showAlert(
          'success',
          `<strong>Başvurunuz başarıyla alındı.</strong> Başvuru kodunuz:
          <code>${data.application.id}</code><br/>
          Ön değerlendirme sonucu e-posta adresinize bildirilecektir.
          <div style="margin-top:10px;">
            <a href="basvurular.html" class="btn btn-ghost">Tüm Başvurular</a>
            <a href="index.html" class="btn btn-ghost">Ana Sayfa</a>
          </div>`
        );
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      } catch (err) {
        showAlert(
          'error',
          '<strong>Bağlantı hatası.</strong> Lütfen daha sonra tekrar deneyin.'
        );
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
})();
