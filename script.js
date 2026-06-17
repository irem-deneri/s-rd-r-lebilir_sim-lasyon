// script.js
// Python veri_merkezi.py dosyasındaki verilerin JS karşılığı (Deterministik ve Kesin)

const SEHIR_VERILERI = {
    "Istanbul": { population: 15655924, yearly_waste_per_capita_kg: 400 },
    "Ankara":   { population: 5803482,  yearly_waste_per_capita_kg: 380 },
    "Izmir":    { population: 4479525,  yearly_waste_per_capita_kg: 395 },
    "Antalya":  { population: 2696249,  yearly_waste_per_capita_kg: 410 },
    "Denizli":  { population: 1059082,  yearly_waste_per_capita_kg: 360 },
    "Burdur":   { population: 277452,   yearly_waste_per_capita_kg: 340 }
};

const ATIK_DAGILIM_ORANLARI = {
    "organik": 0.45,
    "plastik": 0.15,
    "kagit":   0.10,
    "cam":     0.05,
    "metal":   0.05,
    "diger":   0.20
};

const ITHALAT_TASARRUF_TL_TON = {
    "plastik": 15000,
    "kagit":   8000,
    "cam":     3000,
    "metal":   25000
};

const AGAC_KURTARMA_SABITI = 17;

const BELEDIYE_LOJISTIK = {
    kamyon_kapasitesi_ton: 15,
    sefer_yakit_litre: 25,
    guncel_mazot_fiyati_tl: 42.50
};

// DOM Elementlerini Seçme
const citySelect = document.getElementById("citySelect");
const sliders = {
    "organik": document.getElementById("slider_organik"),
    "plastik": document.getElementById("slider_plastik"),
    "kagit": document.getElementById("slider_kagit"),
    "cam": document.getElementById("slider_cam"),
    "metal": document.getElementById("slider_metal")
};

const labels = {
    "organik": document.getElementById("val_organik"),
    "plastik": document.getElementById("val_plastik"),
    "kagit": document.getElementById("val_kagit"),
    "cam": document.getElementById("val_cam"),
    "metal": document.getElementById("val_metal")
};

// Çıktı Elementleri
const resDevlet = document.getElementById("res_devlet");
const resBelediye = document.getElementById("res_belediye");
const resKamyon = document.getElementById("res_kamyon");
const resAgac = document.getElementById("res_agac");
const resAtik = document.getElementById("res_atik");
const resToplamAtik = document.getElementById("res_toplam_atik");

const indexValue = document.getElementById("indexValue");
const indexCircle = document.getElementById("indexCircle");
const statusMessage = document.getElementById("statusMessage");

// Sayı formatlayıcı
const formatTL = (num) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(num) + " ₺";
const formatNumber = (num) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(num);

// Grafik Nesnesi
let simChart = null;

// Hesaplama Motoru (Python simulasyon_motoru.py'nin Birebir Kopyası)
function hesaplaVeGuncelle() {
    const sehirAdi = citySelect.value;
    const sehir = SEHIR_VERILERI[sehirAdi];
    const nufus = sehir.population;
    const kisi_basi_atik = sehir.yearly_waste_per_capita_kg;

    // Kullanıcı oranlarını çek
    const katilimOranlari = {};
    for (const key in sliders) {
        katilimOranlari[key] = parseFloat(sliders[key].value);
        labels[key].innerText = katilimOranlari[key];
    }

    // 1. Toplam Atık
    const toplam_atik_ton = (nufus * kisi_basi_atik) / 1000;

    // 2. Türlere göre üretim
    const uretilen_atiklar_ton = {
        "organik": toplam_atik_ton * ATIK_DAGILIM_ORANLARI["organik"],
        "plastik": toplam_atik_ton * ATIK_DAGILIM_ORANLARI["plastik"],
        "kagit":   toplam_atik_ton * ATIK_DAGILIM_ORANLARI["kagit"],
        "cam":     toplam_atik_ton * ATIK_DAGILIM_ORANLARI["cam"],
        "metal":   toplam_atik_ton * ATIK_DAGILIM_ORANLARI["metal"]
    };

    // 3. Geri dönüştürülen miktar
    const geri_donusturulen_ton = {};
    let toplam_kurtarilan_ton = 0;
    for (const tur in uretilen_atiklar_ton) {
        const kurtarilan = uretilen_atiklar_ton[tur] * (katilimOranlari[tur] / 100.0);
        geri_donusturulen_ton[tur] = kurtarilan;
        toplam_kurtarilan_ton += kurtarilan;
    }

    // 4. Lojistik ve Yakıt Tasarrufu
    const azalan_kamyon_seferi = toplam_kurtarilan_ton / BELEDIYE_LOJISTIK.kamyon_kapasitesi_ton;
    const belediye_yakit_tasarrufu_tl = azalan_kamyon_seferi * BELEDIYE_LOJISTIK.sefer_yakit_litre * BELEDIYE_LOJISTIK.guncel_mazot_fiyati_tl;

    // 5. Devlet Kazancı (İthalat)
    const devlet_kazanci_tl = (
        geri_donusturulen_ton["plastik"] * ITHALAT_TASARRUF_TL_TON["plastik"] +
        geri_donusturulen_ton["kagit"] * ITHALAT_TASARRUF_TL_TON["kagit"] +
        geri_donusturulen_ton["cam"] * ITHALAT_TASARRUF_TL_TON["cam"] +
        geri_donusturulen_ton["metal"] * ITHALAT_TASARRUF_TL_TON["metal"]
    );

    // 6. Kurtarılan Ağaç
    const kurtarilan_agac_sayisi = geri_donusturulen_ton["kagit"] * AGAC_KURTARMA_SABITI;

    // 7. Endeks Puanı
    let maksimum_kurtarilabilir_ton = 0;
    for (const tur in uretilen_atiklar_ton) {
        maksimum_kurtarilabilir_ton += uretilen_atiklar_ton[tur];
    }
    
    let endeks_puani = 0;
    if (maksimum_kurtarilabilir_ton > 0) {
        endeks_puani = (toplam_kurtarilan_ton / maksimum_kurtarilabilir_ton) * 100;
    }

    // Arayüzü Güncelleme
    resDevlet.innerText = formatTL(devlet_kazanci_tl);
    resBelediye.innerText = formatTL(belediye_yakit_tasarrufu_tl);
    resKamyon.innerText = formatNumber(azalan_kamyon_seferi) + " Sefer İptali";
    resAgac.innerText = formatNumber(kurtarilan_agac_sayisi);
    resAtik.innerText = formatNumber(toplam_kurtarilan_ton) + " Ton";
    resToplamAtik.innerText = formatNumber(toplam_atik_ton);
    
    indexValue.innerText = endeks_puani.toFixed(1);

    // Renk ve CSS Durumu Güncelleme
    updateUIColors(endeks_puani);

    // Grafiği Güncelle
    updateChart(
        geri_donusturulen_ton["organik"], 
        geri_donusturulen_ton["plastik"], 
        geri_donusturulen_ton["kagit"], 
        geri_donusturulen_ton["cam"], 
        geri_donusturulen_ton["metal"]
    );
}

function updateUIColors(endeks) {
    indexCircle.classList.remove('status-red', 'status-yellow', 'status-green');
    
    // CSS variable için yüzde ayarı
    indexCircle.style.setProperty('--perc', `${endeks}%`);

    if (endeks < 30) {
        indexCircle.classList.add('status-red');
        statusMessage.innerText = "Kritik Kirlilik / Büyük İsraf";
        statusMessage.style.color = "#ef4444";
    } else if (endeks < 70) {
        indexCircle.classList.add('status-yellow');
        statusMessage.innerText = "Gelişmekte / Orta Sürdürülebilirlik";
        statusMessage.style.color = "#f59e0b";
    } else {
        indexCircle.classList.add('status-green');
        statusMessage.innerText = "Mükemmel Tasarruf ve Çevre Dostu";
        statusMessage.style.color = "#10b981";
    }
}

function updateChart(organik, plastik, kagit, cam, metal) {
    const ctx = document.getElementById('simCanvas');
    if (!ctx) return;

    if (simChart) {
        simChart.destroy();
    }

    simChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Organik', 'Plastik', 'Kağıt', 'Cam', 'Metal'],
            datasets: [{
                label: 'Kurtarılan Atık (Ton)',
                data: [organik, plastik, kagit, cam, metal],
                backgroundColor: [
                    '#10b981', // green
                    '#3b82f6', // blue
                    '#f59e0b', // yellow
                    '#06b6d4', // cyan
                    '#8b5cf6'  // purple
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function exportToCSV() {
    const sehirAdi = citySelect.options[citySelect.selectedIndex].text;
    let csvContent = "data:text/csv;charset=utf-8,Parametre,Deger\n";
    csvContent += `Sehir,${sehirAdi}\n`;
    csvContent += `Kirlilik Endeksi,${indexValue.innerText}\n`;
    csvContent += `Devlet Butcesi Kazanci,${resDevlet.innerText}\n`;
    csvContent += `Belediye Tasarrufu,${resBelediye.innerText}\n`;
    csvContent += `Iptal Edilen Sefer,${resKamyon.innerText}\n`;
    csvContent += `Kurtarilan Agac,${resAgac.innerText}\n`;
    csvContent += `Donusturulen Atik,${resAtik.innerText}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Geri_Donusum_Raporu_${citySelect.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Olay Dinleyicileri (Event Listeners)
citySelect.addEventListener("change", hesaplaVeGuncelle);
for (const key in sliders) {
    sliders[key].addEventListener("input", hesaplaVeGuncelle);
}

document.getElementById("downloadBtn").addEventListener("click", exportToCSV);

// İlk Açılış Hesaplamasını Hemen Çalıştır (DOM zaten yüklü)
hesaplaVeGuncelle();

// Ayrıca garanti olması için window.onload'a da bağlayalım
window.addEventListener('load', hesaplaVeGuncelle);
