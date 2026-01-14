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
    journey_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_abha',
            'doctor', 'doctor_name', 'doctor_specialization',
            'scheduled_time', 'status', 'estimated_duration',
            'actual_start_time', 'actual_end_time', 'actual_duration_minutes',
            'journey_step', 'journey_id', 'created_at', 'is_paid', 'consultation_fee'
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
    
    def get_journey_id(self, obj):
        if obj.journey_step:
            return obj.journey_step.journey_id
        return None


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments with auto-journey creation"""
    estimated_duration = serializers.DurationField(required=False)
    journey_id = serializers.IntegerField(required=False, write_only=True, allow_null=True)
    reason = serializers.CharField(required=False, write_only=True, max_length=255, allow_blank=True)
    grant_consent = serializers.BooleanField(
        required=False, 
        default=False, 
        write_only=True,
        help_text="If true, auto-grants consent to the doctor's organization for this journey"
    )
    
    class Meta:
        model = Appointment
        fields = ['patient', 'doctor', 'scheduled_time', 'estimated_duration', 'journey_step', 'journey_id', 'reason', 'grant_consent']
        extra_kwargs = {
            'patient': {'required': False, 'read_only': True},
            'journey_step': {'required': False, 'allow_null': True, 'read_only': True}
        }
    
    def validate_scheduled_time(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Cannot schedule appointment in the past")
        return value
    
    def validate(self, data):
        from django.db import transaction
        from datetime import timedelta
        
        journey_id = data.get('journey_id')
        reason = data.get('reason')
        doctor = data.get('doctor')
        scheduled_time = data.get('scheduled_time')
        
        # If no journey_id, reason is required for new journey title
        if not journey_id and not reason:
            data['reason'] = f"Consultation - {scheduled_time.strftime('%b %d, %Y')}"
        
        # Check for slot conflicts - prevent double booking
        # Define a 30-minute slot window (appointments within 30 min of each other conflict)
        slot_window = timedelta(minutes=30)
        slot_start = scheduled_time - slot_window
        slot_end = scheduled_time + slot_window
        
        # Check if there's an existing non-cancelled appointment in this time window
        conflicting = Appointment.objects.filter(
            doctor=doctor,
            scheduled_time__gte=slot_start,
            scheduled_time__lt=slot_end,
            status__in=['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']
        ).exists()
        
        if conflicting:
            raise serializers.ValidationError({
                "scheduled_time": "This time slot is already booked. Please choose a different time."
            })
        
        return data


class QueueStatusSerializer(serializers.Serializer):
    """Response serializer for queue status/wait time prediction"""
    queue_position = serializers.IntegerField()
    people_ahead = serializers.IntegerField()
    avg_consultation_minutes = serializers.FloatField()
    estimated_wait_minutes = serializers.FloatField()
    predicted_start_time = serializers.DateTimeField()
    delay_minutes = serializers.FloatField()
    current_status = serializers.CharField()
