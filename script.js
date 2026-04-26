let cartData = {};
let posLogs = JSON.parse(localStorage.getItem('sobat_pos_data')) || [];

// 1. Tambah/Update Pesanan
function updateCart(name, price) {
    if (cartData[name]) {
        cartData[name].qty += 1;
        cartData[name].status = 'active';
    } else {
        cartData[name] = { price, qty: 1, status: 'active' };
    }
    refreshUI();
}

// 2. Kurangi & Timer Batal 10 Detik
function removeQty(name) {
    if (cartData[name]) {
        cartData[name].qty -= 1;
        if (cartData[name].qty <= 0) {
            cartData[name].status = 'pending_cancel';
            setTimeout(() => {
                if (cartData[name] && cartData[name].status === 'pending_cancel') {
                    delete cartData[name];
                    refreshUI();
                }
            }, 10000);
        }
    }
    refreshUI();
}

// 3. Sinkronisasi Antarmuka
function refreshUI() {
    const list = document.getElementById('order-list');
    list.innerHTML = '';
    let total = 0;

    for (let key in cartData) {
        const item = cartData[key];
        const isPending = item.status === 'pending_cancel';
        if (!isPending) total += item.price * item.qty;

        list.innerHTML += `
            <div class="pay-row" style="opacity: ${isPending ? '0.4' : '1'}">
                <span>${key} ${isPending ? '(Batal...)' : '(x' + item.qty + ')'}</span>
                <button onclick="removeQty('${key}')" style="background:red; border:none; color:white; border-radius:5px; padding:2px 8px; cursor:pointer">-</button>
            </div>
        `;
    }
    document.getElementById('grand-total').innerText = "Rp " + total.toLocaleString();
    syncCalc();
}

// 4. Kalkulator Otomatis
function syncCalc() {
    const total = parseInt(document.getElementById('grand-total').innerText.replace(/\D/g,''));
    const cash = parseInt(document.getElementById('cash-in').value) || 0;
    const change = cash - total;
    document.getElementById('change-out').innerText = "Rp " + (change < 0 ? 0 : change.toLocaleString());
}

// 5. Simpan Transaksi
function finishOrder() {
    const total = parseInt(document.getElementById('grand-total').innerText.replace(/\D/g,''));
    if (total <= 0) return alert("Pilih menu dulu!");

    const record = {
        jam: new Date().toLocaleTimeString('id-ID'),
        tgl: new Date().toLocaleDateString('id-ID'),
        total: total
    };

    posLogs.push(record);
    localStorage.setItem('sobat_pos_data', JSON.stringify(posLogs));
    
    cartData = {};
    document.getElementById('cash-in').value = '';
    alert("Transaksi Selesai!");
    refreshUI();
    loadHistory();
    drawChart();
}

// 6. Grafik & Laporan
function loadHistory() {
    const body = document.getElementById('history-rows');
    body.innerHTML = posLogs.slice(-5).reverse().map(l => `
        <tr><td>${l.jam}</td><td>Rp ${l.total.toLocaleString()}</td></tr>
    `).join('');
}

let chartRef;
function drawChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const today = new Date().toLocaleDateString('id-ID');
    const todayTotal = posLogs.filter(l => l.tgl === today).reduce((a, b) => a + b.total, 0);

    if (chartRef) chartRef.destroy();
    chartRef = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Omset Hari Ini'],
            datasets: [{ label: 'Rupiah', data: [todayTotal], backgroundColor: '#0061f2' }]
        }
    });
}

function exportData() {
    const ws = XLSX.utils.json_to_sheet(posLogs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "Rekap_SobatKasir.xlsx");
}

function clearData() { if(confirm("Hapus riwayat?")) { localStorage.clear(); location.reload(); } }

// Loop Utama
setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString('id-ID');
    document.getElementById('display-date').innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}, 1000);

window.onload = () => {
    loadHistory(); drawChart();
    document.addEventListener('click', () => document.getElementById('bgMusic').play(), {once: true});
};
