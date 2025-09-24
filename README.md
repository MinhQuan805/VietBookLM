## 📂 Cấu trúc thư mục

```
.
vietbooklm/
│── frontend/                          # Giao diện web viết bằng Next.js
│   ├── public/                        # File tĩnh (logo, favicon, fonts, hình ảnh...)
│   ├── src/
│   │   ├── app/                       # Các page chính
│   │   ├── components/                # Các khối UI tái sử dụng 
│   │   ├── config/                    # Thiết lập cấu hình cho frontend
│   │   ├── features/                  # Chức năng lớn
│   │   ├── hooks/                     # Custom hooks
│   │   ├── middleware/                # Middleware chạy phía client (auth guard...)
│   │   ├── services/                  # Nơi gọi API backend
│   │   ├── store/                     # State management (Redux để lưu session, cache chat...)
│   │   ├── utils/                     # Hàm helper dùng chung cho frontend
│   │   └── styles/                    # Tailwind config, global CSS
│   ├── package.json                   # Config package cho frontend
│   └── .env                           # Biến môi trường cho backend

│── backend/                           # Backend viết bằng FastAPI
│   
│   ├── ai/                        # Tích hợp AI (LangChain pipelines, LangSmith traces,...)
│   ├── routes/                    # Định nghĩa API endpoints
│   ├── core/                      # Thành phần cốt lõi
│   │   ├── config.py              # Thiết lập cấu hình cho backend
│   │   ├── security.py            # Xử lý auth (JWT, OAuth2, session)
│   │   └── middleware.py          # Middleware backend (logging, error handler, CORS...)
│   ├── services/                  # Business logic (chat service, document service,...)
│   ├── utils/                     # Hàm tiện ích dùng chung cho backend
│   ├── schemas.py          # Pydantic schemas
│   ├── vectorDB/                  # Tích hợp ChromaDB (lưu embeddings, truy vấn semantic search)
│   ├── main.py                    # Điểm vào chính của FastAPI (khởi tạo app, include router)
│   ├── tests/                     # Unit test & integration test
│   ├── requirements.txt           # Danh sách thư viện Python
│   └── .env                       # Biến môi trường cho backend

│── README.md                          # Tài liệu giới thiệu dự án

```