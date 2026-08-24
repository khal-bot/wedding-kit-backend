const puppeteer = require('puppeteer');

async function generatePDF(bride, groom, date, venue) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <body style="font-family: Georgia; text-align: center; padding: 50px;">
        <h1 style="color: #b76e79;">${bride} & ${groom}</h1>
        <p>Wedding Date: ${date}</p>
        <p>Venue: ${venue}</p>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.pdf({ path: 'test-output.pdf', format: 'A4' });

  await browser.close();
  console.log('PDF created for ' + bride + ' & ' + groom);
}

generatePDF("Ahmed", "Layla", "2026-06-10", "Grand Hotel");