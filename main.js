/**
 * Create an item product
 * @param {number} number
 * @param {string} description
 * @param {number} price
 * @param {number} units
 * @returns {HTMLDivElement} Item
 */
function createItem(number, description, price, units) {
    const itemElement = document.createElement('div');
    itemElement.id = `item:${number}`;
    itemElement.className = 'item';
    itemElement.setAttribute('translate', 'no');

    const numberElement = document.createElement('div');
    numberElement.textContent = number.toString();
    numberElement.className = 'item-col-sm';
    itemElement.appendChild(numberElement);

    const descriptionElement = document.createElement('div');
    descriptionElement.textContent = description.trim();
    descriptionElement.className = 'item-col-lg';
    itemElement.appendChild(descriptionElement);

    const priceElement = document.createElement('div');
    priceElement.textContent = `$${price.toLocaleString('en-US')}`;
    priceElement.className = 'item-col-md';
    priceElement.setAttribute('hide', 'false');
    itemElement.appendChild(priceElement);

    const unitsElement = document.createElement('div');
    unitsElement.textContent = units.toString();
    unitsElement.className = 'item-col-md';
    itemElement.appendChild(unitsElement);

    const totalElement = document.createElement('div');
    totalElement.textContent = `$${(price * units).toLocaleString('en-US')}`;
    totalElement.className = 'item-col-md';
    totalElement.setAttribute('hide', 'false');
    itemElement.appendChild(totalElement);

    return itemElement;
}

/**
 * Gets the data stored in localStorage by locating it by key
 * @param {string} key
 * @returns {any} Data
 */
function getStorage(key) {
    const data = localStorage.getItem('data');
    if (!data) return;

    return JSON.parse(data)[key];
}

/**
 * Save the data in localStorage locating it by key
 * @param {string} key
 * @param {any} value
 */
function setStorage(key, value) {
    const data = JSON.parse(localStorage.getItem('data')) || {};
    data[key] = value;

    localStorage.setItem('data', JSON.stringify(data));
}

/**
 * Loads all values into storage and assigns them to their respective elements
 */
function loadStorage() {
    const data = JSON.parse(localStorage.getItem('data')) || {};
    for (const key in data) {
        if (!data.hasOwnProperty(key) || key === 'items') continue;
        const element = document.getElementById(key);
        if (!element) continue;

        if (element.tagName === 'TEXTAREA' || (element.tagName === 'INPUT' && element.type !== 'file')) {
            element.value = data[key];
        } else if (element.tagName === 'IMG') {
            element.src = data[key];
        } else {
            element.textContent = data[key];
        }
    }

    let total = 0;
    const itemsElement = document.getElementById('items');
    data.items?.forEach((item) => {
        total += item.price * item.units;
        const itemElement = createItem(item.number, item.description, item.price, item.units);
        itemsElement.appendChild(itemElement);
    });

    const totalElement = document.getElementById('total');
    if (totalElement) totalElement.textContent = `$${total.toLocaleString('en-US')}`;
}

/**
 * Add item to the main from item list
 * Save item in localStorage
 * !Only for FORM usages
 */
function addItem() {
    const number = document.querySelectorAll('[id*="item:"]').length + 1;
    const description = document.getElementById('itemDescription').value;
    const price = parseInt(document.getElementById('itemPrice').value);
    const units = parseInt(document.getElementById('itemUnits').value);

    if (!description || !price || !units) return;

    const itemElement = createItem(number, description, price, units);
    document.getElementById('items').appendChild(itemElement);

    // Save data item in localStorage
    const items = getStorage('items') || [];
    items.push({ number, description, price, units });
    setStorage('items', items);
}

/**
 * Delete item to the main from item list
 * Delete item in localStorage
 * !Only for FORM usages
 */
function deleteItem() {
    const number = parseInt(document.getElementById('itemDelete').value);
    if (!number) return;
    document.getElementById(`item:${number}`).remove();

    // Update number column
    document.querySelectorAll('[id*="item:"]').forEach((item, index) => {
        const newNumber = index + 1;
        item.id = `item:${newNumber}`;
        item.children[0].textContent = newNumber.toString();
    });

    // Update storage
    const items = getStorage('items')
        .filter((item) => item.number !== number)
        .map((item, index) => ({ ...item, number: index + 1 }));

    setStorage('items', items);
}

/**
 * Save input value in storage
 * !Only for FORM usages
 * @param {HTMLInputElement} input
 */
function saveInputValue(input) {
    if (input.type === 'file') {
        const file = input.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => setStorage(input.id, reader.result));
        reader.readAsDataURL(file);

        return;
    }

    setStorage(input.id, input.value);
}

/**
 * Change PDF type
 * !Only for BILL usages
 * @param {HTMLButtonElement} button
 */
function changePDF(button) {
    document.querySelectorAll('[hide]').forEach((element) => {
        const hide = element.getAttribute('hide') === 'true' ? false : true;
        element.style.display = hide ? 'none' : '';
        element.setAttribute('hide', hide);
    });

    if (localStorage.getItem('type') === 'bill') {
        localStorage.setItem('type', 'order');
        document.getElementById('billNumber').textContent = `Order No. ${getStorage('billNumber')}`;
        button.textContent = 'Order';
    } else {
        localStorage.setItem('type', 'bill');
        document.getElementById('billNumber').textContent = `Invoice No. ${getStorage('billNumber')}`;
        button.textContent = 'Invoice';
    }
}

/**
 * Generates a PDF according to the content of "pdf" and downloads them
 * !Only for BILL usages
 */
function downloadPDF() {
    const billNumber = document.getElementById('billNumber');
    const type = localStorage.getItem('type') == 'bill' ? 'Factura' : 'Pedido';
    const filename = `${type} ${billNumber.textContent}.pdf`;
    html2pdf().from(document.getElementById('pdf')).save(filename);
}
