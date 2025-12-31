from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager

USER_TYPES = (
    ('PATIENT', 'Patient'),
    ('DOCTOR', 'Doctor'),
    ('PROVIDER', 'Provider'),
)

class User(AbstractUser):

    username = None
    email = models.EmailField(_("email address"), unique=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    type = models.CharField(
        max_length=50, choices=USER_TYPES, default='PATIENT'
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
    @property
    def is_patient(self):
        """Convenience property to check if user is a patient"""
        return self.type == "PATIENT"
    
    @property 
    def is_doctor(self):
        """Convenience property to check if user is a patient"""
        return self.type == "DOCTOR"

    @property
    def is_provider(self):
        """Convenience property to check if user is a provider"""
        return self.type == "PROVIDER"


class PatientProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="patient_profile"
    )
    abha_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    qr_data_payload = models.TextField(null=True, blank=True, max_length=2056)

    def __str__(self):
        return f"Patient: {self.user.email}"


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="doctor_profile"
    )
    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Dr. {self.user.email} - {self.specialization}"


PROVIDER_TYPES = (
    ("PHARMACY", "Pharmacy"),
    ("LAB", "Lab"),
    ("HOSPITAL", "Hospital"),
)

class ProviderProfile(models.Model):

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="provider_profile"
    )
    type = models.CharField(max_length=50, choices=PROVIDER_TYPES)
    name = models.CharField(max_length=255)
    address = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.type})"
