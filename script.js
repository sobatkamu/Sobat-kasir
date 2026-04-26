let cart = {};
let historyData = JSON.parse(localStorage.getItem('sobat_history')) || [];

// --- SISTEM KERANJANG ---
function addToOrder(name, price) {
    if (cart[name]) {
        cart[name].qty += 1;
    } else {
        cart[name] = { price, qty: 1, status: 'active' };
    }
    renderCart();
}

function reduceItem(name) {
    if (cart[name]) {
        cart[name].qty -= 1;
        if (cart[name].qty <= 0) {
            cart[name].status = 'canceling'; // Visual status
            setTimeout(() => {
                if (cart[name] && cart[name].qty <= 0) {
                    delete cart[name];
                    renderCart();
                }
            }, 10000); // 10 Detik auto-hapus
        }
    }
    renderCart();
}

function renderCart() {
    const list = document.getElementById('order-list');
    list.innerHTML = '';
    let total = 0;

    for (let key in cart) {
        const item = cart[key];
        const isCanceling = item.status === 'canceling';
        
        if (!isCanceling) total += item.price * item.qty;

        list.innerHTML += `
            <div class="order-item ${isCanceling ? 'pending-cancel' : ''}">
                <div>
                    <strong>${key}</strong> <br>
                    <small>${isCanceling ? 'Dibatalkan...' : 'Rp ' + item.price.toLocaleString()}</small>
                </div>
                <div style="display:flex; align-items:center; gap:10px">
                    <span>x${item.qty}</span>
                    <button class="btn-del" onclick="reduceItem('${key}')">${isCanceling ? '↻' : '-'}</button>
                </div>
            </div>
        `;
    }
    document.getElementById('grand-total').innerText = `Rp ${total.toLocaleString()}`;
    updateChange();
}

// --- KALKULATOR KEMBALIAN ---
function updateChange() {
    const total = parseInt(document.getElementById('grand-total').innerText.replace(/\D/g,'')) || 0;
    const cash = parseInt(document.getElementById('cash-input').value) || 0;
    const change = cash - total;
    
    document.getElementById('change-display').innerText = `Rp ${change < 0 ? 0 : change.toLocaleString()}`;
    document.getElementById('change-display').style.color = change < 0 ? '#ff4757' : '#FFD700';
}

// --- PENYELESAIAN TRANSAKSI ---
function finalizeOrder() {
    const total = parseInt(document.getElementById('grand-total').innerText.replace(/\D/g,'')) || 0;
    if (total <= 0) return alert("Keranjang masih kosong!");

    const transaction = {
        time: new Date().toLocaleTimeString('id-ID'),
        date: new Date().toLocaleDateString('id-ID'),
        items: Object.keys(cart).map(k => `${k} (x${cart[k].qty})`).join(", "),
        total: total
    };

    historyData.push(transaction);
    localStorage.setItem('sobat_history', JSON.stringify(historyData));
    
    alert("✅ Transaksi Berhasil Disimpan!");
    cart = {};
    document.getElementById('cash-input').value = '';
    renderCart();
    renderHistory();
    updateChart();
}

// --- LAPORAN & EKSPOR ---
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(historyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_SobatKamu_${new Date().toLocaleDateString()}.xlsx`);
}

function renderHistory() {
    const body = document.getElementById('history-body');
    body.innerHTML = historyData.slice(-5).reverse().map(h => `
        <tr>
            <td>${h.time}</td>
            <td>${h.items.substring(0, 20)}...</td>
            <td>Rp ${h.total.toLocaleString()}</td>
        </tr>
    `).join('');
}

// --- BAGAN (CHART.JS) ---
let salesChart;
function updateChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const today = new Date().toLocaleDateString('id-ID');
    
    const todaySales = historyData.filter(h => h.date === today).reduce((a, b) => a + b.total, 0);
    // Contoh data dummy kemarin untuk perbandingan
    const yesterdaySales = 150000; 

    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Kemarin', 'Hari Ini'],
            datasets: [{
                label: 'Omset (Rp)',
                data: [yesterdaySales, todaySales],
                backgroundColor: ['rgba(255,255,255,0.2)', '#FFD700'],
                borderRadius: 10
            }]
        },
        options: {
            scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
}

// --- UTILITAS ---
setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString('id-ID');
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}, 1000);

// Play music on first interaction
document.addEventListener('click', () => {
    document.getElementById('bgMusic').play();
}, { once: true });

window.onload = () => { renderHistory(); updateChart(); };
