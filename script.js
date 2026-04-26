let currentOrder = {};
let saleHistory = JSON.parse(localStorage.getItem('sobat_history')) || [];

function addToOrder(name, price) {
    if (currentOrder[name]) {
        currentOrder[name].qty += 1;
    } else {
        currentOrder[name] = { price, qty: 1, status: 'active' };
    }
    renderOrder();
}

function reduceItem(name) {
    if (currentOrder[name]) {
        currentOrder[name].qty -= 1;
        if (currentOrder[name].qty <= 0) {
            currentOrder[name].status = 'canceling';
            setTimeout(() => {
                if (currentOrder[name] && currentOrder[name].status === 'canceling') {
                    delete currentOrder[name];
                    renderOrder();
                }
            }, 10000); // 10 Detik
        }
    }
    renderOrder();
}

function renderOrder() {
    const list = document.getElementById('order-list');
    list.innerHTML = '';
    let total = 0;

    for (let name in currentOrder) {
        const item = currentOrder[name];
        if (item.status === 'active') total += item.price * item.qty;

        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px">
                <span>${name} (x${item.qty})</span>
                <button onclick="reduceItem('${name}')" style="background:red; color:white; border:none; border-radius:5px">-</button>
            </div>
        `;
    }
    document.getElementById('grand-total').innerText = "Rp " + total.toLocaleString();
    calculateChange();
}

function calculateChange() {
    const total = parseInt(document.getElementById('grand-total').innerText.replace(/\D/g,''));
    const cash = parseInt(document.getElementById('cash-input').value) || 0;
    const change = cash - total;
    document.getElementById('change-display').innerText = "Rp " + (change < 0 ? 0 : change).toLocaleString();
}

function finalizeTransaction() {
    const total = parseInt(document.getElementById('grand-total').innerText.replace(/\D/g,''));
    if (total <= 0) return alert("Pilih menu dulu!");

    const record = {
        waktu: new Date().toLocaleString('id-ID'),
        tanggal: new Date().toLocaleDateString('id-ID'),
        total: total
    };

    saleHistory.push(record);
    localStorage.setItem('sobat_history', JSON.stringify(saleHistory));
    
    currentOrder = {};
    document.getElementById('cash-input').value = '';
    alert("Transaksi Selesai!");
    renderOrder();
    renderHistory();
    updateChart();
}

function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(saleHistory);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "Laporan_SobatKasir.xlsx");
}

// Inisialisasi Grafik & Musik
window.onload = () => {
    renderHistory();
    updateChart();
    document.addEventListener('click', () => document.getElementById('bgMusic').play(), {once:true});
};

function renderHistory() {
    const body = document.getElementById('history-body');
    body.innerHTML = saleHistory.slice(-5).reverse().map(h => `
        <tr><td>${h.waktu}</td><td>Rp ${h.total.toLocaleString()}</td></tr>
    `).join('');
}

function updateChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const today = new Date().toLocaleDateString('id-ID');
    const totalToday = saleHistory.filter(h => h.tanggal === today).reduce((a,b) => a + b.total, 0);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hari Ini'],
            datasets: [{ label: 'Omset Rp', data: [totalToday], backgroundColor: '#0061f2' }]
        }
    });
}

function resetData() {
    if(confirm("Hapus semua data?")) {
        localStorage.removeItem('sobat_history');
        location.reload();
    }
}
