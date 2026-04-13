/**
 * ÇAKÜ Mikro Hibe - Tarayıcı taraflı depolama
 *
 * GitHub Pages gibi statik ortamlarda backend olmadığı için tüm veriler
 * kullanıcının tarayıcısında localStorage altında saklanır. API şekli
 * server.js'deki REST uç noktalarıyla uyumludur, böylece sayfa kodu
 * "fetch" yerine doğrudan CAKUStorage çağırabilir.
 */
(function () {
  const KEY = 'caku_applications_v1';
  const REQUIRED = [
    'projectName',
    'category',
    'applicantType',
    'applicantName',
    'email',
    'objective',
    'targetAudience',
    'activityPlan',
    'expectedOutcome',
    'budget',
    'duration',
    'team',
  ];
  const ALLOWED_STATUS = [
    'basvuruldu',
    'on-degerlendirme',
    'degerlendirildi',
    'kabul',
    'red',
    'tamamlandi',
  ];
  const SCORE_FIELDS = [
    'innovation',
    'feasibility',
    'impact',
    'sustainability',
    'spread',
  ];

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { applications: [] };
      const parsed = JSON.parse(raw);
      return parsed && Array.isArray(parsed.applications)
        ? parsed
        : { applications: [] };
    } catch (e) {
      return { applications: [] };
    }
  }

  function write(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error('Depolama başarısız (localStorage dolu olabilir)', e);
      return false;
    }
  }

  function genId() {
    const bytes = new Uint8Array(4);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return 'PRJ-' + hex.toUpperCase();
  }

  function list(filters) {
    const f = filters || {};
    const db = read();
    let items = db.applications.slice();
    if (f.status) items = items.filter((a) => a.status === f.status);
    if (f.category) items = items.filter((a) => a.category === f.category);
    // Tarihe göre tersten sırala (yeni en üstte)
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return items.map((a) => ({
      id: a.id,
      projectName: a.projectName,
      category: a.category,
      applicantType: a.applicantType,
      applicantName: a.applicantName,
      budget: a.budget,
      duration: a.duration,
      status: a.status,
      createdAt: a.createdAt,
      averageScore: a.averageScore || null,
      evaluationCount: (a.evaluations || []).length,
    }));
  }

  function get(id) {
    const db = read();
    return db.applications.find((a) => a.id === id) || null;
  }

  function create(body) {
    const b = body || {};
    const missing = REQUIRED.filter(
      (k) => b[k] === undefined || b[k] === null || String(b[k]).trim() === ''
    );
    if (missing.length) {
      return { error: 'Eksik alanlar mevcut', missing };
    }
    const budget = Number(b.budget);
    const duration = Number(b.duration);
    if (Number.isNaN(budget) || budget <= 0 || budget > 3000) {
      return { error: 'Bütçe 1 ile 3000 TL arasında olmalıdır.' };
    }
    if (Number.isNaN(duration) || duration < 1 || duration > 3) {
      return { error: 'Proje süresi 1 ile 3 ay arasında olmalıdır.' };
    }

    const db = read();
    const now = new Date().toISOString();
    const application = {
      id: genId(),
      projectName: String(b.projectName).trim(),
      category: String(b.category).trim(),
      applicantType: String(b.applicantType).trim(),
      applicantName: String(b.applicantName).trim(),
      email: String(b.email).trim(),
      phone: b.phone ? String(b.phone).trim() : '',
      unit: b.unit ? String(b.unit).trim() : '',
      objective: String(b.objective).trim(),
      targetAudience: String(b.targetAudience).trim(),
      activityPlan: String(b.activityPlan).trim(),
      expectedOutcome: String(b.expectedOutcome).trim(),
      budget,
      budgetBreakdown: b.budgetBreakdown ? String(b.budgetBreakdown).trim() : '',
      duration,
      team: String(b.team).trim(),
      erasmusInterest: Boolean(b.erasmusInterest),
      status: 'basvuruldu',
      createdAt: now,
      updatedAt: now,
      evaluations: [],
      averageScore: null,
      decisionNote: '',
    };
    db.applications.push(application);
    if (!write(db)) {
      return { error: 'Veri kaydedilemedi (localStorage dolu olabilir).' };
    }
    return { ok: true, application };
  }

  function evaluate(id, data) {
    const d = data || {};
    for (const f of SCORE_FIELDS) {
      const n = Number(d[f]);
      if (Number.isNaN(n) || n < 0 || n > 20) {
        return { error: 'Geçersiz puan alanı: ' + f + ' (0-20 arası olmalı)' };
      }
    }
    if (!d.evaluator || String(d.evaluator).trim() === '') {
      return { error: 'Değerlendirici adı zorunludur' };
    }
    const db = read();
    const item = db.applications.find((a) => a.id === id);
    if (!item) return { error: 'Başvuru bulunamadı' };

    const total = SCORE_FIELDS.reduce((s, f) => s + Number(d[f]), 0);
    const evaluation = {
      evaluator: String(d.evaluator).trim(),
      scores: {
        innovation: Number(d.innovation),
        feasibility: Number(d.feasibility),
        impact: Number(d.impact),
        sustainability: Number(d.sustainability),
        spread: Number(d.spread),
      },
      total,
      note: d.note ? String(d.note).trim() : '',
      createdAt: new Date().toISOString(),
    };

    item.evaluations = item.evaluations || [];
    item.evaluations.push(evaluation);
    const avg =
      item.evaluations.reduce((s, e) => s + e.total, 0) / item.evaluations.length;
    item.averageScore = Math.round(avg * 100) / 100;
    item.status = 'degerlendirildi';
    item.updatedAt = new Date().toISOString();

    write(db);
    return { ok: true, application: item };
  }

  function decide(id, status, decisionNote) {
    if (!ALLOWED_STATUS.includes(status)) {
      return { error: 'Geçersiz durum', allowed: ALLOWED_STATUS };
    }
    const db = read();
    const item = db.applications.find((a) => a.id === id);
    if (!item) return { error: 'Başvuru bulunamadı' };

    item.status = status;
    if (decisionNote !== undefined) item.decisionNote = String(decisionNote);
    item.updatedAt = new Date().toISOString();
    write(db);
    return { ok: true, application: item };
  }

  function stats() {
    const db = read();
    const apps = db.applications;
    const byStatus = {};
    const byCategory = {};
    const byApplicantType = {};
    let totalBudget = 0;
    let approvedBudget = 0;

    for (const a of apps) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
      byApplicantType[a.applicantType] =
        (byApplicantType[a.applicantType] || 0) + 1;
      totalBudget += Number(a.budget) || 0;
      if (a.status === 'kabul' || a.status === 'tamamlandi') {
        approvedBudget += Number(a.budget) || 0;
      }
    }

    return {
      total: apps.length,
      byStatus,
      byCategory,
      byApplicantType,
      totalRequestedBudget: totalBudget,
      approvedBudget,
      erasmusPipeline: apps.filter((a) => a.erasmusInterest).length,
    };
  }

  // Yönetim yardımcıları (konsoldan / ileride yönetim paneli için)
  function exportData() {
    return JSON.stringify(read(), null, 2);
  }

  function importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.applications)) {
        return { error: 'Geçersiz veri formatı' };
      }
      write(parsed);
      return { ok: true, count: parsed.applications.length };
    } catch (e) {
      return { error: 'JSON ayrıştırılamadı' };
    }
  }

  function clearAll() {
    localStorage.removeItem(KEY);
    return { ok: true };
  }

  window.CAKUStorage = {
    list,
    get,
    create,
    evaluate,
    decide,
    stats,
    exportData,
    importData,
    clearAll,
  };
})();
