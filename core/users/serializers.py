from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PatientProfile, DoctorProfile, ProviderProfile, PROVIDER_TYPES

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "type", "phone_number"]

class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    aadhaar = serializers.CharField(max_length = 12, write_only=True, required=True)
    phone_number = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ["id", "email", "password", "phone_number", "aadhaar"]
    
    def create(self, validated_data):
        aadhaar = validated_data.pop("aadhaar")
        phone_number = validated_data["phone_number"]
        
        # Call Mock UHI to create ABHA
        from .services import UHIClient
        abha_data = UHIClient.create_abha(phone_number=phone_number, aadhaar=aadhaar)
        
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            phone_number=phone_number,
            first_name=abha_data.get("first_name", ""),
            last_name=abha_data.get("last_name", ""),
            type="PATIENT"
        )
        
        PatientProfile.objects.create(
            user=user,
            abha_id=abha_data.get("abha_address"),
            gender=abha_data.get("gender"),
            dob=abha_data.get("dob")
        )
        return user

class DoctorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    specialization = serializers.CharField(write_only=True)
    aadhaar = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(required=True)
    organization_hfr_id = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "phone_number", "specialization", "aadhaar", "organization_hfr_id"]

    def create(self, validated_data):
        specialization = validated_data.pop("specialization")
        aadhaar = validated_data.pop("aadhaar")
        phone_number = validated_data["phone_number"]
        organization_hfr_id = validated_data.pop("organization_hfr_id", None)
        
        # Find organization by HFR ID if provided
        organization = None
        if organization_hfr_id:
            from .models import ProviderProfile
            organization = ProviderProfile.objects.filter(hfr_id=organization_hfr_id).first()
        
        # Call Mock UHI to create HPR
        from .services import UHIClient
        hpr_data = UHIClient.create_hpr(aadhar=aadhaar, specialization=specialization, phone_number=phone_number)
        
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            phone_number=phone_number,
            first_name=hpr_data.get("first_name", ""),
            last_name=hpr_data.get("last_name", ""),
            type="DOCTOR"
        )
        DoctorProfile.objects.create(
            user=user,
            hpr_id = hpr_data["hpr_id"],
            specialization=specialization,
            organization=organization
        )
        return user

class ProviderRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    type = serializers.ChoiceField(choices=PROVIDER_TYPES, write_only=True)
    name = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ["email", "password", "phone_number", "type", "name", "address"]

    def create(self, validated_data):
        provider_type = validated_data.pop("type")
        name = validated_data.pop("name")
        address = validated_data.pop("address")
        phone_number = validated_data["phone_number"]

        from .services import UHIClient
        hfr_data = UHIClient.create_hfr(name=name, type=provider_type, address=address, phone_number=phone_number)
        
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            phone_number=phone_number,
            type="PROVIDER"
        )
        ProviderProfile.objects.create(
            user=user,
            type=provider_type,
            hfr_id = hfr_data["hfr_id"],
            name=name,
            address=address
        )
        return user
