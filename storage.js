const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'orders_data.json');

function loadOrders() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return {};
}

function saveOrder(id, data) {
  const orders = loadOrders();
  orders[id] = data;
  try {
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
    console.log('Saved order successfully to file:', id);
  } catch (err) {
    console.error('Error writing order to file:', err);
  }
}

function getOrder(id) {
  const orders = loadOrders();
  return orders[id];
}

module.exports = { saveOrder, getOrder };