# CSS Buttons Note (selector → ไฟล์ → บรรทัด)

> ไฟล์นี้ทำไว้เป็น “โน้ตตามหา CSS ของปุ่ม” ว่าปุ่ม/สไตล์ปุ่มอยู่ไฟล์ไหนและบรรทัดไหน  
> โฟกัสเฉพาะที่เจอใน `frontend/src/styles/**`

## Global (ใช้ได้หลายหน้า)

- **Base `<button>` ทั้งระบบ**
  - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
  - **บรรทัด**: 58–74

- **ชุดปุ่มมาตรฐาน `.btn` + variants**
  - **`.btn`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 76–90
  - **`.btn-primary` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 92–104
  - **`.btn-secondary` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 106–118
  - **`.btn-success` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 120–131
  - **`.btn-warning` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 133–144
  - **`.btn-danger` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 146–157
  - **Sizes `.btn-sm` / `.btn-lg` / `.btn-xl`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 159–178
  - **Focus/Active `.btn:focus` / `.btn:active`**
    - **ไฟล์**: `frontend/src/styles/components/GlobalBase.css`
    - **บรรทัด**: 180–187

## Auction (ปุ่มประมูล/ปุ่มในรายละเอียด)

- **ปุ่มหลักยื่นราคา/ซื้อทันที `.btn-bid-primary`**
  - **ไฟล์**: `frontend/src/styles/components/AuctionDetail.css`
  - **บรรทัด**: 399–410

- **ปุ่มในหน้า AddAuction (scope เฉพาะฟอร์ม)**
  - **`.add-auction-form .btn-bid-primary`**
    - **ไฟล์**: `frontend/src/styles/components/AuctionDetail.css`
    - **บรรทัด**: 412–419
  - **`.add-auction-form .btn-secondary` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/AuctionDetail.css`
    - **บรรทัด**: 421–433

- **ปุ่มแท็บในหน้า auction `.auction-tab-button`**
  - **ไฟล์**: `frontend/src/styles/components/AuctionDetail.css`
  - **บรรทัด**: 448–465

## Chat (ปุ่มส่งข้อความ/ปุ่มไอคอน)

- **ปุ่ม action ไอคอนใน input `.action-btn` / `:hover`**
  - **ไฟล์**: `frontend/src/styles/components/Chat.css`
  - **บรรทัด**: 404–416

- **ปุ่มส่ง `.send-btn` / `:hover` / `:disabled`**
  - **ไฟล์**: `frontend/src/styles/components/Chat.css`
  - **บรรทัด**: 418–436

## Navbar / User Menu

- **ปุ่มเปิด user menu `.user-menu__button`**
  - **ไฟล์**: `frontend/src/styles/components/Navbar.css`
  - **บรรทัด**: 237–241

## Payments / Orders (ปุ่มในรายการคำสั่งซื้อ/ออเดอร์)

- **จัด layout ปุ่มใน action bar (ทำให้ `.btn` สูง/หนาขึ้น)**
  - **selector**: `.auction-order-actions .btn`
  - **ไฟล์**: `frontend/src/styles/components/PaymentsAndRest.css`
  - **บรรทัด**: 845–848

- **dialog footer ในหน้า admin/order ทำให้ปุ่มเต็มความกว้างบนมือถือ**
  - **selector**: `.dialog-footer .btn`
  - **ไฟล์**: `frontend/src/styles/components/AdminAndOrders.css`
  - **บรรทัด**: 942–945

## Modal / Dialog / Alert / Loading

- **Modal พื้นฐาน (overlay/content/header/body/footer)**
  - **`.modal-overlay`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 7–19
  - **`.modal-content`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 21–30
  - **`.modal-header`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 43–49
  - **`.modal-title`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 51–56
  - **ปุ่มปิด modal `.modal-close` / `:hover`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 58–72
  - **`.modal-body`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 74–76
  - **`.modal-footer`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 78–84

- **Loading**
  - **`.loading`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 87–94
  - **`.spinner`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 96–104

- **Alerts**
  - **`.alert` (base)**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 112–117
  - **`.alert-success`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 119–123
  - **`.alert-warning`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 125–129
  - **`.alert-error`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 131–135
  - **`.alert-info`**
    - **ไฟล์**: `frontend/src/styles/components/UiModalsLoadingAlerts.css`
    - **บรรทัด**: 137–141

- **Dialog footer (order/admin)**
  - **`.dialog-footer` (layout ของปุ่มใน dialog)**
    - **ไฟล์**: `frontend/src/styles/components/AdminAndOrders.css`
    - **บรรทัด**: 911–919

## Upload / Cards

- **ปุ่มลบรูป preview `.remove-image-btn` / `:hover`**
  - **ไฟล์**: `frontend/src/styles/components/UiCards.css`
  - **บรรทัด**: 124–146

