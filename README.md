# UHI Platform - Unified Health Interface

A comprehensive healthcare platform implementing the Unified Health Interface (UHI) protocol for seamless patient-doctor-provider interactions.

## 🎯 Features

### Patient Portal
- 📱 Digital QR Code for instant identification
- 📅 Book & manage appointments with doctors
- 💰 Integrated wallet system for payments
- 🏥 Health journey tracking with lab reports
- 🔐 Consent-based data sharing
- ⏱️ Real-time queue position & wait time

### Doctor Portal
- 📋 Today's queue management
- 📸 Scan patient QR codes (camera/file upload)
- 💼 Appointments & consultation management
- 📊 Access patient health records (with consent)
- 💳 Wallet & earnings tracking
- ⚙️ Profile management with consultation fees

### Provider Portal (Hospital/Lab/Pharmacy)
- 🏥 Manage affiliated doctors
- 📄 Upload lab reports & medical documents
- 🔍 Scan patient QR for record access
- 💰 Revenue tracking
- 👥 Organization doctor management

---

## 🛠️ Tech Stack

**Backend:**
- Django 5.1.4
- Django REST Framework 3.15.2
- PostgreSQL
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
git clone <repository-url>
cd pieds
```

### 2. Backend Setup

#### 2.1 Create Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure PostgreSQL Database

Create a PostgreSQL database:

```bash
psql postgres
CREATE DATABASE uhi_db;
CREATE USER uhi_user WITH PASSWORD 'your_password';
ALTER ROLE uhi_user SET client_encoding TO 'utf8';
ALTER ROLE uhi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE uhi_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE uhi_db TO uhi_user;
\q
```

#### 2.4 Environment Variables

Create `.env` file in the `core/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_NAME=uhi_db
DATABASE_USER=uhi_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

#### 2.5 Run Migrations

```bash
cd core
python manage.py makemigrations
python manage.py migrate
```

#### 2.6 Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

#### 2.7 Load Test Data (Optional)

```bash
python manage.py loaddata fixtures/test_data.json  # If available
```

### 3. UHI Mock Server Setup

```bash
cd uhi_mock_server
python manage.py migrate
```

### 4. Frontend Setup

```bash
cd client
npm install
```

---

## ▶️ Running the Project

You need to run **3 separate servers** in different terminal windows:

### Terminal 1: Main Backend Server

```bash
cd core
source ../venv/bin/activate  # Activate virtual environment
python manage.py runserver
```

Server runs on: **http://localhost:8000**

### Terminal 2: UHI Mock Server

```bash
cd uhi_mock_server
source ../venv/bin/activate
python manage.py runserver 8001
```

Server runs on: **http://localhost:8001**

### Terminal 3: Frontend Development Server

```bash
cd client
npm run dev
```

Application runs on: **http://localhost:5174**

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
