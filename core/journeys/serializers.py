from rest_framework import serializers
from .models import Journey, JourneyStep, Prescription, MedicalReport, HealthDataConsent
from users.models import PatientProfile, DoctorProfile, ProviderProfile


class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'file', 'data']


class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = ['id', 'doctor', 'doctor_name', 'medications', 'digital_signature']
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.first_name} {obj.doctor.user.last_name}"


class JourneyStepSerializer(serializers.ModelSerializer):
    prescription = PrescriptionSerializer(read_only=True)
    report = MedicalReportSerializer(read_only=True)
    created_by_org_name = serializers.SerializerMethodField()
    created_by_doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = JourneyStep
        fields = [
            'id', 'order', 'type', 'notes', 'created_at',
            'created_by_org', 'created_by_org_name',
            'created_by_doctor', 'created_by_doctor_name',
            'prescription', 'report'
        ]
    
    def get_created_by_org_name(self, obj):
        return obj.created_by_org.name if obj.created_by_org else None
    
    def get_created_by_doctor_name(self, obj):
        if obj.created_by_doctor:
            return f"Dr. {obj.created_by_doctor.user.first_name} {obj.created_by_doctor.user.last_name}"
        return None


class JourneySerializer(serializers.ModelSerializer):
    steps = JourneyStepSerializer(many=True, read_only=True)
    patient_abha_id = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    created_by_org_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Journey
        fields = [
            'id', 'title', 'status', 'created_at',
            'patient', 'patient_abha_id', 'patient_name',
            'created_by_org', 'created_by_org_name',
            'steps'
        ]
    
    def get_patient_abha_id(self, obj):
        return obj.patient.abha_id
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
    
    def get_created_by_org_name(self, obj):
        return obj.created_by_org.name if obj.created_by_org else None


class JourneyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new journey"""
    class Meta:
        model = Journey
        fields = ['title', 'patient']
    
    def create(self, validated_data):
        # Get the requesting doctor's organization from context
        request = self.context.get('request')
        doctor_profile = getattr(request.user, 'doctor_profile', None)
        
        journey = Journey.objects.create(
            **validated_data,
            created_by_org=doctor_profile.organization if doctor_profile else None
        )
        return journey


class JourneyStepCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new journey step"""
    class Meta:
        model = JourneyStep
        fields = ['journey', 'type', 'notes', 'order', 'parent_step']
    
    def create(self, validated_data):
        request = self.context.get('request')
        doctor_profile = getattr(request.user, 'doctor_profile', None)
        
        step = JourneyStep.objects.create(
            **validated_data,
            created_by_org=doctor_profile.organization if doctor_profile else None,
            created_by_doctor=doctor_profile
        )
        return step


# Consent Serializers
class HealthDataConsentSerializer(serializers.ModelSerializer):
    requesting_org_name = serializers.SerializerMethodField()
    requesting_doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthDataConsent
        fields = [
            'id', 'patient', 'patient_name',
            'requesting_org', 'requesting_org_name',
            'requesting_doctor', 'requesting_doctor_name',
            'status', 'purpose',
            'requested_at', 'responded_at'
        ]
        read_only_fields = ['requested_at', 'responded_at']
    
    def get_requesting_org_name(self, obj):
        return obj.requesting_org.name
    
    def get_requesting_doctor_name(self, obj):
        if obj.requesting_doctor:
            return f"Dr. {obj.requesting_doctor.user.first_name} {obj.requesting_doctor.user.last_name}"
        return None
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"


class ConsentRequestSerializer(serializers.Serializer):
    """For requesting access to a patient's data by ABHA ID"""
    patient_abha_id = serializers.CharField(max_length=50)
    purpose = serializers.CharField(required=False, allow_blank=True)


class ConsentResponseSerializer(serializers.Serializer):
    """For patient to grant/deny consent"""
    status = serializers.ChoiceField(choices=['GRANTED', 'DENIED'])


# ============ Doctor Action Serializers ============

class OrderTestSerializer(serializers.Serializer):
    """Doctor orders a test for a patient within a journey"""
    journey_id = serializers.IntegerField()
    test_name = serializers.CharField(max_length=255)
    notes = serializers.CharField(required=False, allow_blank=True)


class WritePrescriptionSerializer(serializers.Serializer):
    """Doctor writes a prescription within a journey"""
    journey_id = serializers.IntegerField()
    medications = serializers.JSONField(help_text="List of medications with dosage")
    notes = serializers.CharField(required=False, allow_blank=True)

