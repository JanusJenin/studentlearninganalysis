# 📊 Student Learning Pattern Consistency Tool (SLPCT)

A full-stack web application that tracks student learning behavior, visualizes analytical trends, and generates premium PDF reports. The platform provides three dedicated dashboards for **Students**, **Teachers**, and **Administrators**.

---

## ✨ Features

- **Floating Layout UI** — Glassmorphism-style dashboard floating over a dynamic background image
- **Dark / Light Mode** — Seamless theme toggle with CSS variables
- **Role-Based Dashboards** — Unique widgets and data views per role (Student / Teacher / Admin)
- **Interactive Charts (Chart.js)** — Line graphs, bar charts, and donut charts for performance analytics
- **PDF Report Generation** — On-the-fly stylized PDF exports via jsPDF + AutoTable
- **Assignment Upload & Validation** — Students can upload PDFs; backend validates content using `pdf-parse`
- **Database Integrations Panel** — Admin panel shows live connectivity status for PostgreSQL, MongoDB, Redis
- **Right-side Calendar Timeline** — Daily schedule with color-coded event markers

---

## 🗂️ Project Structure

```
studentlearninganalysis/
├── Frontend/
│   ├── index.html      # Main SPA layout
│   ├── app.js          # All client-side logic and routing
│   ├── styles.css      # Global design system
│   └── bg.png          # Background image
└── Backend/
    ├── server.js       # Express server entry point
    ├── package.json
    └── src/
        ├── routes/
        │   └── api.js  # All API endpoints
        └── data/
            └── mockDb.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JanusJenin/studentlearninganalysis.git
   cd studentlearninganalysis
   ```

2. **Install backend dependencies**
   ```bash
   cd Backend
   npm install
   ```

### Running the Application

```bash
npm start
```

The app will be available at **http://localhost:5000**

---

## 🔑 Default Login Accounts

| Role    | Username   | Password      |
|---------|------------|---------------|
| Student | `student1` | `password123` |
| Teacher | `teacher1` | `password123` |
| Admin   | `admin`    | `password123` |

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | HTML5, CSS3, Vanilla JS |
| Charts    | Chart.js |
| PDF       | jsPDF + AutoTable |
| Backend   | Node.js + Express |
| File Upload | Multer |
| PDF Parse | pdf-parse |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
