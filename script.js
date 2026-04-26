let pendingList = [];
let historyLogs = JSON.parse(localStorage.getItem('sobat_v4_logs')) || [];

// 1. Tambah Pesanan ke Antrean (Pending)
function createPending(name, price) {
    const id = Date.now();
    pendingList.push({ id, name, price, status: "Belum Selesai" });
    renderPending();
}

// 2. Render Daftar Pesanan Pending
function renderPending() {
    const container = document.getElementById('pending-orders');
    container.innerHTML = '';

    if (pendingList.length === 0) {
        container.innerHTML = '<p class="empty-text">Tidak ada antrean pesanan.</p>';
        return;
    }

    pendingList.forEach(order => {
        container.innerHTML += `
            <div class="order-box glass">
                <p><strong>${order.name}</strong></p>
                <p>Harga: Rp ${order.price.toLocaleString()}</p>
                <p style="color: #ffeb3b; font-size: 0.7rem;">⚠️ Belum Diantar</p>
                <div class="action-row">
                    <button class="btn-done" onclick="completeOrder(${order.id})">SELESAI</button>
                    <button class="btn-cancel" onclick="cancelOrder(${order.id})">BATAL</button>
                </div>
            </div>
        `;
    });
}

// 3. Pesanan Selesai (Masuk Riwayat & Hitung Penghasilan)
function completeOrder(id) {
    const index = pendingList.findIndex(o => o.id === id);
    if (index !== -1) {
        const order = pendingList[index];
        const log = {
            jam: new Date().toLocaleTimeString('id-ID'),
            menu: order.name,
            total: order.price,
            status: "SUKSES"
        };
        historyLogs.push(log);
        localStorage.setItem('sobat_v4_logs', JSON.stringify(historyLogs));
        pendingList.splice(index, 1);
        
        renderPending();
        renderHistory();
    }
}

// 4. Batalkan Pesanan
function cancelOrder(id) {
    if (confirm("Batalkan pesanan ini?")) {
        pendingList = pendingList.filter(o => o.id !== id);
        renderPending();
    }
}

// 5. Render Riwayat & Total Penghasilan
function renderHistory() {
    const body = document.getElementById('history-body');
    const incomeEl = document.getElementById('total-income');
    body.innerHTML = '';
    let totalIncome = 0;

    historyLogs.slice().reverse().forEach(log => {
        totalIncome += log.total;
        body.innerHTML += `
            <tr>
                <td>${log.jam}</td>
                <td>${log.menu}</td>
                <td style="color: #ffeb3b;">Rp ${log.total.toLocaleString()}</td>
                <td><span style="color: #2ecc71;">${log.status}</span></td>
            </tr>
        `;
    });

    incomeEl.innerText = "Rp " + totalIncome.toLocaleString();
}

function resetHistory() {
    if (confirm("Hapus semua riwayat dan reset penghasilan?")) {
        localStorage.removeItem('sobat_v4_logs');
        historyLogs = [];
        renderHistory();
    }
}

// Inisialisasi
window.onload = () => {
    renderHistory();
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString('id-ID');
    }, 1000);
    document.addEventListener('click', () => document.getElementById('bgMusic').play(), {once: true});
};
