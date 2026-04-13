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
- JSON dosyası üzerinde çalışan basit Express.js backend

## Destek Koşulları

| Parametre              | Değer            |
|------------------------|------------------|
| Proje başına maks. destek | **3.000 TL**  |
| Proje süresi            | **1–3 ay**      |
| Dönemlik çağrı sayısı   | **2–3**         |
| Hedef yıllık proje sayısı | **20–50**     |

## Değerlendirme Kriterleri

Her kriter 0–20 puan, toplam 100 puan üzerinden:

1. **Yenilikçilik**
2. **Uygulanabilirlik**
3. **Sosyal Etki**
4. **Sürdürülebilirlik**
5. **Yaygınlaştırılabilirlik**

## Kurulum

Gereksinim: Node.js 18+

```bash
npm install
npm start
```

Sunucu `http://localhost:3000` adresinde çalışır.

## API Uç Noktaları

| Yöntem | Uç nokta                              | Açıklama                          |
|--------|---------------------------------------|-----------------------------------|
| GET    | `/api/health`                         | Sağlık kontrolü                  |
| GET    | `/api/stats`                          | Platform istatistikleri           |
| GET    | `/api/applications`                   | Tüm başvuru özetleri              |
| GET    | `/api/applications/:id`               | Tek başvuru detayı                |
| POST   | `/api/applications`                   | Yeni başvuru oluştur              |
| POST   | `/api/applications/:id/evaluate`      | Değerlendirme ekle                |
| POST   | `/api/applications/:id/decision`      | Komisyon kararı güncelle          |

## Dosya Yapısı

```
projebasvuru/
├── server.js            # Express sunucu + API
├── package.json
├── data/
│   └── applications.json  # Başvuru veri deposu (otomatik oluşur)
└── public/
    ├── index.html        # Ana sayfa
    ├── basvuru.html      # Başvuru formu
    ├── basvurular.html   # Başvuru listesi (komisyon)
    ├── degerlendirme.html# Değerlendirme paneli
    ├── surec.html        # Süreç akışı
    ├── hakkinda.html     # Hakkında
    ├── css/style.css
    └── js/
        ├── nav.js        # Ortak header/footer + yardımcılar
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

## Lisans

MIT · © Çankırı Karatekin Üniversitesi TTO
