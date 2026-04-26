let order = {};
let historyData = JSON.parse(localStorage.getItem('sobat_pos_history')) || [];

// 1. Fungsi Tambah ke Pesanan Aktif
function addToOrder(name, price) {
    if (order[name]) {
        // Jika item sudah ada dan dalam status batal, kembalikan ke aktif
        if (order[name].status === 'canceling') {
            order[name].status = 'active';
            order[name].qty = 1;
        } else {
            order[name].qty += 1;
        }
    } else {
        order[name] = { price, qty: 1, status: 'active' };
    }
    renderActiveOrder();
}

// 2. Fungsi Kurangi Item & Logika Auto-Cancel 10 Detik
function reduceQty(name) {
    if (order[name]) {
        order[name].qty -= 1;
        
        if (order[name].qty <= 0) {
            order[name].status = 'canceling';
            order[name].qty = 0;

            // Timer 10 Detik untuk penghapusan permanen
            setTimeout(() => {
                if (order[name] && order[name].status === 'canceling') {
                    delete order[name];
                    renderActiveOrder();
                }
            }, 10000);
        }
    }
    renderActiveOrder();
}

// 3. Render Tampilan Daftar Pesanan (Billing Panel)
function renderActiveOrder() {
    const list = document.getElementById('order-list');
    list.innerHTML = '';
    let total = 0;

    const keys = Object.keys(order);
    if (keys.length === 0) {
        list.innerHTML = '<p class="empty-text">Belum ada pesanan.</p>';
    }

    keys.forEach(name => {
        const item = order[name];
        const isCanceling = item.status === 'canceling';
        
        if (!isCanceling) {
            total += item.price * item.qty;
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = `order-item ${isCanceling ? 'pending-cancel' : ''}`;
        itemDiv.innerHTML = `
            <div class="item-info">
                <span class="item-name">${name} ${isCanceling ? '(Dibatalkan...)' : '(x' + item.qty + ')'}</span>
                <span class="item-price">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>
            </div>
            <button class="btn-qty-action" onclick="reduceQty('${name}')">
                ${isCanceling ? '↻' : '-'}
            </button>
        `;
        list.appendChild(itemDiv);
    });

    document.getElementById('grand-total').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    calculateChange();
}

// 4. Kalkulator Kembalian Otomatis
function calculateChange() {
    const totalText = document.getElementById('grand-total').innerText.replace(/[^0-9]/g, '');
    const total = parseInt(totalText) || 0;
    const cash = parseInt(document.getElementById('cash-input').value) || 0;
    const change = cash - total;

    const display = document.getElementById('change-display');
    display.innerText = `Rp ${change < 0 ? 0 : change.toLocaleString('id-ID')}`;
    
    // Beri warna merah jika uang kurang
    display.style.color = (cash > 0 && change < 0) ? '#ff4757' : '#FFD700';
}

// 5. Finalisasi Transaksi & Simpan Riwayat
function finalizeTransaction() {
    const totalText = document.getElementById('grand-total').innerText.replace(/[^0-9]/g, '');
    const total = parseInt(totalText) || 0;

    if (total <= 0) return alert("Tambahkan menu terlebih dahulu!");
    
    const cash = parseInt(document.getElementById('cash-input').value) || 0;
    if (cash < total) return alert("Uang tunai kurang!");

    const transaction = {
        waktu: new Date().toLocaleTimeString('id-ID'),
        tanggal: new Date().toLocaleDateString('id-ID'),
        detail: Object.keys(order)
                .filter(k => order[k].status === 'active')
                .map(k => `${k} (x${order[k].qty})`).join(", "),
        total: total
    };

    // Simpan ke database lokal
    historyData.push(transaction);
    localStorage.setItem('sobat_pos_history', JSON.stringify(historyData));

    // Reset Form
    order = {};
    document.getElementById('cash-input').value = '';
    
    alert("✅ Transaksi Berhasil!");
    renderActiveOrder();
    renderHistoryTable();
    updateChart();
}

// 6. Ekspor Data ke Excel
function exportToExcel() {
    if (historyData.length === 0) return alert("Riwayat masih kosong!");
    
    const ws = XLSX.utils.json_to_sheet(historyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
    XLSX.writeFile(wb, `Laporan_SobatKasir_${new Date().toLocaleDateString()}.xlsx`);
}

// 7. Reset Semua Data Riwayat
function resetData() {
    if (confirm("Hapus semua riwayat transaksi? Data yang dihapus tidak bisa dikembalikan.")) {
        localStorage.removeItem('sobat_pos_history');
        historyData = [];
        renderHistoryTable();
        updateChart();
        alert("Riwayat telah dibersihkan.");
    }
}

// 8. Tampilkan Riwayat di Tabel
function renderHistoryTable() {
    const tbody = document.getElementById('history-content') || document.getElementById('history-body');
    if (!tbody) return;

    tbody.innerHTML = historyData.slice(-10).reverse().map(h => `
        <tr>
            <td>${h.waktu}</td>
            <td>${h.detail}</td>
            <td>Rp ${h.total.toLocaleString('id-ID')}</td>
        </tr>
    `).join('');
}

// 9. Update Bagan Perbandingan (Hari ini vs Kemarin)
let salesChart;
function updateChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const today = new Date().toLocaleDateString('id-ID');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('id-ID');

    const getIncome = (dateStr) => historyData
        .filter(h => h.tanggal === dateStr)
        .reduce((sum, item) => sum + item.total, 0);

    if (salesChart) salesChart.destroy();
    
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Kemarin', 'Hari Ini'],
            datasets: [{
                label: 'Total Omset (Rp)',
                data: [getIncome(yesterday), getIncome(today)],
                backgroundColor: ['rgba(255, 255, 255, 0.2)', '#FFD700'],
                borderColor: ['#ffffff', '#FFD700'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

// Inisialisasi Saat Halaman Dimuat
window.onload = () => {
    renderHistoryTable();
    updateChart();
    
    // Jam Digital Live
    setInterval(() => {
        const clockEl = document.getElementById('live-clock');
        if (clockEl) clockEl.innerText = new Date().toLocaleTimeString('id-ID');
    }, 1000);
};
