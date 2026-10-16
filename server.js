require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { saveOrder, getOrder } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.get('/generate', async (req, res) => {
  const orderId = req.query.orderId;
  const order = getOrder(orderId);

  if (!order) {
    return res.status(404).send('Order not found. Please try again or check the Order ID.');
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #fffaf0;">
          <h1 style="color: #b76e79; font-size: 36px; margin-bottom: 10px;">${order.bride} & ${order.groom}</h1>
          <p style="font-size: 18px; color: #555;">Wedding Date: <strong>${order.date || 'N/A'}</strong></p>
          <p style="font-size: 18px; color: #555;">Venue: <strong>${order.venue || 'N/A'}</strong></p>
          <hr style="border: 0; border-top: 1px solid #b76e79; margin: 30px auto; width: 60%;">
          <p style="font-size: 14px; color: #888;">Language: ${order.language} | Design: ${order.design} | Package: ${order.package}</p>
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="wedding-kit.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});