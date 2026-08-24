const orders = {};

function saveOrder(id, data) {
  orders[id] = data;
  console.log('Saved order:', id, data);
}

function getOrder(id) {
  return orders[id];
}

module.exports = { saveOrder, getOrder };