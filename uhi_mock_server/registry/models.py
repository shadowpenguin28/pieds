from django.db import models

class MockAbhaRegistry(models.Model):
    """
    Simulates the National Health Authority's database.
    Stores valid ABHA IDs and their demographic data.
    """
    abha_address = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=10)
    dob = models.DateField()
    mobile = models.CharField(max_length=10)
    aadhaar_number = models.CharField(max_length=12, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.abha_address})"

class MockHealthProfessionalRegistry(models.Model):
    """
    Simulates HPR (Healthcare Professional Registry).
    Stores verified doctors/health care practitioners.
    """
    hpr_id = models.CharField(max_length=50, unique=True, help_text="e.g. 1234-5678-9012")
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    specialization = models.CharField(max_length=100)
    aadhaar = models.CharField(max_length=12, unique=True)
    mobile = models.CharField(max_length=10)
    
    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.specialization})"

FACILITY_TYPES = (
    ("HOSPITAL", "Hospital"),
    ("LAB", "Lab"),
    ("PHARMACY", "Pharmacy"),
)

class MockHealthFacilityRegistry(models.Model):
    """
    Simulates HFR (Health Facility Registry).
    Stores verified Hospitals, Labs, Pharmacies.
    """
    hfr_id = models.CharField(max_length=50, unique=True, help_text="e.g. IN-MH-123456")
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=FACILITY_TYPES)
    address = models.TextField()
    
    def __str__(self):
        return f"{self.name} ({self.type})"
