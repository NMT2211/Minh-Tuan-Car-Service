const LEADS_SHEET_NAME = 'Leads';
const DASHBOARD_SHEET_NAME = 'Dashboard';

const LEADS_HEADERS = [
  'Mã lead',
  'Ngày tạo',
  'Cập nhật cuối',
  'Trạng thái',
  'Nguồn',
  'Số điện thoại',
  'Loại dịch vụ',
  'Ngày nhận xe',
  'Ngày trả xe',
  'Địa điểm nhận xe',
  'Ghi chú khách',
  'Hẹn gọi lại',
  'Ghi chú CSKH',
  'Đã xử lý'
];

const STATUS_OPTIONS = [
  'Mới',
  'Đã liên hệ',
  'Đang xử lý',
  'Đã báo giá',
  'Đã xử lý',
  'Cần gọi lại',
  'Không phản hồi',
  'Hủy'
];

const SOURCE_OPTIONS = [
  'Website',
  'Zalo',
  'Facebook',
  'Điện thoại',
  'Giới thiệu',
  'Khác'
];

const SERVICE_OPTIONS = [
  'Tự lái',
  'Có tài',
  'Đi tỉnh',
  'Theo ngày/tháng'
];

const COLUMN = {
  id: 1,
  createdAt: 2,
  updatedAt: 3,
  status: 4,
  source: 5,
  phone: 6,
  service: 7,
  pickupDate: 8,
  returnDate: 9,
  pickupLocation: 10,
  customerNote: 11,
  callbackAt: 12,
  staffNote: 13,
  resolved: 14
};

function setupRentalLeadsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const leads = ensureCleanSheet_(ss, LEADS_SHEET_NAME);
  const dashboard = ensureCleanSheet_(ss, DASHBOARD_SHEET_NAME);

  leads.getRange(1, 1, 1, LEADS_HEADERS.length).setValues([LEADS_HEADERS]);
  leads.setFrozenRows(1);
  leads.getRange(1, 1, 1, LEADS_HEADERS.length)
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#0b7a2b')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  leads.setRowHeight(1, 36);
  leads.setColumnWidth(COLUMN.id, 92);
  leads.setColumnWidth(COLUMN.createdAt, 150);
  leads.setColumnWidth(COLUMN.updatedAt, 150);
  leads.setColumnWidth(COLUMN.status, 128);
  leads.setColumnWidth(COLUMN.source, 110);
  leads.setColumnWidth(COLUMN.phone, 135);
  leads.setColumnWidth(COLUMN.service, 140);
  leads.setColumnWidth(COLUMN.pickupDate, 118);
  leads.setColumnWidth(COLUMN.returnDate, 118);
  leads.setColumnWidth(COLUMN.pickupLocation, 190);
  leads.setColumnWidth(COLUMN.customerNote, 250);
  leads.setColumnWidth(COLUMN.callbackAt, 145);
  leads.setColumnWidth(COLUMN.staffNote, 260);
  leads.setColumnWidth(COLUMN.resolved, 95);

  leads.getRange(2, 1, 2000, LEADS_HEADERS.length)
    .setVerticalAlignment('middle')
    .setWrap(true);

  leads.getRange('A2:A2000').setNumberFormat('@');
  leads.getRange('B2:C2000').setNumberFormat('dd/MM/yyyy HH:mm');
  leads.getRange('H2:I2000').setNumberFormat('dd/MM/yyyy');
  leads.getRange('L2:L2000').setNumberFormat('dd/MM/yyyy HH:mm');
  leads.getRange('N2:N2000').setHorizontalAlignment('center');

  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  leads.getRange('D2:D2000').setDataValidation(statusValidation);

  const sourceValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(SOURCE_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  leads.getRange('E2:E2000').setDataValidation(sourceValidation);

  const serviceValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(SERVICE_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  leads.getRange('G2:G2000').setDataValidation(serviceValidation);

  leads.getRange('N2:N2000').insertCheckboxes();
  leads.getRange('N2:N2000').clearContent();

  leads.getDataRange().createFilter();
  leads.setTabColor('#0b7a2b');
  leads.getRange('A1:N2000').applyRowBanding(SpreadsheetApp.BandingTheme.BLUE);

  applyStatusColors_(leads);
  buildDashboard_(dashboard);
  SpreadsheetApp.flush();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Quản lý lead')
    .addItem('Tạo / làm mới sheet', 'setupRentalLeadsSheet')
    .addSeparator()
    .addItem('Đánh dấu tất cả là Đã xử lý', 'markAllLeadsResolved')
    .addItem('Bỏ đánh dấu tất cả Đã xử lý', 'unmarkAllLeadsResolved')
    .addToUi();
}

function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  if (sheet.getName() !== LEADS_SHEET_NAME) return;
  if (range.getRow() === 1) return;

  const row = range.getRow();
  const rowValues = sheet.getRange(row, 1, 1, LEADS_HEADERS.length).getValues()[0];
  const hasContent = rowValues.slice(COLUMN.status - 1).some(function(value) {
    return value !== '' && value !== false;
  });
  if (!hasContent) return;

  const now = new Date();
  const idCell = sheet.getRange(row, COLUMN.id);
  const createdCell = sheet.getRange(row, COLUMN.createdAt);
  const updatedCell = sheet.getRange(row, COLUMN.updatedAt);
  const statusCell = sheet.getRange(row, COLUMN.status);
  const sourceCell = sheet.getRange(row, COLUMN.source);
  const resolvedCell = sheet.getRange(row, COLUMN.resolved);

  if (!idCell.getValue()) {
    idCell.setValue(createLeadId_(sheet));
  }

  if (!createdCell.getValue()) {
    createdCell.setValue(now);
  }

  updatedCell.setValue(now);

  if (!statusCell.getValue()) {
    statusCell.setValue('Mới');
  }

  if (!sourceCell.getValue()) {
    sourceCell.setValue('Website');
  }

  if (range.getColumn() === COLUMN.resolved) {
    if (resolvedCell.getValue() === true) {
      statusCell.setValue('Đã xử lý');
    } else if (statusCell.getValue() === 'Đã xử lý') {
      statusCell.setValue('Đang xử lý');
    }
  }

  if (range.getColumn() === COLUMN.status) {
    resolvedCell.setValue(statusCell.getValue() === 'Đã xử lý');
  }
}

function markAllLeadsResolved() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const statusRange = sheet.getRange(2, COLUMN.status, lastRow - 1, 1);
  const resolvedRange = sheet.getRange(2, COLUMN.resolved, lastRow - 1, 1);
  const updatedRange = sheet.getRange(2, COLUMN.updatedAt, lastRow - 1, 1);
  const phoneValues = sheet.getRange(2, COLUMN.phone, lastRow - 1, 1).getValues();
  const now = new Date();

  const statusValues = phoneValues.map(function(row) {
    return [row[0] ? 'Đã xử lý' : ''];
  });
  const resolvedValues = phoneValues.map(function(row) {
    return [Boolean(row[0])];
  });
  const updatedValues = phoneValues.map(function(row) {
    return [row[0] ? now : ''];
  });

  statusRange.setValues(statusValues);
  resolvedRange.setValues(resolvedValues);
  updatedRange.setValues(updatedValues);
}

function unmarkAllLeadsResolved() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const statusValues = sheet.getRange(2, COLUMN.status, lastRow - 1, 1).getValues();
  const resolvedRange = sheet.getRange(2, COLUMN.resolved, lastRow - 1, 1);
  const updatedRange = sheet.getRange(2, COLUMN.updatedAt, lastRow - 1, 1);
  const now = new Date();

  const nextStatusValues = statusValues.map(function(row) {
    return [row[0] === 'Đã xử lý' ? 'Đang xử lý' : row[0]];
  });
  const resolvedValues = statusValues.map(function() {
    return [false];
  });
  const updatedValues = statusValues.map(function(row) {
    return [row[0] ? now : ''];
  });

  sheet.getRange(2, COLUMN.status, lastRow - 1, 1).setValues(nextStatusValues);
  resolvedRange.setValues(resolvedValues);
  updatedRange.setValues(updatedValues);
}

function ensureCleanSheet_(ss, name) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  const filter = sheet.getFilter();
  if (filter) {
    filter.remove();
  }
  sheet.clear();
  sheet.clearConditionalFormatRules();
  return sheet;
}

function createLeadId_(sheet) {
  return 'LD-' + Utilities.formatString('%04d', Math.max(sheet.getLastRow(), 1));
}

function applyStatusColors_(sheet) {
  const statusRange = sheet.getRange('D2:D2000');
  const rules = [
    ['Mới', '#e8f5e9', '#1b5e20'],
    ['Đã liên hệ', '#e3f2fd', '#0d47a1'],
    ['Đang xử lý', '#fff8e1', '#8d6e00'],
    ['Đã báo giá', '#ede7f6', '#5e35b1'],
    ['Đã xử lý', '#dff6e4', '#0b7a2b'],
    ['Cần gọi lại', '#fff3e0', '#e65100'],
    ['Không phản hồi', '#f5f5f5', '#616161'],
    ['Hủy', '#ffebee', '#b71c1c']
  ].map(function(item) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(item[0])
      .setBackground(item[1])
      .setFontColor(item[2])
      .setRanges([statusRange])
      .build();
  });

  sheet.setConditionalFormatRules(rules);
}

function buildDashboard_(sheet) {
  sheet.setTabColor('#1f9d55');
  sheet.getRange('A1:E1').merge();
  sheet.getRange('A1').setValue('Dashboard theo dõi lead');
  sheet.getRange('A1')
    .setFontSize(16)
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#0b7a2b')
    .setHorizontalAlignment('center');

  const labels = [
    ['Tổng lead', '=COUNTA(Leads!F2:F)'],
    ['Lead mới', '=COUNTIF(Leads!D2:D;"Mới")'],
    ['Đang xử lý', '=COUNTIF(Leads!D2:D;"Đang xử lý")'],
    ['Đã báo giá', '=COUNTIF(Leads!D2:D;"Đã báo giá")'],
    ['Đã xử lý', '=COUNTIF(Leads!D2:D;"Đã xử lý")'],
    ['Cần gọi lại', '=COUNTIF(Leads!D2:D;"Cần gọi lại")'],
    ['Không phản hồi', '=COUNTIF(Leads!D2:D;"Không phản hồi")']
  ];

  sheet.getRange(3, 1, labels.length, 2).setValues(labels);
  sheet.getRange('A3:A9')
    .setFontWeight('bold')
    .setBackground('#f4faf5');
  sheet.getRange('B3:B9')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#ffffff');

  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 120);
  sheet.getRange('A3:B9').setBorder(true, true, true, true, true, true, '#dbe7dd', SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange('D3').setValue('Ưu tiên xử lý');
  sheet.getRange('D3')
    .setFontWeight('bold')
    .setBackground('#f4faf5');
  sheet.getRange('D4:D7').setValues([
    ['Mới'],
    ['Cần gọi lại'],
    ['Đang xử lý'],
    ['Đã báo giá']
  ]);
  sheet.getRange('E4:E7').setValues([
    ['Cần liên hệ trong ngày'],
    ['Cần hẹn lại cụ thể'],
    ['Cần theo dõi sát'],
    ['Chờ phản hồi để chốt']
  ]);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 210);
}
