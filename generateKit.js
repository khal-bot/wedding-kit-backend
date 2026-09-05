const fs = require('fs');
const path = require('path');

function fillTemplate(templateContent, order) {
  return templateContent
    .replace(/{{bride}}/g, order.bride || '')
    .replace(/{{groom}}/g, order.groom || '')
    .replace(/{{date}}/g, order.date || '')
    .replace(/{{venue}}/g, order.venue || '')
    .replace(/{{parentNames}}/g, "The families of the couple")
    .replace(/{{rsvpDate}}/g, order.date || '');
}

function buildFullKitHTML(order) {
  const templateFiles = [
    'checklist-en.html',
    'budget-en.html',
    'guestlist-en.html',
    'vendors-en.html',
    'timeline-en.html',
    'seating-en.html',
    'invitation-en.html',
    'rsvp-en.html'
  ];

  let combinedHTML = '';

  templateFiles.forEach((file, index) => {
    const filePath = path.join(__dirname, 'templates', file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = fillTemplate(content, order);

    content = content.replace(/<\/?html>/g, '').replace(/<\/?head>/g, '').replace(/<\/?body>/g, '');

    const pageBreak = index < templateFiles.length - 1 ? '<div style="page-break-after: always;"></div>' : '';
    combinedHTML += content + pageBreak;
  });

  return `<html><body>${combinedHTML}</body></html>`;
}

module.exports = { buildFullKitHTML };