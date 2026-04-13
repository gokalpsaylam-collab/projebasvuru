/**
 * ÇAKÜ Mikro Hibe Proje Başvuru Platformu
 * Basit Express tabanlı sunucu, JSON dosyası üzerinde çalışır.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ applications: [] }, null, 2));
}

function readDB() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { applications: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function genId() {
  return 'PRJ-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'ÇAKÜ Mikro Hibe Platformu' });
});

// Tüm başvuruları getir
app.get('/api/applications', (req, res) => {
  const db = readDB();
  const { status, category } = req.query;
  let list = db.applications;
  if (status) list = list.filter((a) => a.status === status);
  if (category) list = list.filter((a) => a.category === category);
  // Özet alanları döndür
  const summary = list.map((a) => ({
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
  res.json({ applications: summary, total: summary.length });
});

// Tekil başvuru
app.get('/api/applications/:id', (req, res) => {
  const db = readDB();
  const item = db.applications.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Başvuru bulunamadı' });
  res.json(item);
});

// Yeni başvuru
app.post('/api/applications', (req, res) => {
  const b = req.body || {};
  const required = [
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
  const missing = required.filter((k) => !b[k] || String(b[k]).trim() === '');
  if (missing.length) {
    return res.status(400).json({
      error: 'Eksik alanlar mevcut',
      missing,
    });
  }

  const budget = Number(b.budget);
  const duration = Number(b.duration);
  if (Number.isNaN(budget) || budget <= 0 || budget > 3000) {
    return res
      .status(400)
      .json({ error: 'Bütçe 1 ile 3000 TL arasında olmalıdır.' });
  }
  if (Number.isNaN(duration) || duration < 1 || duration > 3) {
    return res
      .status(400)
      .json({ error: 'Proje süresi 1 ile 3 ay arasında olmalıdır.' });
  }

  const db = readDB();
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evaluations: [],
    averageScore: null,
    decisionNote: '',
  };

  db.applications.push(application);
  writeDB(db);
  res.status(201).json({ ok: true, application });
});

// Değerlendirme ekle
app.post('/api/applications/:id/evaluate', (req, res) => {
  const { evaluator, innovation, feasibility, impact, sustainability, spread, note } =
    req.body || {};
  const scores = { innovation, feasibility, impact, sustainability, spread };
  for (const [k, v] of Object.entries(scores)) {
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || n > 20) {
      return res
        .status(400)
        .json({ error: `Geçersiz puan alanı: ${k} (0-20 arası olmalı)` });
    }
  }
  if (!evaluator || String(evaluator).trim() === '') {
    return res.status(400).json({ error: 'Değerlendirici adı zorunludur' });
  }

  const db = readDB();
  const item = db.applications.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Başvuru bulunamadı' });

  const total =
    Number(innovation) +
    Number(feasibility) +
    Number(impact) +
    Number(sustainability) +
    Number(spread);

  const evaluation = {
    evaluator: String(evaluator).trim(),
    scores: {
      innovation: Number(innovation),
      feasibility: Number(feasibility),
      impact: Number(impact),
      sustainability: Number(sustainability),
      spread: Number(spread),
    },
    total,
    note: note ? String(note).trim() : '',
    createdAt: new Date().toISOString(),
  };

  item.evaluations = item.evaluations || [];
  item.evaluations.push(evaluation);
  const avg =
    item.evaluations.reduce((s, e) => s + e.total, 0) / item.evaluations.length;
  item.averageScore = Math.round(avg * 100) / 100;
  item.status = 'degerlendirildi';
  item.updatedAt = new Date().toISOString();

  writeDB(db);
  res.json({ ok: true, application: item });
});

// Başvuru durumu güncelle (komisyon kararı)
app.post('/api/applications/:id/decision', (req, res) => {
  const { status, decisionNote } = req.body || {};
  const allowed = [
    'basvuruldu',
    'on-degerlendirme',
    'degerlendirildi',
    'kabul',
    'red',
    'tamamlandi',
  ];
  if (!allowed.includes(status)) {
    return res
      .status(400)
      .json({ error: 'Geçersiz durum', allowed });
  }
  const db = readDB();
  const item = db.applications.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Başvuru bulunamadı' });

  item.status = status;
  if (decisionNote !== undefined) item.decisionNote = String(decisionNote);
  item.updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ ok: true, application: item });
});

// İstatistik
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const apps = db.applications;
  const byStatus = {};
  const byCategory = {};
  const byApplicantType = {};
  let totalBudget = 0;
  let approvedBudget = 0;

  for (const a of apps) {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
    byApplicantType[a.applicantType] = (byApplicantType[a.applicantType] || 0) + 1;
    totalBudget += Number(a.budget) || 0;
    if (a.status === 'kabul' || a.status === 'tamamlandi') {
      approvedBudget += Number(a.budget) || 0;
    }
  }

  res.json({
    total: apps.length,
    byStatus,
    byCategory,
    byApplicantType,
    totalRequestedBudget: totalBudget,
    approvedBudget,
    erasmusPipeline: apps.filter((a) => a.erasmusInterest).length,
  });
});

// SPA fallback için temel rotalar - public'teki html dosyalarına yönlendir
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ÇAKÜ Mikro Hibe Platformu http://localhost:${PORT} adresinde çalışıyor`);
});
