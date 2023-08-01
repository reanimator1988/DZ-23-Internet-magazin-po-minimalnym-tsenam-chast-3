"use strict";


document.body.addEventListener("click", (event) => {
    const ordersListContainer = document.getElementById("orders-list");
    const myOrdersButton = document.getElementById("my-orders-button");

    if (!ordersListContainer.contains(event.target) && event.target !== myOrdersButton) {
        ordersListContainer.style.display = "none";
    }
});

document.querySelector('.root-nav').onclick = function (event) {
    console.log(event.target.nextElementSibling);
    if (event.target.nodeName !== 'SPAN') return;
    closeAllSubMenu(event.target.nextElementSibling);
    event.target.nextElementSibling.classList.toggle('sub-menu-active');
}

function closeAllSubMenu(current = null) {
    const parents = [];
    if (current) {
        let currentParent = current.parentNode;

        while (currentParent) {
            if (currentParent.classList.contains('root-nav')) break;
            if (currentParent.nodeName === 'UL') parents.push(currentParent);
            currentParent = currentParent.parentNode;
        }
    }

    const subMenu = document.querySelectorAll('.root-nav ul');
    Array.from(subMenu).forEach(item => {
        if (item !== current && !parents.includes(item)) {
            item.style.display = "none";
            item.classList.remove('sub-menu-active');
        } else {
            item.style.display = "block";
        }
    });
}

const buttons = document.querySelectorAll('button');

buttons.forEach((button) => {
    button.addEventListener("click", showOrderForm);
});

const buyButtons = document.querySelectorAll('.buy-button');
buyButtons.forEach((button) => {
    button.addEventListener("click", showOrderForm);
});

let isOrderFormOpen = false;

function calculateTotalPrice(quantity, price) {
    return quantity * price;
}

function showOrderForm(event) {
    if (isOrderFormOpen) {
        return;
    }
    closeAllSubMenu();

    isOrderFormOpen = true;
    const targetLi = event.target.closest('li');
    if (!targetLi) {
        isOrderFormOpen = false;
        return;
    }

    const targetSpan = targetLi.querySelector('span');
    if (!targetSpan) {
        isOrderFormOpen = false;
        return;
    }

    const product = targetSpan.dataset.product;
    const productPrice = parseFloat(targetSpan.dataset.price);
    const orderForm = document.createElement('form');
    orderForm.innerHTML = `
        <label>ПІБ покупця:</label>
        <input type="text" name="name" required><br><br>

        <label>Місто:</label>
        <select name="city" required>
            <option value="">Виберіть місто</option>
            <option value="Одеса">Одеса</option>
            <option value="Дніпро">Дніпро</option>
            <option value="Київ">Київ</option>
            <option value="Миколаїв">Миколаїв</option>
            <option value="Херсон">Херсон</option>
            <option value="Севастополь">Севастополь</option>
        </select><br><br>

        <label>Склад Нової пошти для надсилання:</label>
        <input type="text" name="postOffice" required><br><br>

        <label>Спосіб оплати:</label>
        <input type="radio" name="payment" value="Післяплата" required> Післяплата
        <input type="radio" name="payment" value="Оплата банківською карткою" required> Оплата банківською карткою<br><br>

        <label>Кількість продукції, що купується:</label>
        <input type="number" name="quantity" required><br><br>

        <!-- Добавляем скрытое поле с ценой -->
        <input type="hidden" name="price" value="${productPrice.toFixed(2)}">

        <label>Ціна: ${productPrice.toFixed(2)}</label><br><br>

        <label>Общая стоимость:</label>
        <span id="totalPrice">0.00</span><br><br>

        <label>Коментар до замовлення:</label>
        <textarea name="comment"></textarea><br><br>

        <button>Підтвердити замовлення</button>
    `;

    const quantityInput = orderForm.querySelector('input[name="quantity"]');
    quantityInput.addEventListener('input', (event) => {
        const quantity = parseFloat(event.target.value);
        const totalPrice = calculateTotalPrice(quantity, productPrice);

        const totalPriceElement = orderForm.querySelector('#totalPrice');
        totalPriceElement.textContent = totalPrice.toFixed(2);
    });

    orderForm.addEventListener("submit", submitOrder);

    const orderPopup = document.createElement('div');
    orderPopup.classList.add('order-popup');
    orderPopup.appendChild(orderForm);

    document.body.appendChild(orderPopup);
}

function closeAll() {
    const subMenus = document.querySelectorAll('.root-nav ul');
    subMenus.forEach(subMenu => {
        subMenu.style.display = "none";
        subMenu.classList.remove('sub-menu-active');
    });

    const orderPopups = document.querySelectorAll('.order-popup');
    orderPopups.forEach(popup => {
        popup.remove();
    });
}

function submitOrder(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.elements.name.value;
    const city = form.elements.city.value;
    const postOffice = form.elements.postOffice.value;
    const payment = form.elements.payment.value;
    const quantity = parseFloat(form.elements.quantity.value);
    const price = parseFloat(form.elements.price.value);
    const comment = form.elements.comment.value;

    if (name && city && postOffice && payment && quantity && price) {
        const order = {
            name: name,
            city: city,
            postOffice: postOffice,
            payment: payment,
            quantity: quantity,
            price: price,
            comment: comment,
            date: new Date().toLocaleString()
        };

        saveOrderToLocalStorage(order);

        const orderInfo = document.createElement('div');
        orderInfo.classList.add('information');

        const totalPrice = calculateTotalPrice(quantity, price);

        orderInfo.innerHTML = `
        <p class="order-info">ІНФОРМАЦІЯ ПРО ЗАМОВЛЕННЯ:</p>
        <p class="order-info">ПІБ покупця: ${order.name}</p>
        <p class="order-info">Місто: ${order.city}</p>
        <p class="order-info">Склад Нової пошти для надсилання: ${order.postOffice}</p>
        <p class="order-info">Спосіб оплати: ${order.payment}</p>
        <p class="order-info">Кількість продукції: ${order.quantity}</p>
        <p class="order-info">Ціна товару: ${order.price}</p>
        <p class="order-info">Сума: ${totalPrice.toFixed(2)}</p>
        <p class="order-info">Коментар: ${order.comment}</p>
        <p class="order-info">Дата: ${order.date}</p>
        <button id="okButton">ОК</button>
      `;

        document.body.appendChild(orderInfo);

        const okButton = orderInfo.querySelector('#okButton');
        okButton.addEventListener('click', () => {
            document.body.removeChild(orderInfo);
            closeAll();
            isOrderFormOpen = false;
        });

        const orderPopup = document.querySelector('.order-popup');
        orderPopup.remove();
    }
}

const myOrdersButton = document.getElementById("my-orders-button");
const rootNav = document.querySelector(".root-nav");
const ordersListContainer = document.getElementById("orders-list");
let isMyOrdersMenuOpen = false;

myOrdersButton.addEventListener("click", toggleMyOrdersMenu);

function toggleMyOrdersMenu() {
    if (isMyOrdersMenuOpen) {
        rootNav.style.display = "block";
        ordersListContainer.style.display = "none";
    } else {
        rootNav.style.display = "none";
        showMyOrders();
    }

    isMyOrdersMenuOpen = !isMyOrdersMenuOpen;
}

function showMyOrders() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    ordersListContainer.innerHTML = "";

    if (orders.length === 0) {
        ordersListContainer.innerHTML = "<p>Немає збережених замовлень.</p>";
    } else {
        orders.forEach((order, index) => {
            const orderElement = document.createElement("div");
            orderElement.classList.add("order-item");

            const totalPrice = calculateTotalPrice(parseFloat(order.quantity), parseFloat(order.price));

            orderElement.innerHTML = `
                <p class="order-info">ПІБ покупця: ${order.name}</p>
                <p class="order-info">Дата: ${order.date}</p>
                <p class="order-info">Ціна: ${order.price} грн.</p>
                <p class="order-info">Кількість: ${order.quantity} шт.</p>
                <p class="order-info">Загальна вартість: ${totalPrice.toFixed(2)} грн.</p>
                <button class="delete-button" data-index="${index}">Видалити</button>
                <button class="details-button" data-index="${index}">Подробнее</button>
            `;
            ordersListContainer.appendChild(orderElement);
        });
    }

    ordersListContainer.style.display = "flex";

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", deleteOrder);
    });

    const detailsButtons = document.querySelectorAll(".details-button");
    detailsButtons.forEach((button) => {
        button.addEventListener("click", showOrderDetails);
    });
}


function deleteOrder(event) {
    event.stopPropagation();
    const index = event.target.dataset.index;
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (index >= 0 && index < orders.length) {
        orders.splice(index, 1);
        localStorage.setItem("orders", JSON.stringify(orders));

        const ordersListContainer = document.getElementById("orders-list");
        const orderItem = event.target.closest(".order-item");
        ordersListContainer.removeChild(orderItem);
        showMyOrders();
    }
}

function showOrderDetails(event) {
    const index = event.target.dataset.index;
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const order = orders[index];

    const totalPrice = calculateTotalPrice(parseFloat(order.quantity), parseFloat(order.price));

    const orderInfoPopup = document.createElement('div');
    orderInfoPopup.classList.add('information');

    orderInfoPopup.innerHTML = `
        <p class="order-info">ІНФОРМАЦІЯ ПРО ЗАМОВЛЕННЯ:</p>
        <p class="order-info">ПІБ покупця: ${order.name}</p>
        <p class="order-info">Місто: ${order.city}</p>
        <p class="order-info">Склад Нової пошти для надсилання: ${order.postOffice}</p>
        <p class="order-info">Спосіб оплати: ${order.payment}</p>
        <p class="order-info">Кількість продукції: ${order.quantity}</p>
        <p class="order-info">Ціна товару: ${order.price}</p>
        <p class="order-info">Сума: ${totalPrice.toFixed(2)}</p>
        <p class="order-info">Коментар: ${order.comment}</p>
        <p class="order-info">Дата: ${order.date}</p>
        <button id="okButton">ОК</button>
    `;

    const orderInfoWrapper = document.createElement('div');
    orderInfoWrapper.classList.add('order-info-wrapper');
    orderInfoWrapper.appendChild(orderInfoPopup);

    const orderItem = event.target.closest(".order-item");
    orderItem.appendChild(orderInfoWrapper);

    const okButton = orderInfoPopup.querySelector('#okButton');
    okButton.addEventListener('click', () => {
        orderItem.removeChild(orderInfoWrapper);
    });

    orderInfoWrapper.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function saveOrderToLocalStorage(order) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
}