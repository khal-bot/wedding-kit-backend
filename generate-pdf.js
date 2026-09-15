const puppeteer = require('puppeteer');

async function generatePdf(bride, groom, date, venue) {
  // Use environment check for executablePath so it works locally on Windows and remotely on Render
  const executablePath = process.env.NODE_ENV === 'production' 
    ? process.env.PUPPETEER_EXECUTABLE_PATH || undefined 
    : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    ...(executablePath && { executablePath }),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();
  console.log('PDF created for ' + bride + ' & ' + groom);
  
  return pdfBuffer;
}

module.exports = { generatePdf };