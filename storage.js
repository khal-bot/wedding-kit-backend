const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'orders.json');

function loadOrders() {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function saveOrder(id, data) {
  const orders = loadOrders();
  orders[id] = data;
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
  console.log('Saved order:', id, data);
}

function getOrder(id) {
  const orders = loadOrders();
  return orders[id];
}

module.exports = { saveOrder, getOrder };