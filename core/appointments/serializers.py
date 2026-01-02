from rest_framework import serializers
from django.utils import timezone
from .models import Appointment, APPOINTMENT_STATUS_CHOICES
from users.models import PatientProfile, DoctorProfile


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for appointment CRUD operations"""
    patient_name = serializers.SerializerMethodField()
    patient_abha = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()
    actual_duration_minutes = serializers.SerializerMethodField()
    consultation_fee = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_abha',
            'doctor', 'doctor_name', 'doctor_specialization',
            'scheduled_time', 'status', 'estimated_duration',
            'actual_start_time', 'actual_end_time', 'actual_duration_minutes',
            'journey_step', 'created_at', 'is_paid', 'consultation_fee'
        ]
        read_only_fields = ['actual_start_time', 'actual_end_time', 'created_at', 'is_paid']
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip() or obj.patient.user.email
    
    def get_patient_abha(self, obj):
        return obj.patient.abha_id
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.first_name} {obj.doctor.user.last_name}".strip()
    
    def get_doctor_specialization(self, obj):
        return obj.doctor.specialization
    
    def get_actual_duration_minutes(self, obj):
        if obj.actual_duration:
            return int(obj.actual_duration.total_seconds() / 60)
        return None
    
    def get_consultation_fee(self, obj):
        return str(obj.doctor.consultation_fee)


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments"""
    estimated_duration = serializers.DurationField(required=False)
    
    class Meta:
        model = Appointment
        fields = ['patient', 'doctor', 'scheduled_time', 'estimated_duration', 'journey_step']
        extra_kwargs = {
            'patient': {'required': False, 'read_only': True},
            'journey_step': {'required': False, 'allow_null': True}
        }
    
    def validate_scheduled_time(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Cannot schedule appointment in the past")
        return value


class QueueStatusSerializer(serializers.Serializer):
    """Response serializer for queue status/wait time prediction"""
    queue_position = serializers.IntegerField()
    people_ahead = serializers.IntegerField()
    avg_consultation_minutes = serializers.FloatField()
    estimated_wait_minutes = serializers.FloatField()
    predicted_start_time = serializers.DateTimeField()
    delay_minutes = serializers.FloatField()
    current_status = serializers.CharField()
