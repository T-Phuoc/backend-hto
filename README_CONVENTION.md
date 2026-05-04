# QUY TẮC DỰ ÁN

## 1. Quy tắc Đặt tên nhánh

**`[loại-nhánh]/[mã-task]-[mô-tả-ngắn-gọn]`**

* 100% chữ thường, không dấu.
* Dùng dấu gạch ngang (`-`) thay cho dấu cách.

---

**Các loại nhánh & Ví dụ thực tế:**

* **`feature/`** (Làm tính năng mới)
  * *Ví dụ:* `feature/sprint2-add-login-api`
* **`bugfix/`** (Sửa lỗi trong lúc phát triển)
  * *Ví dụ:* `bugfix/task404-fix-cors-error`
* **`hotfix/`** (Sửa lỗi khẩn cấp, hệ thống đang lỗi)
  * *Ví dụ:* `hotfix/fix-database-crash`
* **`refactor/`** (Viết lại/tối ưu code cho sạch hơn, không thêm tính năng)
  * *Ví dụ:* `refactor/clean-up-auth-controller` (Cấu trúc lại file AuthController)
* **`chore/`** (Cập nhật linh tinh, cài thư viện, cấu hình)
  * *Ví dụ:* `chore/update-nestjs-packages` (Cập nhật phiên bản thư viện)

## 2. 6 KHÔNG cần lưu ý 

🚫 **Không push thẳng lên `main`:** Luôn tách nhánh mới (`feature/...`, `bugfix/...`) và gộp code thông qua Pull Request (PR).

🚫 **Không commit vô nghĩa:** Tránh ghi "fix", "update". Hãy ghi rõ nội dung (VD:  *"fix: lỗi giao diện đăng nhập"* ).

🚫 **Không push `.env` hay `node_modules`:** Luôn khai báo các file nhạy cảm chứa mật khẩu hoặc thư viện nặng vào `.gitignore`.

🚫 **Không gom quá nhiều việc vào 1 commit:** Đừng để cả chục file rồi commit một lần. Xong chức năng nào, commit gọn chức năng đó.

🚫 **Không quên `git pull`:** Luôn cập nhật code mới nhất về máy trước khi bắt đầu code để tránh đụng độ (Conflict).

🚫 **Không push code đang lỗi (chết app):** Chỉ đưa lên khi code đã chạy được. Nếu đang làm dở mà cần đổi việc, hãy cất tạm bằng lệnh `git stash`.
