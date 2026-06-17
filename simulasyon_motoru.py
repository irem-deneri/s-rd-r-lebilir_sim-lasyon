# simulasyon_motoru.py
import veri_merkezi as vm

def sehir_simulasyonunu_calistir(sehir_adi, katilim_oranlari):
    """
    Belirtilen şehir ve ayrıştırma katılım oranlarına göre atık yönetimi simülasyonunu çalıştırır.
    
    Parametreler:
    - sehir_adi (str): Şehir adı (Örn: "Istanbul", "Burdur")
    - katilim_oranlari (dict): Kullanıcının belirlediği ayrıştırma başarı oranları (0-100 arası).
      Örn: {"organik": 50, "plastik": 40, "kagit": 60, "cam": 30, "metal": 20}
      
    Dönen Değer (dict): Hesaplanan sonuçları içeren sözlük.
    """
    
    if sehir_adi not in vm.SEHIR_VERILERI:
        raise ValueError(f"Şehir bulunamadı: {sehir_adi}")

    sehir = vm.SEHIR_VERILERI[sehir_adi]
    nufus = sehir["population"]
    kisi_basi_atik = sehir["yearly_waste_per_capita_kg"]

    # 1. Toplam Atık Üretimi (Yıllık - Ton cinsinden)
    toplam_atik_ton = (nufus * kisi_basi_atik) / 1000

    # 2. Atık Türlerine Göre Üretilen Miktarlar (Ton)
    uretilen_atiklar_ton = {
        "organik": toplam_atik_ton * vm.ATIK_DAGILIM_ORANLARI["organik"],
        "plastik": toplam_atik_ton * vm.ATIK_DAGILIM_ORANLARI["plastik"],
        "kagit":   toplam_atik_ton * vm.ATIK_DAGILIM_ORANLARI["kagit"],
        "cam":     toplam_atik_ton * vm.ATIK_DAGILIM_ORANLARI["cam"],
        "metal":   toplam_atik_ton * vm.ATIK_DAGILIM_ORANLARI["metal"]
    }

    # 3. Geri Dönüşüme / Komposta Giden Miktarlar (Ton)
    geri_donusturulen_ton = {
        tur: (uretilen_atiklar_ton[tur] * (katilim_oranlari.get(tur, 0) / 100.0))
        for tur in uretilen_atiklar_ton
    }

    # Çöpe gitmekten kurtarılan toplam miktar (Ton)
    toplam_kurtarilan_ton = sum(geri_donusturulen_ton.values())
    
    # 4. Belediye Lojistik Tasarrufu Hesaplaması
    # Organik atıklar dahil kurtarılan tüm atıkların çöplüğe gitmemesiyle azalan sefer sayısı
    azalan_kamyon_seferi = toplam_kurtarilan_ton / vm.BELEDIYE_LOJISTIK["kamyon_kapasitesi_ton"]
    
    # Yakıt Tasarrufu (TL)
    belediye_yakit_tasarrufu_tl = azalan_kamyon_seferi * vm.BELEDIYE_LOJISTIK["sefer_yakit_litre"] * vm.BELEDIYE_LOJISTIK["guncel_mazot_fiyati_tl"]

    # 5. Devlet Bütçesi Kazancı (İthalat Tasarrufu - TL)
    devlet_kazanci_tl = (
        geri_donusturulen_ton["plastik"] * vm.ITHALAT_TASARRUF_TL_TON["plastik"] +
        geri_donusturulen_ton["kagit"] * vm.ITHALAT_TASARRUF_TL_TON["kagit"] +
        geri_donusturulen_ton["cam"] * vm.ITHALAT_TASARRUF_TL_TON["cam"] +
        geri_donusturulen_ton["metal"] * vm.ITHALAT_TASARRUF_TL_TON["metal"]
    )

    # 6. Kurtarılan Ağaç Sayısı
    kurtarilan_agac_sayisi = geri_donusturulen_ton["kagit"] * vm.AGAC_KURTARMA_SABITI

    # 7. Şehrin Kirlilik / Tasarruf Endeksi (0 ile 100 arası)
    # 0: Tamamen kirli ve israf (Hiçbir şey geri dönüştürülmüyor)
    # 100: Mükemmel sürdürülebilirlik (Atıkların hepsi geri dönüştürülüyor)
    # Maksimum dönüştürülebilir atık = Toplam atığın %80'i (Kalan %20 'diger' kategorisi)
    maksimum_kurtarilabilir_ton = sum(uretilen_atiklar_ton.values())
    
    if maksimum_kurtarilabilir_ton > 0:
        endeks_puani = (toplam_kurtarilan_ton / maksimum_kurtarilabilir_ton) * 100
    else:
        endeks_puani = 0

    # Sonuçların döndürülmesi
    return {
        "sehir": sehir_adi,
        "nufus": nufus,
        "toplam_atik_ton": round(toplam_atik_ton, 2),
        "kurtarilan_atik_ton": round(toplam_kurtarilan_ton, 2),
        "azalan_kamyon_seferi": int(azalan_kamyon_seferi),
        "belediye_yakit_tasarrufu_tl": round(belediye_yakit_tasarrufu_tl, 2),
        "devlet_kazanci_tl": round(devlet_kazanci_tl, 2),
        "kurtarilan_agac_sayisi": int(kurtarilan_agac_sayisi),
        "endeks_puani": round(endeks_puani, 2)
    }

# Test için (sadece bu dosya doğrudan çalıştırıldığında)
if __name__ == "__main__":
    ornek_katilim = {
        "organik": 50,
        "plastik": 60,
        "kagit": 80,
        "cam": 40,
        "metal": 70
    }
    sonuc = sehir_simulasyonunu_calistir("Burdur", ornek_katilim)
    import pprint
    pprint.pprint(sonuc)
