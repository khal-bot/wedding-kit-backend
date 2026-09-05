require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { saveOrder, getOrder } = require('./storage');
const { buildFullKitHTML } = require('./generateKit');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/', (req, res) => {
  res.send('Wedding Kit backend is running!');
});

app.post('/save-order', (req, res) => {
  const orderId = 'order_' + Date.now();
  saveOrder(orderId, req.body);
  res.json({ orderId: orderId });
});

async function generateAndSendPDF(order, buyerEmail) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const htmlContent = buildFullKitHTML(order);

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: buyerEmail,
    subject: 'Your Personalized Wedding Kit is Ready!',
    text: `Hi! Thank you for your purchase. Your personalized wedding kit for ${order.bride} & ${order.groom} is attached.`,
    attachments: [
      {
        filename: 'wedding-kit.pdf',
        content: pdfBuffer
      }
    ]
  });

  console.log('Email sent to:', buyerEmail);
}

app.post('/gumroad-webhook', async (req, res) => {
  console.log('Gumroad webhook received:', req.body);
  const orderId = req.body.url_params ? req.body.url_params.order_id : null;
  const buyerEmail = req.body.email;

  if (orderId && buyerEmail) {
    const order = getOrder(orderId);
    if (order) {
      try {
        await generateAndSendPDF(order, buyerEmail);
        console.log('PDF generated and emailed for order:', orderId);
      } catch (error) {
        console.log('Error generating/sending PDF:', error.message);
      }
    } else {
      console.log('Order not found for ID:', orderId);
    }
  }

  res.status(200).send('OK');
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

  const htmlContent = buildFullKitHTML(order);

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});