## Lighthouse Trace Errors (NO_NAVSTART)

- Lỗi: Lighthouse báo `NO_NAVSTART`, không ghi nhận được Navigation Start nên tất cả chỉ số (FCP, LCP, TBT, CLS, Speed Index) bị `Error!`.
- Nguyên nhân phổ biến:
  - Trang không thực sự điều hướng (mở từ file:// hoặc từ tab đã sẵn sàng, không reload).
  - Service worker / SW cache giữ trang ở trạng thái prerender hoặc đáp ứng từ cache trước khi Navigation Start.
  - DevTools Lighthouse chạy trong tab có extension chặn/ghi trace (AdBlock, privacy extensions, devtools experiments).
  - Ứng dụng SPA không reload khi bắt đầu đo (đi thẳng vào trạng thái đã hydration).

### Cách chạy lại Lighthouse cho đúng
- Mở cửa sổ Chrome clean (Incognito, tắt hết extensions).
- Đảm bảo trang được truy cập qua HTTP(S) từ server local đang chạy, không phải file://.
- Trong DevTools > Lighthouse:
  - Chọn Mode: Navigation.
  - Check “Clear storage” (mặc định bật).
  - Nhấn “Analyze page load” và để trang tự reload. Không tương tác thủ công trước khi đo.
- Nếu vẫn lỗi:
  - Tắt service worker: DevTools > Application > Service Workers > check “Bypass for network”.
  - Tắt cache: DevTools > Network > Disable cache.
  - Đóng các tab DevTools khác.

### Hướng tối ưu hiệu năng (khi đo lại được số)
- **Render-blocking**: chuyển CSS/JS không thiết yếu xuống cuối hoặc dùng `defer`; tách bundle lớn (code-splitting).
- **Cache**: thiết lập cache headers dài hạn cho static assets; dùng hash file names.
- **Images**: dùng định dạng tối ưu (WebP/AVIF), đặt kích thước cố định để tránh CLS, bật lazy-load (`loading="lazy"`).
- **Fonts**: dùng `font-display: swap`; host font cục bộ hoặc preload font chính.
- **JS/CSS thừa**: loại bỏ thư viện không dùng; tree-shaking; minify/terser; purge CSS (Tailwind purge).
- **Main thread**: tránh long tasks; debounce/throttle sự kiện; chuyển tính toán nặng sang web worker nếu có.
- **LCP**: đảm bảo ảnh/hero LCP được preload (`<link rel="preload" as="image">`) và có kích thước tường minh.
- **TBT/INP**: giảm event handlers nặng; defer JS; chia nhỏ công việc lớn bằng `requestIdleCallback` hoặc `setTimeout(0)`.
- **Network**: ưu tiên HTTP/2+; giảm số request; gộp icon thành sprite hoặc dùng inline SVG cho icon nhỏ.

### Kiểm tra lại sau khi có số liệu
- Chạy Lighthouse (Navigation) trên desktop và mobile.
- Dùng Performance panel ghi trace 5–10s, xem long tasks và LCP element.
- Dùng Coverage (Ctrl+Shift+P → Coverage) để xem CSS/JS không dùng.

### Ghi chú
- Hiện chưa chỉnh sửa code; đây là checklist và cách xử lý lỗi Lighthouse để lấy được số đo. Sau khi có số, ưu tiên tối ưu theo chỉ số bottleneck thực tế (LCP, TBT/INP, CLS).

