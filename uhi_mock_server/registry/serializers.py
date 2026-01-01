from rest_framework import serializers
from .models import MockAbhaRegistry, MockHealthProfessionalRegistry, MockHealthFacilityRegistry, FACILITY_TYPES

class CreateAbhaSerializer(serializers.Serializer):
    """
    Input serializer for creating a new ABHA ID.
    """
    phone_number = serializers.CharField(max_length=10)
    aadhaar = serializers.CharField(max_length=12)  # Required for verification

class CreateHPRSerializer(serializers.Serializer):
    """
    Input serializer for creating a new HPR ID (Doctor).
    """
    aadhaar = serializers.CharField(max_length=12)
    phone_number = serializers.CharField(max_length=10)
    specialization = serializers.CharField(max_length=100)

class CreateHFRSerializer(serializers.Serializer):
    """
    Input serializer for creating a new HFR ID (Facility).
    """
    name = serializers.CharField(max_length=255)
    type = serializers.ChoiceField(choices=FACILITY_TYPES)
    address = serializers.CharField()
    phone_number = serializers.CharField(max_length=10)

class MockAbhaResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockAbhaRegistry
        fields = ["abha_address", "first_name", "last_name", "gender", "dob", "phone_number"]

class MockHPRResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockHealthProfessionalRegistry
        fields = ["hpr_id", "first_name", "last_name", "specialization", "phone_number"]

class MockHFRResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockHealthFacilityRegistry
        fields = ["hfr_id", "name", "type", "address", "phone_number"]
