const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const darkMode = document.querySelector('.dark-mode');

if (menuBtn && sideMenu) {
    menuBtn.addEventListener('click', () => {
        sideMenu.style.display = 'block';
    });
}

if (closeBtn && sideMenu) {
    closeBtn.addEventListener('click', () => {
        sideMenu.style.display = 'none';
    });
}

if (darkMode) {
    darkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode-variables');
        const span1 = darkMode.querySelector('span:nth-child(1)');
        const span2 = darkMode.querySelector('span:nth-child(2)');
        if (span1) span1.classList.toggle('active');
        if (span2) span2.classList.toggle('active');
    });
}

if (typeof Orders !== 'undefined' && Array.isArray(Orders)) {
    const tbody = document.querySelector('table tbody');
    if (tbody) {
        Orders.forEach(order => {
            const tr = document.createElement('tr');
            const trContent = `
                <td>${order.productName}</td>
                <td>${order.productNumber}</td>
                <td>${order.paymentStatus}</td>
                <td class="${order.status === 'Declined' ? 'danger' : order.status === 'Pending' ? 'warning' : 'primary'}">${order.status}</td>
                <td class="primary">Details</td>
            `;
            tr.innerHTML = trContent;
            tbody.appendChild(tr);
        });
    }
}