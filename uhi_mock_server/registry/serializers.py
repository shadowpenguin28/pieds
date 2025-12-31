from rest_framework import serializers
from .models import MockAbhaRegistry, MockHealthProfessionalRegistry, MockHealthFacilityRegistry, FACILITY_TYPES

class CreateAbhaSerializer(serializers.Serializer):
    """
    Input serializer for creating a new ABHA ID.
    """
    mobile = serializers.CharField(max_length=10)
    aadhaar = serializers.CharField(max_length=12)  # Required for verification

class CreateHPRSerializer(serializers.Serializer):
    """
    Input serializer for creating a new HPR ID (Doctor).
    """
    aadhar = serializers.CharField(max_length=12)
    mobile = serializers.CharField(max_length=10)
    specialization = serializers.CharField(max_length=100)

class CreateHFRSerializer(serializers.Serializer):
    """
    Input serializer for creating a new HFR ID (Facility).
    """
    name = serializers.CharField(max_length=255)
    type = serializers.ChoiceField(choices=FACILITY_TYPES)
    address = serializers.CharField()

class MockAbhaResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockAbhaRegistry
        fields = ["abha_address", "first_name", "last_name", "gender", "dob", "mobile"]

class MockHPRResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockHealthProfessionalRegistry
        fields = ["hpr_id", "first_name", "last_name", "specialization", "mobile"]

class MockHFRResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockHealthFacilityRegistry
        fields = ["hfr_id", "name", "type", "address"]
