# UHI Platform API Documentation

**Base URL:** `http://localhost:8000/api`

---

## Authentication

All authenticated endpoints require a JWT token in the header:
```
Authorization: Bearer <access_token>
```

---

## Auth APIs (`/api/auth/`)

### Register Patient
```
POST /api/auth/register/patient/
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | Patient's email address (unique) |
| password | string | ✅ | Account password |
| phone_number | string | ✅ | 10-digit phone number |
| aadhaar | string | ✅ | 12-digit Aadhaar number |

**Example:**
```bash
curl -X POST http://localhost:8000/api/auth/register/patient/ \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@example.com", "password": "securepass", "phone_number": "9876543210", "aadhaar": "123412341234"}'
```

**Response:**
```json
{"id": 1, "email": "patient@example.com", "phone_number": "9876543210"}
```

---

### Register Doctor
```
POST /api/auth/register/doctor/
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | Doctor's email address |
| password | string | ✅ | Account password |
| phone_number | string | ✅ | 10-digit phone number |
| aadhaar | string | ✅ | 12-digit Aadhaar number |
| specialization | string | ✅ | Medical specialty (e.g., "Cardiology") |
| organization_hfr_id | string | ❌ | HFR ID of the hospital to affiliate with |

**Example:**
```bash
curl -X POST http://localhost:8000/api/auth/register/doctor/ \
  -H "Content-Type: application/json" \
  -d '{"email": "dr@hospital.com", "password": "pass123", "phone_number": "9100000001", "aadhaar": "111111111111", "specialization": "Cardiology", "organization_hfr_id": "IN-7CA29198"}'
```

---

### Register Provider (Hospital/Lab/Pharmacy)
```
POST /api/auth/register/provider/
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | Provider email |
| password | string | ✅ | Account password |
| phone_number | string | ✅ | Contact phone |
| type | string | ✅ | `HOSPITAL`, `LAB`, or `PHARMACY` |
| name | string | ✅ | Organization name |
| address | string | ✅ | Full address |

**Example:**
```bash
curl -X POST http://localhost:8000/api/auth/register/provider/ \
  -H "Content-Type: application/json" \
  -d '{"email": "hospital@example.com", "password": "pass123", "phone_number": "9000000001", "type": "HOSPITAL", "name": "Apollo Hospital", "address": "Mumbai"}'
```

---

### Login
```
POST /api/auth/login/
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |
| password | string | ✅ |

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Refresh Token
```
POST /api/auth/token/refresh/
```

**Request Body:**
```json
{"refresh": "<refresh_token>"}
```

---

## QR Code APIs (`/api/auth/patients/`)

### Get QR Code Image (PNG)
```
GET /api/auth/patients/me/qr-code/
```
🔐 **Auth Required:** Patient only

Returns PNG image of QR code for hospital form filling.

---

### Get QR Data (JSON)
```
GET /api/auth/patients/me/qr-data/
```
🔐 **Auth Required:** Patient only

**Response:**
```json
{
  "qr_data": {
    "v": "1.0",
    "a": "Om_Bhalla.2367@uhi",
    "p": 1,
    "s": "5be9c09af068f1ca"
  }
}
```

---

### Scan QR (Get Patient Data)
```
POST /api/auth/patients/qr-scan/
```
🔐 **Auth Required:** Doctor/Provider only

**Request Body:**
```json
{
  "qr_data": {"v":"1.0","a":"Om_Bhalla.2367@uhi","p":1,"s":"5be9c09af068f1ca"}
}
```

**Response:**
```json
{
  "patient_id": 1,
  "abha_id": "Om_Bhalla.2367@uhi",
  "name": "Om Bhalla",
  "email": "patient@example.com",
  "phone_number": "9876543210",
  "date_of_birth": "1990-01-15",
  "gender": "M",
  "blood_group": "O+",
  "address": "123 Main St",
  "emergency_contact": {"name": "Wife Name", "phone": "9876543211"},
  "allergies": "Penicillin",
  "current_medications": "None"
}
```

---

## Journey APIs (`/api/journeys/`)

### List/Create Journeys
```
GET /api/journeys/
POST /api/journeys/
```
🔐 **Auth Required**

**POST Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | Journey title (e.g., "Cardiac Checkup") |
| patient | integer | ✅ | Patient profile ID |

---

### Get Journey Detail
```
GET /api/journeys/{id}/
```

---

### Create Journey Step
```
POST /api/journeys/steps/
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| journey | integer | ✅ | Journey ID |
| type | string | ✅ | `CONSULTATION`, `TEST`, `PHARMACY`, `FOLLOWUP` |
| notes | string | ❌ | Clinical notes |
| order | integer | ❌ | Step order |

---

### Request Access (By ABHA ID)
```
POST /api/journeys/request-access/
```
🔐 **Auth Required:** Doctor only

**Request Body:**
```json
{
  "patient_abha_id": "Om_Bhalla.2367@uhi",
  "purpose": "Follow-up consultation"
}
```

---

### List Patient Consents
```
GET /api/journeys/my-consents/
```
🔐 **Auth Required:** Patient only

---

### Respond to Consent Request
```
POST /api/journeys/consent/{id}/respond/
```
🔐 **Auth Required:** Patient only

**Request Body:**
```json
{"status": "GRANTED"}  // or "DENIED"
```

---

### Fetch Journeys by ABHA ID
```
GET /api/journeys/by-abha/{abha_id}/
```
🔐 **Auth Required:** Requires consent if from different org

---

## Appointment APIs (`/api/appointments/`)

### List/Create Appointments
```
GET /api/appointments/
POST /api/appointments/
```
🔐 **Auth Required**

**POST Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patient | integer | ✅ | Patient profile ID |
| doctor | integer | ✅ | Doctor profile ID |
| scheduled_time | datetime | ✅ | ISO 8601 format (e.g., `2026-01-02T10:00:00Z`) |
| estimated_duration | duration | ❌ | Default: 15 minutes (format: `HH:MM:SS`) |
| journey_step | integer | ❌ | Link to journey step |

**Example:**
```bash
curl -X POST http://localhost:8000/api/appointments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient": 1, "doctor": 2, "scheduled_time": "2026-01-02T10:00:00Z"}'
```

---

### Get/Update Appointment
```
GET /api/appointments/{id}/
PATCH /api/appointments/{id}/
```

---

### Start Appointment
```
POST /api/appointments/{id}/start/
```
🔐 **Auth Required:** Doctor only

Sets `actual_start_time` and changes status to `IN_PROGRESS`.

**Response:**
```json
{
  "message": "Appointment started",
  "appointment": {
    "id": 1,
    "status": "IN_PROGRESS",
    "actual_start_time": "2026-01-01T10:05:00Z"
  }
}
```

---

### Complete Appointment
```
POST /api/appointments/{id}/complete/
```
🔐 **Auth Required:** Doctor only

Sets `actual_end_time` and changes status to `COMPLETED`.

---

### Cancel Appointment
```
POST /api/appointments/{id}/cancel/
```
🔐 **Auth Required:** Patient or Doctor

---

### Get Doctor's Queue
```
GET /api/appointments/queue/doctor/{doctor_id}/
```

**Response:**
```json
{
  "doctor_id": 2,
  "date": "2026-01-01",
  "queue_count": 5,
  "appointments": [...]
}
```

---

### Get Wait Time Prediction
```
GET /api/appointments/{id}/wait-time/
```
🔐 **Auth Required:** Patient or Doctor

**Response (SCHEDULED):**
```json
{
  "queue_position": 3,
  "people_ahead": 2,
  "avg_consultation_minutes": 22.5,
  "estimated_wait_minutes": 45.0,
  "predicted_start_time": "2026-01-01T11:45:00Z",
  "delay_minutes": 15.0,
  "current_status": "waiting"
}
```

**Response (IN_PROGRESS):**
```json
{
  "queue_position": 0,
  "people_ahead": 0,
  "current_status": "in_progress",
  "message": "Your consultation is in progress"
}
```

---

## Wallet APIs (`/api/wallet/`)

### Get Wallet Balance
```
GET /api/wallet/
```
🔐 **Auth Required**

Returns current wallet balance and recent transactions.

**Response:**
```json
{
  "id": 1,
  "balance": "500.00",
  "created_at": "2026-01-02T06:03:52Z",
  "updated_at": "2026-01-02T06:03:53Z",
  "recent_transactions": [
    {"id": 1, "amount": "500.00", "type": "CREDIT", "reason": "TOP_UP", ...}
  ]
}
```

---

### Top Up Wallet
```
POST /api/wallet/topup/
```
🔐 **Auth Required**

Adds funds to wallet (mock payment for MVP demo).

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | decimal | ✅ | Amount to add (min: 1) |

**Example:**
```bash
curl -X POST http://localhost:8000/api/wallet/topup/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

**Response:**
```json
{
  "message": "₹500.00 added to wallet",
  "new_balance": 500.0,
  "transaction": {"id": 1, "amount": "500.00", "type": "CREDIT", "reason": "TOP_UP", ...}
}
```

---

### Get Transaction History
```
GET /api/wallet/transactions/
```
🔐 **Auth Required**

Returns all transactions for the authenticated user's wallet.

**Response:**
```json
[
  {"id": 1, "amount": "500.00", "type": "CREDIT", "reason": "TOP_UP", "appointment": null, "description": "Wallet top-up", "created_at": "..."},
  {"id": 2, "amount": "200.00", "type": "DEBIT", "reason": "PAYMENT_DONE", "appointment": 2, "description": "Payment for appointment with Dr. X", "created_at": "..."}
]
```

**Transaction Reasons:**
| Reason | Description |
|--------|-------------|
| `TOP_UP` | Money added to wallet |
| `PAYMENT_DONE` | Payment made by user |
| `PAYMENT_RECEIVED` | Payment received by user |
| `REFUND` | Refund processed |
| `WITHDRAWAL` | Withdrawal from wallet |

---

### Pay for Appointment
```
POST /api/wallet/appointments/{id}/pay/
```
🔐 **Auth Required:** Patient only

Pays for an appointment using wallet balance. Transfers funds from patient to doctor.

**Response (Success):**
```json
{
  "message": "Payment successful",
  "amount": "200.00",
  "patient_new_balance": "300.00"
}
```

**Response (Insufficient Balance):**
```json
{
  "error": "Insufficient balance",
  "required": "200.00",
  "available": "100.00"
}
```

---

### Refund Appointment
```
POST /api/wallet/appointments/{id}/refund/
```
🔐 **Auth Required**

Refunds a cancelled appointment. Returns funds from doctor to patient.

**Response:**
```json
{
  "message": "Refund processed",
  "amount": "200.00",
  "patient_new_balance": "500.00"
}
```

---

## Lab Report APIs (`/api/journeys/steps/`)

### Upload Report
```
POST /api/journeys/steps/{step_id}/report/
```
🔐 **Auth Required:** Provider (LAB/HOSPITAL) only

Uploads a medical report file for a TEST type journey step.

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | ✅ | Report file (PDF, image, etc.) |
| data | JSON | ❌ | Parsed report data |

**Example:**
```bash
curl -X POST http://localhost:8000/api/journeys/steps/2/report/ \
  -H "Authorization: Bearer $LAB_TOKEN" \
  -F "file=@/path/to/report.pdf"
```

**Response:**
```json
{
  "message": "Report uploaded successfully",
  "report_id": 1,
  "file_url": "http://localhost:8000/media/reports/report.pdf"
}
```

---

### Download Report
```
GET /api/journeys/steps/{step_id}/report/download/
```
🔐 **Auth Required:** Patient (own report), Doctor (with consent), Provider (own uploads)

Returns report metadata and download URL.

**Response:**
```json
{
  "report_id": 1,
  "step_id": 2,
  "provider": "TestLab Diagnostics",
  "file_url": "http://localhost:8000/media/reports/report.pdf",
  "data": null
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{"error": "Error description"}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Not allowed for this user type |
| 404 | Not Found |
| 500 | Server Error |
