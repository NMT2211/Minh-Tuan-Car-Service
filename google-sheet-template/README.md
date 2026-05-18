# Google Sheet Lưu Khách Thuê Xe

Bộ này dùng để tạo một Google Sheet gọn, đẹp và dễ theo dõi cho form `ĐỂ LẠI THÔNG TIN` trên website.

## Có gì bên trong

- `setup_leads_sheet.gs`: Apps Script tạo sheet `Leads` và `Dashboard`
- `webapp_submit_to_sheet.gs`: Apps Script nhận submit từ website và ghi vào Google Sheet
- `sample_leads.csv`: mẫu cột để import nhanh nếu cần

## Schema đang đồng bộ với website

Form web hiện gửi các key sau để khớp với Web App:

- `phone`
- `service_value`
- `service_label`
- `pickup_date`
- `return_date`
- `pickup_location`
- `note`
- `source`
- `page_url`
- `submitted_at`
- `user_agent`

Apps Script sẽ ghi vào sheet `Leads` theo thứ tự:

1. `Mã lead`
2. `Ngày tạo`
3. `Cập nhật cuối`
4. `Trạng thái`
5. `Nguồn`
6. `Số điện thoại`
7. `Loại dịch vụ`
8. `Ngày nhận xe`
9. `Ngày trả xe`
10. `Địa điểm nhận xe`
11. `Ghi chú khách`
12. `Hẹn gọi lại`
13. `Ghi chú CSKH`
14. `Đã xử lý`

## Cách dùng nhanh

1. Mở Google Sheet đích.
2. Vào `Extensions -> Apps Script`.
3. Xóa code mặc định.
4. Dán nội dung file `setup_leads_sheet.gs`.
5. Tạo thêm file mới và dán nội dung `webapp_submit_to_sheet.gs`.
6. Chạy hàm `setupRentalLeadsSheet`.
7. Quay lại Google Sheet và refresh.

## Deploy Web App

1. Trong Apps Script, bấm `Deploy -> New deployment`.
2. Chọn loại `Web app`.
3. `Execute as`: `Me`
4. `Who has access`: `Anyone`
5. Copy Web App URL sau khi deploy.
6. Mở [site.js](/d:/NMT/Documents/tool/NMT/page/site.js:6)
7. Dán URL vào:

```js
const rentalLeadConfig = {
  endpoint: "PASTE_WEB_APP_URL_HERE",
};
```

## Google Sheet đã gắn sẵn

File `webapp_submit_to_sheet.gs` đang trỏ sẵn tới spreadsheet:

`1bcd-x6M81wpvTQJel052nIZjOCs_E8V1zs9lJL2z_Sg`
