let basket = {};
let historyData = JSON.parse(localStorage.getItem('sobat_pos_logs')) || [];

function addToCart(name, price) {
    if (basket[name]) {
        basket[name].qty += 1;
    } else {
        basket[name] = { price, qty: 1 };
    }
    syncUI();
}

function removeFromCart(name) {
    if (basket[name]) {
        basket[name].qty -= 1;
        if (basket[name].qty <= 0) delete basket[name];
    }
    syncUI();
}

function syncUI() {
    const list = document.getElementById('active-items');
    list.innerHTML = '';
    let total = 0;

    for (let key in basket) {
        let item = basket[key];
        total += item.price * item.qty;
        list.innerHTML += `
            <div class="cart-item">
                <span>${key}</span>
                <div>
                    <button class="qty-btn" onclick="removeFromCart('${key}')">-</button>
                    <span style="margin: 0 10px">${item.qty}</span>
                    <button class="qty-btn" onclick="addToCart('${key}')">+</button>
                </div>
            </div>
        `;
    }
    document.getElementById('total-price').innerText = "Rp " + total.toLocaleString();
    calculate();
}

function calculate() {
    let total = parseInt(document.getElementById('total-price').innerText.replace(/\D/g,'')) || 0;
    let cash = parseInt(document.getElementById('cash-input').value) || 0;
    let change = cash - total;
    document.getElementById('change-price').innerText = "Rp " + (change < 0 ? 0 : change.toLocaleString());
}

function finalize() {
    let total = parseInt(document.getElementById('total-price').innerText.replace(/\D/g,'')) || 0;
    if (total <= 0) return;

    let log = {
        waktu: new Date().toLocaleTimeString('id-ID'),
        total: total,
        item: Object.keys(basket).map(k => `${k}(${basket[k].qty})`).join(", ")
    };

    historyData.push(log);
    localStorage.setItem('sobat_pos_logs', JSON.stringify(historyData));
    
    basket = {};
    document.getElementById('cash-input').value = '';
    alert("Transaksi Selesai!");
    syncUI();
    renderLogs();
}

function renderLogs() {
    const body = document.getElementById('history-log');
    body.innerHTML = historyData.slice(-10).reverse().map(l => `
        <tr>
            <td><b>${l.waktu}</b></td>
            <td>${l.item}</td>
            <td style="color:#ffdf00; text-align:right">Rp ${l.total.toLocaleString()}</td>
        </tr>
    `).join('');
}

function downloadExcel() {
    const ws = XLSX.utils.json_to_sheet(historyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, "Laporan_SobatKasir.xlsx");
}

window.onload = () => {
    renderLogs();
    setInterval(() => {
        document.getElementById('live-clock').innerText = new Date().toLocaleTimeString('id-ID');
    }, 1000);
    document.addEventListener('click', () => document.getElementById('bgMusic').play(), {once: true});
};
