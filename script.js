let cart = {};
let logs = JSON.parse(localStorage.getItem('sobat_pos_history')) || [];

function addToOrder(name, price) {
    if (cart[name]) {
        cart[name].qty += 1;
    } else {
        cart[name] = { price, qty: 1 };
    }
    renderUI();
}

function renderUI() {
    const list = document.getElementById('order-items');
    list.innerHTML = '';
    let total = 0;

    for (let key in cart) {
        const item = cart[key];
        total += item.price * item.qty;

        list.innerHTML += `
            <div class="bill-row">
                <span>${key} (x${item.qty})</span>
                <span class="yellow-text">Rp ${(item.price * item.qty).toLocaleString()}</span>
            </div>
        `;
    }
    document.getElementById('display-total').innerText = "Rp " + total.toLocaleString();
    runCalculator();
}

function runCalculator() {
    const total = parseInt(document.getElementById('display-total').innerText.replace(/\D/g,'')) || 0;
    const cash = parseInt(document.getElementById('cash-input').value) || 0;
    const change = cash - total;
    document.getElementById('display-change').innerText = "Rp " + (change < 0 ? 0 : change.toLocaleString());
}

function processTransaction() {
    const total = parseInt(document.getElementById('display-total').innerText.replace(/\D/g,'')) || 0;
    if (total <= 0) return alert("Pilih menu dahulu!");

    const log = {
        jam: new Date().toLocaleTimeString('id-ID'),
        tanggal: new Date().toLocaleDateString('id-ID'),
        total: total
    };

    logs.push(log);
    localStorage.setItem('sobat_pos_history', JSON.stringify(logs));
    
    cart = {};
    document.getElementById('cash-input').value = '';
    alert("Transaksi Selesai!");
    renderUI();
    renderHistory();
    updateChart();
}

function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(logs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, "SobatKasir_Report.xlsx");
}

function renderHistory() {
    const body = document.getElementById('history-body');
    body.innerHTML = logs.slice(-5).reverse().map(l => `
        <tr><td>${l.jam}</td><td>Rp ${l.total.toLocaleString()}</td></tr>
    `).join('');
}

let chart;
function updateChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const today = new Date().toLocaleDateString('id-ID');
    const income = logs.filter(l => l.tanggal === today).reduce((a, b) => a + b.total, 0);

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hari Ini'],
            datasets: [{ label: 'Omset Rp', data: [income], backgroundColor: '#0066ff' }]
        },
        options: { maintainAspectRatio: false }
    });
}

setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString('id-ID');
    document.getElementById('live-date').innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}, 1000);

window.onload = () => {
    renderHistory();
    updateChart();
    document.addEventListener('click', () => document.getElementById('bgMusic').play(), {once: true});
};
