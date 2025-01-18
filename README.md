# gpt_girlfriend

## Mô tả dự án

Dự án này là một ứng dụng web tích hợp chức năng chat với ChatGPT thông qua API OpenAI. Giao diện người dùng (UI) được xây dựng bằng HTML và JavaScript, hiển thị một mô hình 3D nhân vật VRoid. Khi người dùng gửi tin nhắn, ứng dụng sẽ:

1. Gửi yêu cầu đến server Python để gọi API ChatGPT.
2. Nhận phản hồi từ API, bao gồm văn bản và file âm thanh.
3. Cập nhật UI để hiển thị phản hồi văn bản và phát âm thanh.
4. Nhân vật 3D sẽ cử động miệng đồng bộ với âm thanh nhận được.

## Cấu trúc dự án

```
project/
│
├── app.py                 # Server Python Flask xử lý logic
├── static/
│   ├── index.html         # Giao diện người dùng
│   ├── main.js            # Xử lý tương tác người dùng và VRoid model
│   ├── style.css          # Styling cho UI
│   ├── vroid_model.vrm    # Model VRoid nhân vật 3D
│   └── assets/            # Chứa các file âm thanh và tài nguyên khác
└── README.md              # Mô tả dự án
```

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Python 3.9+
- Flask
- OpenAI API
- Các thư viện Python khác: `flask`, `requests`, `gTTS`, `pydub`
- Trình duyệt hỗ trợ WebGL (Google Chrome, Firefox)

### Bước 1: Cài đặt các thư viện

Chạy lệnh sau để cài đặt các thư viện cần thiết:

```bash
pip install flask requests gtts pydub
```

### Bước 2: Thiết lập API Key

Tạo một file `.env` trong thư mục dự án với nội dung sau:

```env
OPENAI_API_KEY=your_openai_api_key
```

Thay `your_openai_api_key` bằng API key của bạn.

### Bước 3: Chạy server

Chạy server Flask bằng lệnh:

```bash
python app.py
```

### Bước 4: Truy cập ứng dụng

Mở trình duyệt và truy cập `http://localhost:5000`.

## Mô tả các file

### 1. `app.py`

Đây là file chính của server:

- Nhận tin nhắn từ client.
- Gửi yêu cầu đến API ChatGPT và nhận phản hồi.
- Tạo file âm thanh từ phản hồi và gửi lại client.

### 2. `index.html`

Giao diện người dùng với các thành phần:
- Hộp chat.
- Khung hiển thị nhân vật 3D.
- Khu vực hiển thị phản hồi.

### 3. `main.js`

Quản lý tương tác giữa người dùng và server:
- Gửi tin nhắn từ UI đến server.
- Cập nhật nhân vật 3D và đồng bộ cử động miệng với âm thanh.

### 4. `style.css`

Tùy chỉnh giao diện của ứng dụng.

### 5. `vroid_model.vrm`

File mô hình 3D VRoid.

## Hướng dẫn sử dụng

1. Nhập tin nhắn trong hộp chat và nhấn nút "Gửi".
2. Chờ server xử lý và nhận phản hồi từ ChatGPT.
3. Phản hồi văn bản sẽ hiển thị trong giao diện.
4. Âm thanh được phát, và mô hình 3D sẽ cử động miệng theo âm thanh.

## Lưu ý

- Mô hình VRoid có thể cần plugin `three-vrm` để hiển thị và điều khiển.
- Đồng bộ hóa cử động miệng được thực hiện thông qua phân tích âm thanh trong `main.js`.

## Liên hệ

Nếu bạn có thắc mắc hoặc gặp vấn đề, vui lòng liên hệ qua email: `your_email@example.com`.
