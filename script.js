let cart = {};
let logs = JSON.parse(localStorage.getItem('sobat_logs')) || [];

// Fungsi Tambah dari Menu atau tombol (+) di keranjang
function addToOrder(name, price) {
    if (cart[name]) {
        cart[name].qty += 1;
    } else {
        cart[name] = { price, qty: 1 };
    }
    updateUI();
}

// Fungsi Kurang (-) di keranjang
function subFromOrder(name) {
    if (cart[name]) {
        cart[name].qty -= 1;
        if (cart[name].qty <= 0) delete cart[name];
    }
    updateUI();
}

function updateUI() {
    const list = document.getElementById('cart-list');
    list.innerHTML = '';
    let total = 0;

    for (let id in cart) {
        let item = cart[id];
        total += item.price * item.qty;
        list.innerHTML += `
            <div class="cart-row">
                <span>${id}</span>
                <div class="qty-ctrl">
                    <button class="btn-mini" onclick="subFromOrder('${id}')">-</button>
                    <span>${item.qty}</span>
                    <button class="btn-mini" onclick="addToOrder('${id}')">+</button>
                </div>
            </div>
        `;
    }
    document.getElementById('total-val').innerText = "Rp " + total.toLocaleString();
    calc();
}

function calc() {
    let total = parseInt(document.getElementById('total-val').innerText.replace(/\D/g,'')) || 0;
    let cash = parseInt(document.getElementById('cash-in').value) || 0;
    let change = cash - total;
    document.getElementById('change-val').innerText = "Rp " + (change < 0 ? 0 : change.toLocaleString());
}

function checkout() {
    let total = parseInt(document.getElementById('total-val').innerText.replace(/\D/g,'')) || 0;
    if (total <= 0) return;

    let newLog = {
        jam: new Date().toLocaleTimeString('id-ID'),
        total: total,
        detail: Object.keys(cart).map(k => `${k}(${cart[k].qty})`).join(", ")
    };

    logs.push(newLog);
    localStorage.setItem('sobat_logs', JSON.stringify(logs));
    cart = {};
    document.getElementById('cash-in').value = '';
    alert("Transaksi Sukses!");
    updateUI();
    renderLogs();
}

function renderLogs() {
    const body = document.getElementById('hist-body');
    body.innerHTML = logs.slice(-10).reverse().map(l => `
        <tr>
            <td><b>${l.jam}</b></td>
            <td>${l.detail}</td>
            <td style="color:#ffdf00; text-align:right">Rp ${l.total.toLocaleString()}</td>
        </tr>
    `).join('');
}

function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(logs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, "SobatKasir_Report.xlsx");
}

window.onload = () => {
    renderLogs();
    setInterval(() => {
        document.getElementById('live-clock').innerText = new Date().toLocaleTimeString('id-ID');
    }, 1000);
    // Auto-play musik saat klik pertama
    document.addEventListener('click', () => document.getElementById('bgMusic').play(), {once: true});
};
