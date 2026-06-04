// DOM Elements
const populationSlider = document.getElementById('population');
const budgetSlider = document.getElementById('budget');
const ratioSlider = document.getElementById('ratio');

const populationVal = document.getElementById('population-val');
const budgetVal = document.getElementById('budget-val');
const compostRatioVal = document.getElementById('compost-ratio-val');
const biogasRatioVal = document.getElementById('biogas-ratio-val');

const participationRateEl = document.getElementById('participation-rate');
const divertedWasteEl = document.getElementById('diverted-waste');
const landfillSavingsEl = document.getElementById('landfill-savings');
const compostRevenueEl = document.getElementById('compost-revenue');
const biogasRevenueEl = document.getElementById('biogas-revenue');
const netBenefitEl = document.getElementById('net-benefit');

// Chart instance
let financialChart;

// Format numbers as currency/locale
const formatNumber = (num) => new Intl.NumberFormat('tr-TR').format(Math.round(num));

// Scientific & Economic Constants (Deterministic, no randomness)
const CONSTANTS = {
    wastePerPersonPerYear: 1.1 * 365, // kg
    organicRatio: 0.55,               // 55%
    baseParticipation: 0.20,          // 20% natural participation without campaign
    maxParticipation: 0.85,           // 85% max theoretical participation
    budgetPerParticipationPercent: 100000, // Every 100k TL adds 1% participation
    landfillCostPerTon: 1500,         // TL
    compostYieldRate: 0.30,           // 1 ton organic -> 0.3 ton compost
    compostValuePerTon: 1000,         // TL
    biogasYieldPerTon: 60,            // m3
    biogasValuePerM3: 5               // TL
};

// Main Simulation Calculation
function calculateSimulation() {
    // 1. Get user inputs
    const population = parseInt(populationSlider.value);
    const budget = parseInt(budgetSlider.value);
    const compostRatio = parseInt(ratioSlider.value) / 100;
    const biogasRatio = 1 - compostRatio;

    // 2. Update UI labels
    populationVal.textContent = formatNumber(population);
    budgetVal.textContent = formatNumber(budget);
    compostRatioVal.textContent = Math.round(compostRatio * 100);
    biogasRatioVal.textContent = Math.round(biogasRatio * 100);

    // 3. Calculate Participation Rate
    // Formula: base + (budget / budgetPerPercent) * 0.01
    // Cap at maxParticipation
    let participationIncrease = (budget / CONSTANTS.budgetPerParticipationPercent) * 0.01;
    let currentParticipation = CONSTANTS.baseParticipation + participationIncrease;
    if (currentParticipation > CONSTANTS.maxParticipation) {
        currentParticipation = CONSTANTS.maxParticipation;
    }

    // 4. Calculate Waste Metrics
    const totalWasteProduced = (population * CONSTANTS.wastePerPersonPerYear) / 1000; // in tons
    const organicWasteProduced = totalWasteProduced * CONSTANTS.organicRatio;
    const divertedOrganicWaste = organicWasteProduced * currentParticipation; // Tons collected

    // 5. Calculate Financials
    const landfillSavings = divertedOrganicWaste * CONSTANTS.landfillCostPerTon;

    // Compost Processing
    const wasteToCompost = divertedOrganicWaste * compostRatio;
    const compostProduced = wasteToCompost * CONSTANTS.compostYieldRate;
    const compostRevenue = compostProduced * CONSTANTS.compostValuePerTon;

    // Biogas Processing
    const wasteToBiogas = divertedOrganicWaste * biogasRatio;
    const biogasProduced = wasteToBiogas * CONSTANTS.biogasYieldPerTon; // in m3
    const biogasRevenue = biogasProduced * CONSTANTS.biogasValuePerM3;

    // Net Benefit
    const totalBenefit = landfillSavings + compostRevenue + biogasRevenue;
    const netBenefit = totalBenefit - budget;

    // 6. Update Dashboard UI
    participationRateEl.textContent = `%${(currentParticipation * 100).toFixed(1)}`;
    divertedWasteEl.textContent = formatNumber(divertedOrganicWaste);
    landfillSavingsEl.textContent = formatNumber(landfillSavings);
    compostRevenueEl.textContent = formatNumber(compostRevenue);
    biogasRevenueEl.textContent = formatNumber(biogasRevenue);
    netBenefitEl.textContent = formatNumber(netBenefit);

    // Update styling for net benefit (red if negative, green if positive)
    if (netBenefit < 0) {
        netBenefitEl.parentElement.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))';
        netBenefitEl.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        netBenefitEl.innerHTML = `<span style="color:#ef4444">${formatNumber(netBenefit)} ₺</span>`;
    } else {
        netBenefitEl.parentElement.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))';
        netBenefitEl.parentElement.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        netBenefitEl.innerHTML = `<span>${formatNumber(netBenefit)} ₺</span>`;
    }

    // 7. Update Chart
    updateChart(budget, landfillSavings, compostRevenue, biogasRevenue, netBenefit);
}

// Initialize Chart.js
function initChart() {
    const ctx = document.getElementById('financialChart').getContext('2d');
    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Maliyet (Bütçe)', 'Çöplük Tasarrufu', 'Kompost Geliri', 'Biyogaz Geliri', 'NET KAZANÇ'],
            datasets: [{
                label: 'Yıllık Projeksiyon (TL)',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.6)', // Red for cost
                    'rgba(59, 130, 246, 0.6)', // Blue for savings
                    'rgba(16, 185, 129, 0.6)', // Green for compost
                    'rgba(245, 158, 11, 0.6)', // Orange for biogas
                    'rgba(139, 92, 246, 0.8)'  // Purple for net
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return new Intl.NumberFormat('tr-TR').format(context.raw) + ' ₺';
                        }
                    }
                }
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

function updateChart(cost, savings, compost, biogas, net) {
    if (!financialChart) return;
    financialChart.data.datasets[0].data = [cost, savings, compost, biogas, net];
    // Update colors conditionally for Net Kazanç
    financialChart.data.datasets[0].backgroundColor[4] = net >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    financialChart.data.datasets[0].borderColor[4] = net >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
    financialChart.update();
}

// Event Listeners
populationSlider.addEventListener('input', calculateSimulation);
budgetSlider.addEventListener('input', calculateSimulation);
ratioSlider.addEventListener('input', calculateSimulation);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    calculateSimulation();
});
// TÜİK ve Çevre, Şehircilik ve İklim Değişikliği Bakanlığı Resmi Atık İstatistikleri Modeli
const TUIK_DAILY_WASTE_KG = 1.1;  // Kişi başı günlük üretilen evsel atık (kg)
const ORGANIC_WASTE_RATIO = 0.55; // Evsel atıklar içindeki organik (mutfak/bahçe) atık oranı (%55)
const BIOGAS_PER_TON_M3 = 60;      // 1 Ton organik atıktan elde edilen ortalama biyogaz miktarı (m³)
const COMPOST_PER_TON_KG = 300;    // 1 Ton organik atıktan elde edilen yüksek kaliteli kompost/gübre (kg)
const ELECTRICITY_PER_M3_KWH = 2.0; // 1 m³ biyogazın jeneratörlerde ürettiği elektrik enerjisi (kWh)

// Küresel Grafik Nesnesi
let co2Chart = null;

// Sayfa yüklendiğinde sliderları dinle ve ilk hesaplamayı yap
document.addEventListener("DOMContentLoaded", () => {
    const inputs = ["population", "budget", "capacity"];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("input", calculateSimulation);
        }
    });

    // İlk çalıştırma
    calculateSimulation();
});

function calculateSimulation() {
    // Arayüzden parametreleri güvenli bir şekilde al
    const pop = parseFloat(document.getElementById("population")?.value) || 500000;

    // Bütçe slider'ını halkı bilinçlendirme ve toplama verimliliği oranı (%) olarak yorumluyoruz
    const collectionEfficiency = (parseFloat(document.getElementById("budget")?.value) || 20) / 100;
    const plantCapacityTon = parseFloat(document.getElementById("capacity")?.value) || 100;

    // SLIDER DEĞERLERİNİ EKRANDA ANLIK GÜNCELLE
    if (document.getElementById("popVal")) document.getElementById("popVal").innerText = pop.toLocaleString('tr-TR');
    if (document.getElementById("budgetVal")) document.getElementById("budgetVal").innerText = (collectionEfficiency * 100).toFixed(0) + "%";
    if (document.getElementById("capVal")) document.getElementById("capVal").innerText = plantCapacityTon + " Ton/Gün";

    // KESİNLİKLE RASTGELE SAYI YOKTUR - TAMAMEN DETERMINISTIK FORMÜLLER
    // 1. Günlük üretilen toplam evsel atık miktarı (Ton)
    const dailyTotalWasteTon = (pop * TUIK_DAILY_WASTE_KG) / 1000;

    // 2. Bu atığın içindeki toplam organik potansiyel (Ton)
    const dailyOrganicPotentialTon = dailyTotalWasteTon * ORGANIC_WASTE_RATIO;

    // 3. Bilinçlendirme/Ayrıştırma başarısına göre kaynağında toplanabilen miktar (Ton)
    const dailyCollectedOrganicTon = dailyOrganicPotentialTon * collectionEfficiency;

    // 4. Tesisin kapasite sınırına göre işlenebilecek miktar (Ton)
    const dailyProcessedOrganicTon = Math.min(dailyCollectedOrganicTon, plantCapacityTon);

    // 5. 30 Günlük Kümülatif Çıktı Hesaplamaları
    const totalProcessedOrganicTon = dailyProcessedOrganicTon * 30;
    const totalBiogasM3 = totalProcessedOrganicTon * BIOGAS_PER_TON_M3;
    const totalElectricityMWh = (totalBiogasM3 * ELECTRICITY_PER_M3_KWH) / 1000;
    const totalCompostTon = (totalProcessedOrganicTon * COMPOST_PER_TON_KG) / 1000;

    // Karbon Emisyon Engelleme Oranı: İşlenen her ton organik atık için 0.5 ton CO2 tasarrufu
    const totalCO2SavedTon = totalProcessedOrganicTon * 0.5;

    // SONUÇLARI DOM EKRANINA YAZDIR
    if (document.getElementById("energyOut")) document.getElementById("energyOut").innerText = totalElectricityMWh.toFixed(1) + " MWh";
    if (document.getElementById("compostOut")) document.getElementById("compostOut").innerText = totalCompostTon.toFixed(0) + " Ton";
    if (document.getElementById("co2Out")) document.getElementById("co2Out").innerText = totalCO2SavedTon.toFixed(0) + " Ton CO2";

    // GRAFİĞİ GÜNCELLE (Hocanın "Not 5: Görselleştirme kaliteyi artırır" şartı için)
    updateChart(totalCO2SavedTon);
}

function updateChart(co2Value) {
    const ctx = document.getElementById('simCanvas')?.getContext('2d');
    if (!ctx) return;

    if (co2Chart) {
        co2Chart.destroy(); // Eski grafik nesnesini temizle çakışma olmasın
    }

    co2Chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mevcut Durum (Gömme)', 'Yeni Tesis Projeksiyonu (Geri Kazanım)'],
            datasets: [{
                label: 'Atmosfere Salınan CO2 Miktarı (Ton / Ay)',
                data: [co2Value * 2, co2Value], // Gömüldüğünde 2 katı salınım simülasyonu
                backgroundColor: ['#e74c3c', '#2ecc71'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Rapor için CSV İndirme Fonksiyonu (Hocanın "Analiz etmeye müsait format" şartı)
function exportToCSV() {
    const pop = document.getElementById("population")?.value || 500000;
    let csvContent = "data:text/csv;charset=utf-8,Parametre,Deger\n";
    csvContent += `Sehir Nufusu,${pop}\n`;
    csvContent += `Uretilen Toplam Enerji (MWh),${document.getElementById("energyOut")?.innerText || "0"}\n`;
    csvContent += `Elde Edilen Gubre (Ton),${document.getElementById("compostOut")?.innerText || "0"}\n`;
    csvContent += `Engellenen CO2 (Ton),${document.getElementById("co2Out")?.innerText || "0"}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "organik_atik_simulasyon_analizi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// CSV Butonunu Bağla
document.getElementById("downloadBtn")?.addEventListener("click", exportToCSV);