from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    PatientRegisterView, DoctorRegisterView, ProviderRegistrationView,
    PatientQRCodeView, GetQRDataView, QRScanView
)

urlpatterns = [
    path("register/patient/", PatientRegisterView.as_view(), name="register_patient"),
    path("register/doctor/", DoctorRegisterView.as_view(), name="register_doctor"),
    path("register/provider/", ProviderRegistrationView.as_view(), name="register_provider"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # QR Code endpoints
    path("patients/me/qr-code/", PatientQRCodeView.as_view(), name="patient_qr_code"),
    path("patients/me/qr-data/", GetQRDataView.as_view(), name="patient_qr_data"),
    path("patients/qr-scan/", QRScanView.as_view(), name="qr_scan"),
]
