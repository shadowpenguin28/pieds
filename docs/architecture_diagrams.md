# UHI Platform - Architecture Diagrams

## 1. User Registration APIs

```mermaid
flowchart TB
    subgraph Registration["User Registration Endpoints"]
        direction TB
        
        subgraph Patient["POST /api/auth/register/patient/"]
            P1[Request] --> P2[Create ABHA via Mock]
            P2 --> P3[Create User + PatientProfile]
            P3 --> P4["Returns: email, phone, ABHA ID"]
        end
        
        subgraph Doctor["POST /api/auth/register/doctor/"]
            D1[Request + org_hfr_id] --> D2[Create HPR via Mock]
            D2 --> D3[Create User + DoctorProfile]
            D3 --> D4[Link to Organization]
            D4 --> D5["Returns: email, phone, HPR ID"]
        end
        
        subgraph Provider["POST /api/auth/register/provider/"]
            PR1[Request] --> PR2[Create HFR via Mock]
            PR2 --> PR3[Create User + ProviderProfile]
            PR3 --> PR4["Returns: email, phone, HFR ID"]
        end
    end
    
    subgraph Auth["Authentication"]
        Login["POST /api/auth/login/"] --> JWT["Returns JWT tokens"]
        Refresh["POST /api/auth/token/refresh/"] --> NewJWT["Returns new access token"]
    end
```

---

## 2. Journey APIs Flow

```mermaid
flowchart TB
    subgraph JourneyAPIs["Journey Management"]
        direction TB
        
        List["GET /api/journeys/"]
        Create["POST /api/journeys/"]
        Detail["GET /api/journeys/{id}/"]
        AddStep["POST /api/journeys/steps/"]
    end
    
    subgraph CrossOrg["Cross-Org Access"]
        direction TB
        
        Request["POST /api/journeys/request-access/"]
        MyConsents["GET /api/journeys/my-consents/"]
        Respond["POST /api/journeys/consent/{id}/respond/"]
        ByAbha["GET /api/journeys/by-abha/{abha_id}/"]
    end
    
    subgraph AccessFlow["Access Control Decision"]
        Check{Who is requesting?}
        Check -->|Patient| IsOwner{Is it their journey?}
        Check -->|Doctor| HasAccess{From creating org<br/>OR has consent?}
        
        IsOwner -->|Yes| Allow[✅ Return Data]
        IsOwner -->|No| Deny1[❌ Not your journey]
        
        HasAccess -->|Yes| Allow
        HasAccess -->|No| Deny2[❌ Consent required]
    end
```

---

## 3. Data Storage Model

```mermaid
erDiagram
    User ||--o| PatientProfile : has
    User ||--o| DoctorProfile : has
    User ||--o| ProviderProfile : has
    
    DoctorProfile }o--|| ProviderProfile : "works at"
    
    PatientProfile ||--o{ Journey : has
    Journey ||--o{ JourneyStep : contains
    
    ProviderProfile ||--o{ Journey : "created_by_org"
    ProviderProfile ||--o{ JourneyStep : "created_by_org"
    DoctorProfile ||--o{ JourneyStep : "created_by_doctor"
    
    JourneyStep ||--o| Prescription : has
    JourneyStep ||--o| MedicalReport : has
    
    PatientProfile ||--o{ HealthDataConsent : grants
    ProviderProfile ||--o{ HealthDataConsent : requests
    
    User {
        int id PK
        string email
        string phone_number
        string type "PATIENT/DOCTOR/PROVIDER"
    }
    
    PatientProfile {
        int id PK
        string abha_id UK
        date dob
        string gender
    }
    
    DoctorProfile {
        int id PK
        string hpr_id UK
        string specialization
        int organization FK
    }
    
    ProviderProfile {
        int id PK
        string hfr_id UK
        string name
        string type "HOSPITAL/LAB/PHARMACY"
    }
    
    Journey {
        int id PK
        string title
        string status
        int patient FK
        int created_by_org FK
    }
    
    JourneyStep {
        int id PK
        string type "CONSULTATION/TEST/PHARMACY"
        text notes
        int journey FK
        int created_by_org FK
        int created_by_doctor FK
    }
    
    HealthDataConsent {
        int id PK
        int patient FK
        int requesting_org FK
        string status "PENDING/GRANTED/DENIED"
        text purpose
    }
```

---

## 4. Cross-Org Data Access Flow

```mermaid
sequenceDiagram
    participant D1 as Doctor @ Org 1
    participant API as UHI API
    participant DB as Database
    participant D2 as Doctor @ Org 2
    participant P as Patient

    rect rgb(200, 230, 200)
        Note over D1,DB: Step 1: Data Creation at Org 1
        D1->>API: Create Journey
        API->>DB: Store with created_by_org = O1
        D1->>API: Add Consultation Step
        API->>DB: Store with created_by_org = O1
    end

    rect rgb(255, 220, 220)
        Note over D2,API: Step 2: Access Denied (No Consent)
        D2->>API: GET /by-abha/{id}
        API->>DB: Check consent for O2
        DB-->>API: No consent found
        API-->>D2: ❌ Consent required
    end

    rect rgb(220, 220, 255)
        Note over D2,P: Step 3: Consent Flow
        D2->>API: POST /request-access/
        API->>DB: Create consent (PENDING)
        API-->>P: Notification
        P->>API: POST /consent/{id}/respond/
        API->>DB: Update to GRANTED
    end

    rect rgb(200, 230, 200)
        Note over D2,DB: Step 4: Access Granted
        D2->>API: GET /by-abha/{id}
        API->>DB: Check consent for O2
        DB-->>API: Consent GRANTED
        API->>DB: Fetch all journeys
        API-->>D2: ✅ Full patient data
    end
```

---

## 5. Mock UHI Server Integration

```mermaid
flowchart LR
    subgraph Core["Core Backend :8000"]
        Users["User Registration"]
        Services["UHIClient Service"]
    end
    
    subgraph Mock["Mock UHI Server :8001"]
        ABHA["POST /v1/abha/create"]
        HPR["POST /v1/hpr/create"]
        HFR["POST /v1/hfr/create"]
    end
    
    Users --> Services
    Services -->|Patient Registration| ABHA
    Services -->|Doctor Registration| HPR
    Services -->|Provider Registration| HFR
    
    ABHA -->|"Returns: abha_address, name, gender, dob"| Services
    HPR -->|"Returns: hpr_id, name, specialization"| Services
    HFR -->|"Returns: hfr_id, name, type"| Services
```

---

## Exporting Diagrams

You can export these diagrams using:

1. **Mermaid Live Editor**: https://mermaid.live - Paste each mermaid block and export as PNG/SVG
2. **VS Code Extension**: Install "Markdown Preview Mermaid Support" extension
3. **CLI Tool**: `npm install -g @mermaid-js/mermaid-cli` then run `mmdc -i diagrams.md -o output.png`
