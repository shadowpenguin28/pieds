from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import PatientRegisterView, DoctorRegisterView, ProviderRegistrationView

urlpatterns = [
    path("register/patient/", PatientRegisterView.as_view(), name="register_patient"),
    path("register/doctor/", DoctorRegisterView.as_view(), name="register_doctor"),
    path("register/provider/", ProviderRegistrationView.as_view(), name="register_provider"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
