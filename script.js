let order = {};
let history = JSON.parse(localStorage.getItem('sobat_pos_history')) || [];

// 1. Tambah Pesanan
function addToOrder(name, price) {
    if (order[name]) {
        order[name].qty += 1;
    } else {
        order[name] = { price, qty: 1, status: 'active' };
    }
    renderActiveOrder();
}

// 2. Kurangi Pesanan & Auto-Cancel 10 Detik
function reduceQty(name) {
    if (order[name]) {
        order[name].qty -= 1;
        if (order[name].qty <= 0) {
            order[name].status = 'pending_delete';
            // Fitur Cancel 10 Detik
            setTimeout(() => {
                if (order[name] && order[name].status === 'pending_delete') {
                    delete order[name];
                    renderActiveOrder();
                }
            }, 10000);
        }
    }
    renderActiveOrder();
}

// 3. Render Daftar Belanja
function renderActiveOrder() {
    const list = document.getElementById('active-order-list');
    list.innerHTML = '';
    let total = 0;

    for (let key in order) {
        const item = order[key];
        if (item.status === 'active') {
            total += item.price * item.qty;
            list.innerHTML += `
                <div class="item-row">
                    <div>${key} (x${item.qty})</div>
                    <button class="btn-qty" onclick="reduceQty('${key}')">-</button>
                </div>`;
        } else {
            list.innerHTML += `<div class="item-row" style="opacity:0.5 italic"><span>${key} (Dibatalkan dlm 10dtk...)</span></div>`;
        }
    }
    document.getElementById('total-price').innerText = `Rp ${total.toLocaleString()}`;
    processChange();
}

// 4. Kalkulator Kembalian
function processChange() {
    const totalText = document.getElementById('total-price').innerText.replace(/[^0-9]/g, '');
    const total = parseInt(totalText);
    const cash = document.getElementById('cash-amount').value || 0;
    const change = cash - total;
    document.getElementById('change-amount').innerText = `Rp ${change < 0 ? 0 : change.toLocaleString()}`;
}

// 5. Selesaikan Transaksi & Simpan Detail
function completeOrder() {
    const totalText = document.getElementById('total-price').innerText.replace(/[^0-9]/g, '');
    const total = parseInt(totalText);
    if (total <= 0) return alert("Pilih menu dulu!");

    const transaction = {
        waktu: new Date().toLocaleString('id-ID'),
        timestamp: Date.now(),
        detail: Object.keys(order).filter(k => order[k].qty > 0).map(k => `${k} (x${order[k].qty})`).join(", "),
        total: total
    };

    history.push(transaction);
    localStorage.setItem('sobat_pos_history', JSON.stringify(history));
    
    // Reset
    order = {};
    document.getElementById('cash-amount').value = '';
    alert("Transaksi Sukses!");
    renderActiveOrder();
    renderHistoryTable();
    updateSalesChart();
}

// 6. Ekspor Excel
function downloadExcel() {
    const ws = XLSX.utils.json_to_sheet(history);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
    XLSX.writeFile(wb, `Laporan_SobatKasir_${new Date().toLocaleDateString()}.xlsx`);
}

// 7. Reset Semua Data
function clearAllData() {
    if (confirm("Hapus semua riwayat laporan?")) {
        localStorage.removeItem('sobat_pos_history');
        location.reload();
    }
}

// 8. Bagan Perbandingan (Hari ini vs Kemarin)
function updateSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    const getVal = (dateStr) => history.filter(h => h.waktu.includes(dateStr)).reduce((a, b) => a + b.total, 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Kemarin', 'Hari Ini'],
            datasets: [{
                label: 'Omset Rp',
                data: [getVal(yesterday), getVal(today)],
                backgroundColor: ['rgba(255,255,255,0.3)', '#FFD700']
            }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    });
}

function renderHistoryTable() {
    const content = document.getElementById('history-content');
    content.innerHTML = history.slice(-5).reverse().map(h => `
        <tr><td>${h.waktu}</td><td>${h.detail}</td><td>Rp ${h.total.toLocaleString()}</td></tr>
    `).join('');
}

// Jam Digital Live
setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleString('id-ID');
}, 1000);

window.onload = () => { renderHistoryTable(); updateSalesChart(); };
