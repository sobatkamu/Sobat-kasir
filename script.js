const menuData = [
    { id: 1, name: "Nasi Chiken BaBol", price: 18000, cat: "food" },
    { id: 2, name: "Burger Kamu", price: 20000, cat: "food" },
    { id: 3, name: "Nasi Goreng", price: 15000, cat: "food" },
    { id: 4, name: "Mitcha Sobat", price: 10000, cat: "drink" },
    { id: 5, name: "Es Jeruk", price: 7000, cat: "drink" },
    { id: 6, name: "Nutrisari", price: 7000, cat: "drink" }
];

let cart = [];
let allOrders = JSON.parse(localStorage.getItem('sobatPOS_Orders')) || [];

// 1. Render Menu (Memastikan daftar muncul)
function renderMenu() {
    const foodDiv = document.getElementById('food-menu');
    const drinkDiv = document.getElementById('drink-menu');
    
    foodDiv.innerHTML = ""; drinkDiv.innerHTML = ""; // Clear
    
    menuData.forEach(item => {
        const card = `
            <div class="menu-card">
                <h4>${item.name}</h4>
                <p class="menu-price">Rp ${item.price.toLocaleString()}</p>
                <button class="btn-add" onclick="addToCart('${item.name}', ${item.price})">Tambah</button>
            </div>
        `;
        if(item.cat === 'food') foodDiv.innerHTML += card;
        else drinkDiv.innerHTML += card;
    });
}

// 2. Keranjang
function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price, 0);
    document.getElementById('cart-count').innerText = cart.length;
    document.getElementById('current-total').innerText = "Rp " + total.toLocaleString();
}

// 3. Proses Pesanan (Default: Belum Diantar)
function processOrder() {
    if (cart.length === 0) return alert("Pilih menu dulu!");
    
    const newOrder = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((s, i) => s + i.price, 0),
        status: 'pending', // Awal: Belum Diantar
        time: new Date().toLocaleTimeString()
    };
    
    allOrders.unshift(newOrder);
    saveData();
    cart = [];
    updateCartUI();
    alert("Pesanan masuk ke daftar tunggu!");
    renderHistory();
}

// 4. Update Status (Selesai/Batal)
function updateStatus(orderId, newStatus) {
    allOrders = allOrders.map(order => {
        if(order.id === orderId) order.status = newStatus;
        return order;
    });
    saveData();
    renderHistory();
}

// 5. Render Riwayat & Pemasukan
function renderHistory() {
    const list = document.getElementById('history-list');
    const incomeDisplay = document.getElementById('total-income');
    list.innerHTML = "";
    
    let totalPemasukan = 0;

    allOrders.forEach(order => {
        if(order.status === 'done') totalPemasukan += order.total;
        
        const statusText = order.status === 'pending' ? 'Belum Diantar' : (order.status === 'done' ? 'Selesai' : 'Dibatalkan');
        const statusClass = order.status === 'pending' ? 'status-pending' : (order.status === 'done' ? 'status-done' : 'status-canceled');
        
        list.innerHTML += `
            <div class="order-item">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <p><strong>${order.items.map(i => i.name).join(", ")}</strong></p>
                <p>Total: Rp ${order.total.toLocaleString()} (${order.time})</p>
                
                ${order.status === 'pending' ? `
                    <div class="action-btns">
                        <button class="btn-status btn-done" onclick="updateStatus(${order.id}, 'done')">Sudah Sampai</button>
                        <button class="btn-status btn-cancel" onclick="updateStatus(${order.id}, 'canceled')">Batalkan</button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    incomeDisplay.innerText = "Rp " + totalPemasukan.toLocaleString();
}

function saveData() {
    localStorage.setItem('sobatPOS_Orders', JSON.stringify(allOrders));
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    document.getElementById(`btn-tab-${tab}`).classList.add('active');
    document.getElementById('checkout-bar').style.display = (tab === 'order') ? 'flex' : 'none';
}

function clearAllData() {
    if(confirm("Hapus semua data hari ini?")) {
        allOrders = [];
        saveData();
        renderHistory();
    }
}

// Jalankan saat pertama buka
renderMenu();
renderHistory();
