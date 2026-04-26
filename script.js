// Mengambil data dari LocalStorage atau buat array kosong jika baru
let historyLogs = JSON.parse(localStorage.getItem('sobat_v4_logs')) || [];
let pendingList = [];

// 1. Fungsi Tambah Pesanan ke Antrean (Pending)
function createPending(name, price) {
    const id = Date.now();
    pendingList.push({ id, name, price });
    renderPending();
}

// 2. Tampilkan Daftar Pesanan yang Belum Selesai
function renderPending() {
    const container = document.getElementById('pending-orders');
    if (!container) return; // Guard agar tidak error jika id tidak ada

    container.innerHTML = '';

    if (pendingList.length === 0) {
        container.innerHTML = '<p class="empty-text">Tidak ada antrean pesanan.</p>';
        return;
    }

    pendingList.forEach(order => {
        container.innerHTML += `
            <div class="order-box glass">
                <div class="order-info">
                    <p><strong>${order.name}</strong></p>
                    <p class="price-text">Rp ${order.price.toLocaleString()}</p>
                    <span class="status-label">⚠️ Belum Selesai</span>
                </div>
                <div class="action-row">
                    <button class="btn-done" onclick="completeOrder(${order.id})">SELESAI</button>
                    <button class="btn-cancel" onclick="cancelOrder(${order.id})">BATAL</button>
                </div>
            </div>
        `;
    });
}

// 3. Pindahkan dari Pending ke Riwayat (Hitung Omset)
function completeOrder(id) {
    const index = pendingList.findIndex(o => o.id === id);
    if (index !== -1) {
        const order = pendingList[index];
        const log = {
            jam: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            menu: order.name,
            total: order.price,
            status: "SUKSES"
        };
        
        historyLogs.push(log);
        localStorage.setItem('sobat_v4_logs', JSON.stringify(historyLogs));
        
        // Hapus dari antrean
        pendingList.splice(index, 1);
        
        renderPending();
        renderHistory();
    }
}

// 4. Batalkan Pesanan (Hapus dari Antrean saja)
function cancelOrder(id) {
    if (confirm("Hapus pesanan ini dari antrean?")) {
        pendingList = pendingList.filter(o => o.id !== id);
        renderPending();
    }
}

// 5. Tampilkan Riwayat & Kalkulasi Penghasilan
function renderHistory() {
    const body = document.getElementById('history-body');
    const incomeEl = document.getElementById('total-income');
    if (!body || !incomeEl) return;

    body.innerHTML = '';
    let totalIncome = 0;

    // Menampilkan riwayat dari yang terbaru di atas
    historyLogs.slice().reverse().forEach(log => {
        totalIncome += log.total;
        body.innerHTML += `
            <tr>
                <td>${log.jam}</td>
                <td>${log.menu}</td>
                <td class="yellow-text">Rp ${log.total.toLocaleString()}</td>
                <td><span class="badge-success">${log.status}</span></td>
            </tr>
        `;
    });

    incomeEl.innerText = "Rp " + totalIncome.toLocaleString();
}

// 6. Reset Data Riwayat
function resetHistory() {
    if (confirm("Semua data riwayat dan omset akan dihapus. Lanjutkan?")) {
        localStorage.removeItem('sobat_v4_logs');
        historyLogs = [];
        renderHistory();
    }
}

// 7. Inisialisasi Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    renderPending();

    // Jalankan Jam Digital
    setInterval(() => {
        const clockEl = document.getElementById('clock');
        if (clockEl) clockEl.innerText = new Date().toLocaleTimeString('id-ID');
    }, 1000);

    // Audio Playback
    document.addEventListener('click', () => {
        const bgm = document.getElementById('bgMusic');
        if (bgm && bgm.paused) bgm.play().catch(e => console.log("Audio waiting for interaction"));
    }, { once: true });
});
