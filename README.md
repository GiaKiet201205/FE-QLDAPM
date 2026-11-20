# GK Academy Frontend

React + Vite frontend for the GK Academy.

## Chạy hai website riêng trên localhost

```bash
npm install
npm run dev
```

Lệnh này chạy đồng thời hai ứng dụng:

| Website | Địa chỉ | Chức năng |
| --- | --- | --- |
| Bán hàng | http://localhost:5173 | Trang chủ, khóa học, đăng ký/đăng nhập học viên, thanh toán, hồ sơ |
| Quản lý | http://localhost:5174 | Mở trang đăng nhập nhân viên; sau đăng nhập vào màn hình theo vai trò |

Hai ứng dụng có bộ định tuyến và phiên đăng nhập riêng theo cổng. Nhập `/login`
trên cổng 5173 chỉ mở đăng nhập học viên; nhập `/admin` trên cổng này quay về
trang chủ bán hàng. Cổng 5174 không có các trang bán hàng. Không có liên kết
chuyển sang cổng nhân viên trên website bán hàng.

Chạy riêng từng bên bằng `npm run dev:shop` hoặc `npm run dev:admin`.
Các cổng được cố định; nếu cổng đang được sử dụng, Vite báo lỗi thay vì tự đổi cổng.

Backend dùng chung tại `http://localhost:8080/api`. Hai Vite server chuyển tiếp
`/api` về backend để trình duyệt gọi API trên cùng cổng frontend, tránh lỗi CORS
khi dùng cổng quản lý mới. JWT và phân quyền API vẫn được backend kiểm tra.
`API_PROXY_TARGET` cấu hình địa chỉ backend cho Vite; khởi động lại Vite sau khi đổi.
Nếu `.env` cũ có `VITE_API_URL=http://localhost:8080/api`, đổi thành `/api`.
Khi triển khai bản build, cấu hình reverse proxy `/api` hoặc đặt `VITE_API_URL`
thành URL backend có CORS cho tên miền frontend.

`npm run build` tạo hai bản riêng trong `dist/shop` và `dist/admin`.
Xem bản build bằng `npm run preview:shop` và `npm run preview:admin`.
Bộ E2E quản lý mặc định chạy với cổng 5174.

## Backend integration

Student Management and Class Management are connected to the Spring Boot API in
`Santadura/BE-QLDAPM-clone`.

Create a local environment file:

```bash
cp .env.example .env
```

Default API URL:

```properties
VITE_API_URL=/api
API_PROXY_TARGET=http://127.0.0.1:8080
```

Start the backend first, including PostgreSQL migration and seed, then run:

```bash
npm install
npm run dev
```

The seeded development accounts use password `123456`, including:

- `admin`
- `teacher001`
- `cs001`

The authenticated backend role controls the available sidebar routes and data
scope. The old client-side role switcher is intentionally disabled for the real
JWT workflow.

## Integrated workflow

The following flows now use backend APIs and persisted PostgreSQL data:

- login with JWT
- Student list/detail/create/update/delete/status
- Student course targets
- Class list/detail/create/update/status
- Student eligibility and ClassStudent roster changes
- Assignment and Exam lifecycle
- StudentResult grading and feedback
- Admin support override for an existing StaffSchedule

Availability, normal TC/CM scheduling, payroll and statistics remain separate
follow-up integrations.

## GK Academy storefront

The desktop storefront follows the supplied reference screens: home, course
catalog, course details with class selection, opening schedule, cart and registration. Photography is served locally from `public/images` (sources in that
folder's README). The desktop layout targets viewports of at least 1100px.

Courses and opening schedules now come from `GET /api/store/catalog`.
`StoreDataProvider` owns the API state, loading/errors and refresh on navigation
or window focus. Public requests do not send stale credentials. No mock catalog
or browser-only purchase completion is used in the active storefront.

Signed-in carts, contact profiles, registrations and consultation requests are
persisted by the backend. Guest carts stay browser-local and can be imported
explicitly after login. Old browser demo purchases are not real enrollments and
are not imported. Checkout creates a PENDING registration and a VNPAY/MoMo payment attempt when
the selected gateway is configured. A dedicated payment page generates QR locally,
polls backend status, and shows success only after a verified provider IPN.
Sandbox merchant keys and a public HTTPS callback origin are required. The profile reads registration history from the server, including after
logging in on a different browser.

Admins can edit course metadata, publish classes and process registrations at
`http://localhost:5174/admin/storefront`. See the backend README section
[Đồng bộ website](../BE-QLDAPM/README.md#đồng-bộ-website-bán-khóa-học-với-postgresql).
Changes appear when reloading, navigating or returning focus to the storefront.
New backend code requires a backend restart after applying migrations.


## Biểu tượng GK 3D

Trang chủ có biểu tượng sách mở và mũ tốt nghiệp tự thiết kế cho GK.
`public/models/gk-learning-emblem.glb` là mô hình không texture, khoảng 105 KB,
1.220 tam giác, có thể nhập vào Blender bằng **File → Import → glTF 2.0**.
Mã tạo hình nằm ở `scripts/generate-gk-model.py`; chạy bằng Python tiêu chuẩn
để tạo lại GLB. Sau khi chỉnh trong Blender, xuất GLB vào cùng đường dẫn.

Three.js được tách thành phần tải riêng khi mô hình gần xuất hiện trong màn hình.
Trình xem giới hạn 30 FPS, tự dừng khi ra ngoài vùng nhìn hoặc ẩn tab; hỗ trợ
kéo chuột và phím mũi tên trong khung toàn chiều ngang, không hiển thị nút
điều khiển. Mô hình tự chuyển động chậm khi không tương tác. Tùy chọn giảm chuyển
động của hệ điều hành được tôn trọng. Nếu WebGL hoặc tệp mô hình không tải được,
trang hiển thị ảnh SVG cục bộ thay thế.


Typography uses locally served Be Vietnam Pro Latin and Vietnamese WOFF2 subsets
(weights 400–800) under `public/fonts`; the SIL Open Font License is included
as `public/fonts/OFL.txt`. No external Google Fonts request is required.

## Đăng nhập Google / Facebook

Trang đăng nhập và đăng ký dùng chung nút Google/Facebook. Lần đầu xác thực tạo
học viên trong backend; lần sau tiếp tục với cùng tài khoản. Hồ sơ có mục
**Đăng nhập nhanh** để liên kết với tài khoản GK đã có. Không tự gộp email trùng.
Tùy chọn Ghi nhớ đăng nhập được giữ khi đi qua nhà cung cấp.

FE không chứa Client Secret. Dùng `VITE_API_URL=/api` để OAuth callback và API
đi qua Vite proxy cùng origin. Backend cung cấp trạng thái cấu hình; nhà cung cấp
chưa có khóa sẽ có nút vô hiệu hóa kèm giải thích, không giả lập đăng nhập thành công.

Xem [hướng dẫn tạo app Google/Meta và cấu hình backend](../BE-QLDAPM/README.md#đăng-nhập--đăng-ký-google-và-facebook).
Callback mặc định là `http://localhost:5173/api/oauth2/callback/google` và
`http://localhost:5173/api/oauth2/callback/facebook`. Sau khi điền khóa, khởi động
lại BE. Cần kiểm tra đăng nhập thật bằng app đã cấu hình; test tự động chỉ mô phỏng
phản hồi của nhà cung cấp. Luồng này không thay đổi đăng nhập nhân viên ở cổng 5174.


## Thanh toán sandbox VNPAY / MoMo

Trang `/checkout/:courseId` chọn phương thức, sau đó chuyển tới `/payment/:orderId`.
QR VNPAY mở URL cổng thanh toán; QR MoMo dùng dữ liệu nhà cung cấp trả về, không
phải ảnh tải từ dịch vụ QR bên ngoài. Nút mở cổng giữ cùng tab để phiên đăng nhập
được giữ khi quay lại. Khi quét bằng điện thoại, trang trên máy tính tiếp tục chờ
IPN và cập nhật kết quả từ backend mỗi 3 giây.

Không đọc `vnp_ResponseCode`/`resultCode` từ URL để tự đánh dấu thành công. Không
có nút giả lập trả tiền trên web. Khi chưa có cấu hình merchant, các phương thức
hiển thị chưa kích hoạt. Lịch sử tài khoản và cổng quản lý phân biệt trạng thái
thanh toán với trạng thái ghi danh.

Xem [hướng dẫn đăng ký sandbox, IPN HTTPS và biến môi trường](../BE-QLDAPM/README.md#thanh-toán-vnpay--momo-sandbox).
Sau khi cập nhật code cần khởi động lại backend đang chạy; không chạy hai tiến
trình cùng cổng 8080. Các kiểm tra tự động mô phỏng phản hồi nhà cung cấp; cần thử
luồng sandbox thật sau khi có khóa riêng.
