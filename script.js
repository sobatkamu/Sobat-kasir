const menuData = [
    { id: 1, name: "Nasi Chiken BaBol", price: 18000, cat: "makanan" },
    { id: 2, name: "Burger Kamu", price: 20000, cat: "makanan" },
    { id: 3, name: "Nasi Goreng", price: 15000, cat: "makanan" },
    { id: 4, name: "Mitcha Sobat", price: 10000, cat: "minuman" },
    { id: 5, name: "Es Jeruk", price: 7000, cat: "minuman" },
    { id: 6, name: "Nutrisari", price: 7000, cat: "minuman" }
];

let cart = [];
let allOrders = JSON.parse(localStorage.getItem('sobatPOS_Final')) || [];

function renderMenu() {
    const foodDiv = document.getElementById('food-menu');
    const drinkDiv = document.getElementById('drink-menu');
    foodDiv.innerHTML = ""; drinkDiv.innerHTML = "";
    
    menuData.forEach(item => {
        const card = `
            <div class="menu-card">
                <h4>${item.name}</h4>
                <p class="menu-price">Rp ${item.price.toLocaleString()}</p>
                <button class="btn-add" onclick="addToCart(${item.id})">Tambah</button>
            </div>`;
        if(item.cat === 'makanan') foodDiv.innerHTML += card;
        else drinkDiv.innerHTML += card;
    });
}

function addToCart(id) {
    const item = menuData.find(m => m.id === id);
    cart.push(item);
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('cart-count').innerText = cart.length;
    document.getElementById('current-total').innerText = "Rp " + total.toLocaleString();
}

function processOrder() {
    if (cart.length === 0) return alert("Keranjang kosong!");
    const newOrder = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((s, i) => s + i.price, 0),
        status: 'pending',
        time: new Date().toLocaleTimeString()
    };
    allOrders.unshift(newOrder);
    localStorage.setItem('sobatPOS_Final', JSON.stringify(allOrders));
    cart = []; updateCartUI();
    alert("Pesanan Disimpan!");
    renderHistory();
}

function updateStatus(orderId, status) {
    allOrders = allOrders.map(o => o.id === orderId ? {...o, status} : o);
    localStorage.setItem('sobatPOS_Final', JSON.stringify(allOrders));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const incomeDisplay = document.getElementById('total-income');
    list.innerHTML = "";
    let totalIncome = 0;

    allOrders.forEach(order => {
        if(order.status === 'done') totalIncome += order.total;
        
        // Logika Pengelompokan Item & Kategori
        const groupItems = (items) => {
            const counts = {};
            items.forEach(i => counts[i.name] = (counts[i.name] || 0) + 1);
            return Object.entries(counts).map(([name, qty]) => `${name} (x${qty})`);
        };

        const makanan = groupItems(order.items.filter(i => i.cat === 'makanan'));
        const minuman = groupItems(order.items.filter(i => i.cat === 'minuman'));

        list.innerHTML += `
            <div class="order-item status-${order.status}">
                <div class="order-header">
                    <span class="badge">${order.status === 'pending' ? 'Belum Diantar' : order.status}</span>
                    <small>${order.time}</small>
                </div>
                
                <div class="order-details">
                    ${makanan.length ? `<p><strong>🍴 Makanan:</strong> ${makanan.join(", ")}</p>` : ''}
                    ${minuman.length ? `<p><strong>🥤 Minuman:</strong> ${minuman.join(", ")}</p>` : ''}
                </div>
                <p class="order-total">Total: Rp ${order.total.toLocaleString()}</p>
                
                ${order.status === 'pending' ? `
                    <div class="action-btns">
                        <button class="btn-status btn-done" onclick="updateStatus(${order.id}, 'done')">Selesai</button>
                        <button class="btn-status btn-cancel" onclick="updateStatus(${order.id}, 'canceled')">Batal</button>
                    </div>` : ''}
            </div>`;
    });
    incomeDisplay.innerText = "Rp " + totalIncome.toLocaleString();
}

function showTab(tab) {
    document.querySelectorAll('.tab-content, .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
    document.getElementById('checkout-bar').style.display = (tab === 'order') ? 'flex' : 'none';
}

renderMenu(); renderHistory();
