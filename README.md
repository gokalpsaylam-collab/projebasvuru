# ÇAKÜ Mikro Hibe Proje Başvuru Platformu

Çankırı Karatekin Üniversitesi Teknoloji Transfer Ofisi (ÇAKÜ TTO) için
geliştirilen, akademik/idari personel, öğrenciler ve dış paydaşların
**sosyal sorumluluk**, **toplumsal farkındalık** ve **yerel kalkınma**
projelerine mikro hibe ile destek veren web platformu.

Aynı zamanda Erasmus+ (KA210/KA220) ve Ulusal Ajans projelerine **ön kuluçka**
(pre-incubation) görevi görür.

## Özellikler

- Ana sayfa: program tanıtımı ve canlı istatistikler
- Proje başvuru formu (amaç, hedef kitle, faaliyet planı, çıktı, bütçe, ekip)
- Tüm başvuruları listeleme, filtreleme ve arama
- Komisyon değerlendirme paneli (5 kriterde 0–20 puan)
- Başvuru detay sayfası + kabul/red/tamamlandı kararları
- 8 aşamalı süreç akışı sayfası
- **Saf statik** (HTML/CSS/JS) — GitHub Pages uyumlu, backend gerektirmez
- Veriler tarayıcıda `localStorage` üzerinde saklanır
- İsteğe bağlı Express.js backend (çok kullanıcılı paylaşılan kullanım için)

## Destek Koşulları

| Parametre                  | Değer          |
|----------------------------|----------------|
| Proje başına maks. destek  | **3.000 TL**   |
| Proje süresi               | **1–3 ay**     |
| Dönemlik çağrı sayısı      | **2–3**        |
| Hedef yıllık proje sayısı  | **20–50**      |

## Değerlendirme Kriterleri

Her kriter 0–20 puan, toplam 100 puan üzerinden:

1. **Yenilikçilik**
2. **Uygulanabilirlik**
3. **Sosyal Etki**
4. **Sürdürülebilirlik**
5. **Yaygınlaştırılabilirlik**

## GitHub Pages ile Yayınlama

Bu depoda yayınlama iki yoldan yapılabilir.

### Yöntem 1 — GitHub Actions (Önerilen)

Depoda `.github/workflows/deploy-pages.yml` hazır; sadece Pages'i Actions
üzerinden çalışacak şekilde ayarlayın:

1. GitHub deposunu açın → **Settings** → **Pages**
2. **Build and deployment** → **Source**: `GitHub Actions` seçin
3. Varsayılan `main` (veya geliştirme branch'iniz) dalına push atıldığında
   workflow otomatik çalışır ve `public/` klasörünü Pages'e deploy eder
4. Kaç saniye sonra sayfa `https://<kullanıcı>.github.io/projebasvuru/` veya
   organizasyon için `https://gokalpsaylam-collab.github.io/projebasvuru/`
   adresinde yayına girer

> Workflow hem `main` hem de `claude/university-funding-platform-vlgCv`
> branch'ini dinler; varsayılan dalı değiştirirseniz workflow'u da güncelleyin.

### Yöntem 2 — Manuel "Deploy from branch"

1. **Settings** → **Pages** → **Source**: `Deploy from a branch`
2. Branch: `main` seçin, klasör olarak **`/docs`** seçilmesi gerekir.
   Bunun için `public/` içeriğini deponun kökündeki `docs/` klasörüne
   kopyalayın veya sembolik bağ oluşturun.
3. Alternatif olarak `gh-pages` isminde bir dal oluşturup `public/` içeriğini
   oraya push edebilirsiniz.

### Yerel Test

Sunucuya gerek olmadan `public/index.html` dosyasını çift tıklayarak
tarayıcıda açabilirsiniz. Python kullanıyorsanız:

```bash
cd public
python3 -m http.server 8080
```

Ardından `http://localhost:8080` adresini açın.

## Veri Saklama

> ⚠️ **Önemli:** Statik (GitHub Pages) modunda veriler kullanıcının
> tarayıcısındaki `localStorage`'da saklanır ve **cihazlar arasında
> senkronize olmaz**. Paylaşılan veri deposu gerekli ise aşağıdaki
> Express backend seçeneğini kullanın.

Konsoldan veri dışa/içe aktarımı:

```js
// Dışa aktarım (JSON string)
copy(CAKUStorage.exportData())

// İçe aktarım
CAKUStorage.importData(jsonString)

// Hepsini temizle
CAKUStorage.clearAll()
```

## (Opsiyonel) Express Backend ile Kullanım

Çok kullanıcılı paylaşılan bir sunucu isterseniz projeyle birlikte gelen
Express.js sunucusunu çalıştırabilirsiniz. Bu durumda frontend otomatik
olarak `localStorage`'ı kullanmaya devam eder; paylaşılan depolama için
sayfa JS'lerini REST uç noktalarına bağlamanız gerekir (geçmiş Git
commit'lerinde `fetch` tabanlı sürüm bulunur).

Gereksinim: Node.js 18+

```bash
npm install
npm start   # http://localhost:3000
```

### API Uç Noktaları (yalnızca backend modu)

| Yöntem | Uç nokta                         | Açıklama                 |
|--------|----------------------------------|--------------------------|
| GET    | `/api/health`                    | Sağlık kontrolü          |
| GET    | `/api/stats`                     | İstatistikler            |
| GET    | `/api/applications`              | Başvuru listesi          |
| GET    | `/api/applications/:id`          | Tek başvuru              |
| POST   | `/api/applications`              | Yeni başvuru             |
| POST   | `/api/applications/:id/evaluate` | Değerlendirme ekle       |
| POST   | `/api/applications/:id/decision` | Komisyon kararı          |

## Dosya Yapısı

```
projebasvuru/
├── server.js                # Opsiyonel Express backend
├── package.json
├── .github/workflows/
│   └── deploy-pages.yml     # GitHub Pages otomatik deploy
└── public/                  # GitHub Pages'e yüklenen statik site
    ├── .nojekyll            # Jekyll işlemeyi devre dışı bırakır
    ├── index.html           # Ana sayfa
    ├── basvuru.html         # Başvuru formu
    ├── basvurular.html      # Başvuru listesi (komisyon)
    ├── degerlendirme.html   # Değerlendirme paneli
    ├── surec.html           # Süreç akışı
    ├── hakkinda.html        # Hakkında
    ├── css/style.css
    └── js/
        ├── nav.js           # Ortak header/footer + yardımcılar
        ├── storage.js       # localStorage veri deposu
        ├── home.js
        ├── basvuru.js
        ├── basvurular.js
        └── degerlendirme.js
```

## Yönetim Yapısı

- **Ana Yürütücü:** ÇAKÜ TTO
- **Alt Komisyon:** Sosyal Projeler Değerlendirme Kurulu (akademik + idari + dış paydaş)
- **Danışmanlık:** Başvuru sahiplerine TTO tarafından proje yazım desteği

## Geliştirme Yol Haritası

- [ ] En iyi projelere **büyüme hibesi** (10.000+ TL)
- [ ] Erasmus+ KA210 / KA220 otomatik yönlendirmesi
- [ ] Uluslararası AB partner eşleşme modülü (Portekiz vb.)
- [ ] Dijital sertifika ve rozet sistemi
- [ ] Yetkilendirme sistemi (TTO / Komisyon / Başvuru Sahibi rolleri)
- [ ] E-posta bildirim sistemi
- [ ] Supabase/Firebase gibi harici veri tabanına bağlanma seçeneği

## Lisans

MIT · © Çankırı Karatekin Üniversitesi TTO
