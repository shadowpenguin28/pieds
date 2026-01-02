# UHI Platform - Unified Health Interface

A comprehensive healthcare platform implementing the Unified Health Interface (UHI) protocol for seamless patient-doctor-provider interactions.

## 🎯 Features

### Patient Portal
- Digital QR Code for instant identification
- Book & manage appointments with doctors
- Integrated wallet system for payments
- Health journey tracking with lab reports
- Consent-based data sharing
- Real-time queue position & wait time

### Doctor Portal
- Today's queue management
- Scan patient QR codes (camera/file upload)
- Appointments & consultation management
- Access patient health records (with consent)
- Wallet & earnings tracking
- Profile management with consultation fees

### Provider Portal (Hospital/Lab/Pharmacy)
- Manage affiliated doctors
- Upload lab reports & medical documents
- Scan patient QR for record access
- Revenue tracking
- Organization doctor management

---

## 🛠️ Tech Stack

**Backend:**
- Django 5.1.4
- Django REST Framework 3.15.2
- JWT Authentication (simplejwt)
- Python 3.11+

**Frontend:**
- React 19.0.0
- Vite 6.0.5
- TailwindCSS 4.0.0
- React Router v7
- Axios for API calls
- html5-qrcode for QR scanning

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** & npm - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shadowpenguin28/pieds.git
cd pieds
```

### 2. Backend Setup

#### 2.1 Create Python Virtual Environment

macos
```bash
python3 -m venv venv
source venv/bin/activate
```
windows
```
python -m venv venv
source venv\Scripts\activate
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Run Migrations

```bash
cd core
python manage.py makemigrations
python manage.py migrate
```

### 3. UHI Mock Server Setup

```bash
cd .. # Switch back to the root directory: pieds
cd uhi_mock_server
python manage.py makemigrations
python manage.py migrate
```

### 4. Frontend Setup

```bash
cd .. # Switch back to the root directory: pieds
cd client
npm install
```

---

## ▶️ Running the Project

You need to run **3 separate servers** in different terminal windows:

Before starting the dev servers, ensure python virtual environment is activated via: 

macos
```bash
python3 -m venv venv
source venv/bin/activate
```
windows
```
python -m venv venv
source venv\Scripts\activate
```

### Terminal 1: Main Backend Server

```bash
cd core
python manage.py runserver
```

Core backend Server runs on: **http://localhost:8000**

### Terminal 2: UHI Mock Server

```bash
cd uhi_mock_server
python manage.py runserver 8001
```

UHI Mock Server runs on: **http://localhost:8001**

### Terminal 3: Frontend Development Server

```bash
cd client
npm run dev
```

Frontend Application runs on: **http://localhost:5174**

---

## 📁 Project Structure

```
pieds/
├── core/                      # Main Django backend
│   ├── users/                 # User auth & profiles
│   ├── appointments/          # Appointment management
│   ├── journeys/             # Health journeys & consents
│   ├── payments/             # Wallet & transactions
│   └── settings.py
├── uhi_mock_server/          # UHI protocol mock server
├── client/                   # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── patient/     # Patient portal pages
│   │   │   ├── doctor/      # Doctor portal pages
│   │   │   ├── provider/    # Provider portal pages
│   │   │   └── shared/      # Shared components
│   │   ├── api/             # API client
│   │   ├── contexts/        # React contexts
│   │   └── App.jsx
│   └── package.json
├── docs/                     # Documentation
│   ├── API_DOCUMENTATION.md
│   └── architecture_diagrams.md
└── README.md
```
---
