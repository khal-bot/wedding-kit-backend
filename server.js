const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { saveOrder, getOrder } = require('./storage');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Wedding Kit backend is running!');
});

app.post('/save-order', (req, res) => {
  const orderId = 'order_' + Date.now();
  saveOrder(orderId, req.body);
  res.json({ orderId: orderId });
});

app.get('/generate', async (req, res) => {
  const orderId = req.query.orderId;
  const order = getOrder(orderId);

  if (!order) {
    res.status(404).send('Order not found');
    return;
  }

  const browser = await puppeteer.launch({
   
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <body style="font-family: Georgia; text-align: center; padding: 50px;">
        <h1 style="color: #b76e79;">${order.bride} & ${order.groom}</h1>
        <p>Wedding Date: ${order.date}</p>
        <p>Venue: ${order.venue}</p>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});
