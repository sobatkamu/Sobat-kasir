let currentOrder = {};
let saleHistory = JSON.parse(localStorage.getItem('sobat_history')) || [];

// 1. Tambah Pesanan
function addToOrder(name, price) {
    if (currentOrder[name]) {
        currentOrder[name].qty += 1;
    } else {
        currentOrder[name] = { price, qty: 1 };
    }
    renderOrder();
}

// 2. Kurangi Pesanan & Auto-Delete 10 Detik
function removeOne(name) {
    if (currentOrder[name]) {
        currentOrder[name].qty -= 1;
        if (currentOrder[name].qty <= 0) {
            // Logika Cancel: Hapus setelah 10 detik jika tetap nol
            setTimeout(() => {
                if (currentOrder[name] && currentOrder[name].qty <= 0) {
                    delete currentOrder[name];
                    renderOrder();
                }
            }, 10000);
        }
    }
    renderOrder();
}

// 3. Render Daftar Pesanan Aktif
function renderOrder() {
    const list = document.getElementById('active-list');
    list.innerHTML = "";
    let total = 0;

    for (let name in currentOrder) {
        const item = currentOrder[name];
        if (item.qty > 0) {
            total += item.price * item.qty;
            list.innerHTML += `
                <div class="order-row">
                    <span>${name} (x${item.qty})</span>
                    <button class="btn-min" onclick="removeOne('${name}')">-</button>
                </div>`;
        } else {
            list.innerHTML += `<div class="order-row cancel"><span>${name} (Dibatalkan...)</span></div>`;
        }
    }
    document.getElementById('display-total-kasir').innerText = "Rp " + total.toLocaleString();
    calculateChange();
}

// 4. Kalkulator Kembalian
function calculateChange() {
    const total = Object.values(currentOrder).reduce((a, b) => a + (b.price * b.qty), 0);
    const cash = document.getElementById('cash-input').value || 0;
    const change = cash - total;
    document.getElementById('display-change').innerText = "Rp " + (change < 0 ? 0 : change).toLocaleString();
}

// 5. Simpan Transaksi & Detail Tanggal
function finalizeTransaction() {
    const total = Object.values(currentOrder).reduce((a, b) => a + (b.price * b.qty), 0);
    if (total <= 0) return alert("Keranjang kosong!");

    const record = {
        waktu: new Date().toLocaleString('id-ID'),
        timestamp: Date.now(),
        detail: Object.keys(currentOrder).map(k => `${k} (x${currentOrder[k].qty})`).join(", "),
        total: total
    };

    saleHistory.push(record);
    localStorage.setItem('sobat_history', JSON.stringify(saleHistory));
    
    currentOrder = {}; // Reset order aktif
    document.getElementById('cash-input').value = "";
    alert("Transaksi Selesai!");
    renderOrder();
    renderHistory();
    updateChart();
}

// 6. Ekspor ke Excel
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(saleHistory);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
    XLSX.writeFile(wb, `Laporan_SobatKamu_${new Date().toLocaleDateString()}.xlsx`);
}

// 7. Reset Data
function resetHistory() {
    if (confirm("Reset semua riwayat penjualan?")) {
        saleHistory = [];
        localStorage.removeItem('sobat_history');
        location.reload();
    }
}

// 8. Bagan Perbandingan (Hari Ini vs Kemarin)
function updateChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const yesterdayStr = new Date(now.setDate(now.getDate() - 1)).toLocaleDateString();

    const todayVal = saleHistory.filter(h => h.waktu.includes(todayStr)).reduce((a, b) => a + b.total, 0);
    const yesterdayVal = saleHistory.filter(h => h.waktu.includes(yesterdayStr)).reduce((a, b) => a + b.total, 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Kemarin', 'Hari Ini'],
            datasets: [{
                label: 'Penjualan (Rp)',
                data: [yesterdayVal, todayVal],
                backgroundColor: ['rgba(255, 255, 255, 0.3)', '#FFD700']
            }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    });
}

// Inisialisasi awal
function renderHistory() {
    const body = document.getElementById('history-body');
    body.innerHTML = saleHistory.slice(-5).reverse().map(h => `
        <tr><td>${h.waktu}</td><td>${h.detail}</td><td>Rp ${h.total.toLocaleString()}</td></tr>
    `).join("");
}

window.onload = () => { renderHistory(); updateChart(); };
