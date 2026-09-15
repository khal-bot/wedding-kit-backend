const express = require('express');
const path = require('path');
const { saveOrder, getOrder } = require('./storage');
const { generatePdf } = require('./generate-pdf');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'templates')));

// Route to save order details and generate PDF
app.post('/api/save-order', async (req, res) => {
  try {
    const orderId = Date.now().toString();
    const orderData = req.body;

    // Save to Upstash Redis database
    await saveOrder(orderId, orderData);

    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// Route to fetch order details by ID
app.get('/api/order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderData = await getOrder(orderId);

    if (!orderData) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});