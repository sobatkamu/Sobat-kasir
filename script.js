let tempCart = {};
let pendingOrders = [];
let historyLogs = JSON.parse(localStorage.getItem('sobat_v4_logs')) || [];

// 1. Tambah ke keranjang sementara (Floating Bar)
function updateTempCart(name, price, qty) {
    if (tempCart[name]) {
        tempCart[name].qty += qty;
    } else {
        tempCart[name] = { price: price, qty: qty };
    }
    renderCartBar();
}

// 2. Tampilkan/Update Bar Melayang
function renderCartBar() {
    const bar = document.getElementById('cart-bar');
    const preview = document.getElementById('cart-items-preview');
    const totalPrice = document.getElementById('cart-total-price');
    
    let total = 0;
    let items = [];

    for (let key in tempCart) {
        total += tempCart[key].price * tempCart[key].qty;
        items.push(`${key} (${tempCart[key].qty})`);
    }

    if (items.length > 0) {
        bar.classList.remove('hide');
        preview.innerText = items.join(", ");
        totalPrice.innerText = "Rp " + total.toLocaleString();
    } else {
        bar.classList.add('hide');
    }
}

// 3. Pindahkan dari Keranjang ke Antrean (Satu List)
function processToPending() {
    const orderId = Date.now();
    let totalOrderPrice = 0;
    let itemsArray = [];

    for (let key in tempCart) {
        let cost = tempCart[key].price * tempCart[key].qty;
        totalOrderPrice += cost;
        itemsArray.push({ name: key, qty: tempCart[key].qty, subtotal: cost });
    }

    pendingOrders.push({
        id: orderId,
        items: itemsArray,
        total: totalOrderPrice,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    tempCart = {}; // Reset keranjang
    renderCartBar();
    renderPendingList();
}

// 4. Render Daftar Antrean (Tampilan per Pelanggan)
function renderPendingList() {
    const container = document.getElementById('pending-orders');
    container.innerHTML = '';

    if (pendingOrders.length === 0) {
        container.innerHTML = '<p class="empty-text">Belum ada pesanan yang diproses.</p>';
        return;
    }

    pendingOrders.forEach(order => {
        let itemsHtml = order.items.map(i => `<li>${i.name} <b>x${i.qty}</b></li>`).join('');
        
        container.innerHTML += `
            <div class="order-note glass">
                <h4>Nota #${order.id.toString().slice(-4)} <small>(${order.time})</small></h4>
                <ul>${itemsHtml}</ul>
                <div class="note-footer">
                    <div class="total-note">Total: Rp ${order.total.toLocaleString()}</div>
                    <div class="btns">
                        <button class="btn-done" onclick="completeOrder(${order.id})">SELESAI</button>
                        <button class="btn-cancel" onclick="cancelOrder(${order.id})">BATAL</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// 5. Selesaikan Seluruh Pesanan (Masuk Riwayat)
function completeOrder(id) {
    const index = pendingOrders.findIndex(o => o.id === id);
    if (index !== -1) {
        const order = pendingOrders[index];
        const detailStr = order.items.map(i => `${i.name}(${i.qty})`).join(", ");
        
        historyLogs.push({
            jam: order.time,
            detail: detailStr,
            total: order.total
        });

        localStorage.setItem('sobat_v4_logs', JSON.stringify(historyLogs));
        pendingOrders.splice(index, 1);
        
        renderPendingList();
        renderHistory();
    }
}

function cancelOrder(id) {
    if (confirm("Batalkan nota pesanan ini?")) {
        pendingOrders = pendingOrders.filter(o => o.id !== id);
        renderPendingList();
    }
}

function renderHistory() {
    const body = document.getElementById('history-body');
    const incomeEl = document.getElementById('total-income');
    let income = 0;
    body.innerHTML = '';

    historyLogs.slice().reverse().forEach(log => {
        income += log.total;
        body.innerHTML += `
            <tr>
                <td>${log.jam}</td>
                <td>${log.detail}</td>
                <td style="color:var(--bright-yellow)">Rp ${log.total.toLocaleString()}</td>
            </tr>
        `;
    });
    incomeEl.innerText = "Rp " + income.toLocaleString();
}

function resetHistory() {
    if (confirm("Reset riwayat & omset?")) {
        localStorage.removeItem('sobat_v4_logs');
        historyLogs = [];
        renderHistory();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    setInterval(() => {
        const clock = document.getElementById('clock');
        if (clock) clock.innerText = new Date().toLocaleTimeString('id-ID');
    }, 1000);
});
