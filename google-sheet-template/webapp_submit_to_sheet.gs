const RENTAL_LEADS_SPREADSHEET_ID = '1bcd-x6M81wpvTQJel052nIZjOCs_E8V1zs9lJL2z_Sg';
const RENTAL_LEADS_SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const sheet = getLeadsSheet_();
    const data = readPayload_(e);
    const now = new Date();

    const row = [
      createLeadId_(sheet),
      now,
      now,
      'Mới',
      data.source || 'Website',
      data.phone || '',
      data.service_label || data.service_value || '',
      data.pickup_date || '',
      data.return_date || '',
      data.pickup_location || '',
      data.note || '',
      '',
      buildStaffNote_(data),
      false
    ];

    sheet.appendRow(row);
    return jsonOutput_({ ok: true, message: 'Saved' });
  } catch (error) {
    return jsonOutput_({
      ok: false,
      message: error && error.message ? error.message : 'Unknown error'
    });
  }
}

function doGet() {
  return jsonOutput_({
    ok: true,
    message: 'Rental leads web app is running'
  });
}

function getLeadsSheet_() {
  const ss = SpreadsheetApp.openById(RENTAL_LEADS_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RENTAL_LEADS_SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "Leads" khong ton tai. Hay chay setupRentalLeadsSheet truoc.');
  }
  return sheet;
}

function readPayload_(e) {
  const params = (e && e.parameter) || {};
  return {
    phone: cleanString_(params.phone),
    service_value: cleanString_(params.service_value),
    service_label: cleanString_(params.service_label),
    pickup_date: cleanString_(params.pickup_date),
    return_date: cleanString_(params.return_date),
    pickup_location: cleanString_(params.pickup_location),
    note: cleanString_(params.note),
    source: cleanString_(params.source),
    page_url: cleanString_(params.page_url),
    submitted_at: cleanString_(params.submitted_at),
    user_agent: cleanString_(params.user_agent)
  };
}

function cleanString_(value) {
  return value == null ? '' : String(value).trim();
}

function createLeadId_(sheet) {
  const rowNumber = Math.max(sheet.getLastRow(), 1);
  return 'LD-' + Utilities.formatString('%04d', rowNumber);
}

function buildStaffNote_(data) {
  const lines = [];
  if (data.submitted_at) lines.push('Submitted at: ' + data.submitted_at);
  if (data.page_url) lines.push('Page: ' + data.page_url);
  if (data.user_agent) lines.push('UA: ' + data.user_agent);
  return lines.join('\n');
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
