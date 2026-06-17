# veri_merkezi.py
# TÜİK ve Çevre, Şehircilik ve İklim Değişikliği Bakanlığı referans verilerini içeren veri merkezi

# 1. Şehir Bazlı Veriler (TÜİK - Örneklem)
# population: Şehir Nüfusu
# yearly_waste_per_capita_kg: Kişi başı yıllık ortalama atık miktarı (kg)
SEHIR_VERILERI = {
    "Istanbul": {"population": 15655924, "yearly_waste_per_capita_kg": 400},
    "Ankara":   {"population": 5803482,  "yearly_waste_per_capita_kg": 380},
    "Izmir":    {"population": 4479525,  "yearly_waste_per_capita_kg": 395},
    "Antalya":  {"population": 2696249,  "yearly_waste_per_capita_kg": 410},
    "Denizli":  {"population": 1059082,  "yearly_waste_per_capita_kg": 360},
    "Burdur":   {"population": 277452,   "yearly_waste_per_capita_kg": 340}
}

# 2. Evsel Atık Dağılım Sabitleri (Bakanlık Raporları Bazlı %)
ATIK_DAGILIM_ORANLARI = {
    "organik": 0.45,  # %45 Organik ve Mutfak atığı
    "plastik": 0.15,  # %15 Plastik
    "kagit":   0.10,  # %10 Kağıt ve Karton
    "cam":     0.05,  # %5 Cam
    "metal":   0.05,  # %5 Metal
    "diger":   0.20   # %20 Diğer atıklar (Tekstil, kül, vb.)
}

# 3. Ekonomik ve Ekolojik Sabitler
# Ton başına ham madde ithalat tasarrufu (Devlet bütçesine katkı - TL cinsinden)
ITHALAT_TASARRUF_TL_TON = {
    "plastik": 15000, # 1 ton plastiğin geri dönüşümünden sağlanan tasarruf (TL)
    "kagit":   8000,  # 1 ton kağıttan sağlanan tasarruf
    "cam":     3000,  # 1 ton camdan sağlanan tasarruf
    "metal":   25000  # 1 ton metalden sağlanan tasarruf
}

# Ekolojik Sabitler
AGAC_KURTARMA_SABITI = 17 # 1 Ton kağıt geri dönüşümü = 17 ağaç

# 4. Belediye Lojistik ve Çöp Toplama Maliyeti Sabitleri
BELEDIYE_LOJISTIK = {
    "kamyon_kapasitesi_ton": 15,          # Bir çöp kamyonunun ortalama tonaj kapasitesi
    "sefer_yakit_litre": 25,              # Bir seferde (Toplama + Döküm Alanı gidiş-dönüş) harcanan ortalama yakıt (Litre)
    "guncel_mazot_fiyati_tl": 42.50       # 1 Litre motorin/mazot fiyatı (TL)
}
