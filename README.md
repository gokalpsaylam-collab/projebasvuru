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

## GitHub Pages ile Yayınlama (Actions'sız)

Bu depoda tüm statik dosyalar `docs/` klasöründe bulunur; GitHub Pages'i
doğrudan `main` dalındaki `/docs` klasöründen yayınlamak için:

1. GitHub deposunu aç → **Settings** → **Pages**
2. **Build and deployment → Source**: `Deploy from a branch` seç
3. **Branch**: `main` / `/docs` seç ve **Save**'e bas
4. Birkaç dakika içinde site şu adreste yayına girer:
   `https://gokalpsaylam-collab.github.io/projebasvuru/`

> `docs/.nojekyll` dosyası zaten mevcut olduğu için GitHub Pages Jekyll
> işlemi yapmaz, dosyalar olduğu gibi servis edilir.

### Yerel Test

Sunucuya gerek olmadan `docs/index.html` dosyasını çift tıklayarak
tarayıcıda açabilirsin. Veya Python kullanıyorsan:

```bash
cd docs
python3 -m http.server 8080
```

Ardından `http://localhost:8080` adresini aç.

## Veri Saklama

> ⚠️ **Önemli:** Statik (GitHub Pages) modunda veriler kullanıcının
> tarayıcısındaki `localStorage`'da saklanır ve **cihazlar arasında
> senkronize olmaz**. Paylaşılan veri deposu gerekli ise aşağıdaki
> Express backend seçeneğini kullan.

Konsoldan veri dışa/içe aktarımı:

```js
copy(CAKUStorage.exportData())   // Dışa aktar
CAKUStorage.importData(jsonStr)  // İçe aktar
CAKUStorage.clearAll()           // Temizle
```

## (Opsiyonel) Express Backend ile Kullanım

Çok kullanıcılı paylaşılan bir sunucu isterseniz projeyle birlikte gelen
Express.js sunucusunu çalıştırabilirsiniz. Gereksinim: Node.js 18+

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
└── docs/                    # GitHub Pages bu klasörden servis edilir
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
