from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import PatientProfile, DoctorProfile
from journeys.models import JourneyStep

APPOINTMENT_STATUS_CHOICES = (
    ("SCHEDULED", "Scheduled"),
    ("IN_PROGRESS", "In Progress"),
    ("COMPLETED", "Completed"),
    ("CANCELLED", "Cancelled"),
)

class Appointment(models.Model):

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name="appointments")
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS_CHOICES, default="SCHEDULED")
    journey_step = models.OneToOneField(JourneyStep, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointment_link")
    estimated_duration = models.DurationField(default="00:15:00")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_time']

    def __str__(self):
        return f"{self.patient} with {self.doctor} at {self.scheduled_time}"
