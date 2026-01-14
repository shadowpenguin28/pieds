from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User, PatientProfile, DoctorProfile, ProviderProfile

JOURNEY_STATUS_CHOICES = (
    ("ACTIVE", "Active"),
    ("COMPLETED", "Completed"),
    ("TRANSFERRED", "Transferred"),
)

class Journey(models.Model):

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name="journeys")
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=JOURNEY_STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Track which organization created/owns this journey
    created_by_org = models.ForeignKey(
        ProviderProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_journeys",
        help_text="Organization that initiated this journey"
    )

    def __str__(self):
        return f"{self.title} ({self.patient})"


STEP_TYPES_CHOICES = (
    ("CONSULTATION", "Consultation"),
    ("TEST", "Lab Test"),
    ("PHARMACY", "Pharmacy"),
)

class JourneyStep(models.Model):

    journey = models.ForeignKey(Journey, on_delete=models.CASCADE, related_name="steps")
    parent_step = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="sub_steps")
    order = models.IntegerField(default=0)
    type = models.CharField(max_length=20, choices=STEP_TYPES_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Track which org and doctor created this step
    created_by_org = models.ForeignKey(
        ProviderProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_steps"
    )
    created_by_doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_steps"
    )
    
    # For TEST steps: the lab assigned to conduct the test
    assigned_lab = models.ForeignKey(
        ProviderProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tests"
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.type} - {self.journey.title}"


class Prescription(models.Model):
    step = models.OneToOneField(JourneyStep, on_delete=models.CASCADE, related_name="prescription")
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    medications = models.JSONField(help_text="List of medications with dosage")
    digital_signature = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"Rx for {self.step}"


class MedicalReport(models.Model):
    step = models.OneToOneField(JourneyStep, on_delete=models.CASCADE, related_name="report")
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE)
    file = models.FileField(upload_to="reports/", null=True, blank=True)
    data = models.JSONField(help_text="Parsed content of the report", null=True, blank=True)

    def __str__(self):
        return f"Report for {self.step}"


# Consent Management for Cross-Org Data Access
CONSENT_STATUS = (
    ("PENDING", "Pending"),
    ("GRANTED", "Granted"),
    ("DENIED", "Denied"),
    ("REVOKED", "Revoked"),
)

class HealthDataConsent(models.Model):
    """
    Tracks patient consent for data access across organizations.
    When D2 at O2 wants to see Patient P's data created at O1,
    this model tracks whether P has granted that access.
    """
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name="consents")
    
    # Who is requesting access?
    requesting_org = models.ForeignKey(
        ProviderProfile, 
        on_delete=models.CASCADE, 
        related_name="data_access_requests"
    )
    requesting_doctor = models.ForeignKey(
        DoctorProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="data_access_requests"
    )
    
    # Consent status
    status = models.CharField(max_length=20, choices=CONSENT_STATUS, default="PENDING")
    purpose = models.TextField(help_text="Why is access being requested?", blank=True)
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        # Each org can only have one active consent request per patient
        unique_together = ['patient', 'requesting_org']
    
    def __str__(self):
        return f"Consent: {self.requesting_org} -> {self.patient} ({self.status})"
