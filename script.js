const menus = [
    { name: "Nasi Chiken BaBol", price: 18000, category: "food" },
    { name: "Burger Kamu", price: 20000, category: "food" },
    { name: "Nasi Goreng", price: 15000, category: "food" },
    { name: "Mitcha Sobat", price: 10000, category: "drink" },
    { name: "Es Jeruk", price: 7000, category: "drink" }
];

let cart = [];
let salesHistory = JSON.parse(localStorage.getItem('sobatHistory')) || [];

function initMenu() {
    const foodGrid = document.getElementById('food-menu');
    const drinkGrid = document.getElementById('drink-menu');
    
    menus.forEach(item => {
        const html = `
            <div class="menu-card">
                <h4>${item.name}</h4>
                <p class="menu-price">Rp ${item.price.toLocaleString()}</p>
                <button class="btn-add" onclick="addToCart('${item.name}', ${item.price})">Tambah</button>
            </div>
        `;
        if(item.category === 'food') foodGrid.innerHTML += html;
        else drinkGrid.innerHTML += html;
    });
    updateHistoryUI();
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-count').innerText = cart.length;
    document.getElementById('current-total').innerText = "Rp " + total.toLocaleString();
}

function processOrder() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const order = {
        id: Date.now(),
        items: [...cart],
        total: total,
        time: new Date().toLocaleString('id-ID')
    };

    salesHistory.unshift(order);
    localStorage.setItem('sobatHistory', JSON.stringify(salesHistory));
    
    alert("Pesanan Berhasil Disimpan!");
    cart = [];
    updateCartUI();
    updateHistoryUI();
}

function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    const totalIncomeDisplay = document.getElementById('total-income');
    
    historyList.innerHTML = "";
    let totalIncome = 0;

    salesHistory.forEach(order => {
        totalIncome += order.total;
        let itemsDetail = order.items.map(i => i.name).join(", ");
        historyList.innerHTML += `
            <div class="history-item">
                <small>${order.time}</small>
                <p><strong>${itemsDetail}</strong></p>
                <p style="color: var(--royal-blue)">Total: Rp ${order.total.toLocaleString()}</p>
            </div>
        `;
    });

    totalIncomeDisplay.innerText = "Rp " + totalIncome.toLocaleString();
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Sembunyikan bar checkout jika di tab riwayat
    document.getElementById('checkout-bar').style.display = (tab === 'order') ? 'flex' : 'none';
}

function clearHistory() {
    if(confirm("Hapus semua riwayat pemasukan?")) {
        salesHistory = [];
        localStorage.removeItem('sobatHistory');
        updateHistoryUI();
    }
}

initMenu();
