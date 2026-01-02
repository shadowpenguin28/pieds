from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Avg, F
from datetime import timedelta

from .models import Appointment
from .serializers import (
    AppointmentSerializer, AppointmentCreateSerializer, QueueStatusSerializer
)


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    List appointments for the authenticated user or create a new appointment.
    - Patients see their own appointments
    - Doctors see their appointments
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        today = timezone.now().date()
        
        if user.is_patient:
            return Appointment.objects.filter(patient=user.patient_profile)
        elif user.is_doctor:
            return Appointment.objects.filter(doctor=user.doctor_profile)
        return Appointment.objects.none()
    
    def perform_create(self, serializer):
        """Auto-set patient from the authenticated user"""
        if not self.request.user.is_patient:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only patients can create appointments")
        serializer.save(patient=self.request.user.patient_profile)


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    """Get or update an appointment"""
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_patient:
            return Appointment.objects.filter(patient=user.patient_profile)
        elif user.is_doctor:
            return Appointment.objects.filter(doctor=user.doctor_profile)
        return Appointment.objects.none()


class StartAppointmentView(views.APIView):
    """Doctor starts a consultation - sets actual_start_time"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if not request.user.is_doctor:
            return Response({"error": "Only doctors can start appointments"}, status=status.HTTP_403_FORBIDDEN)
        
        appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user.doctor_profile)
        
        if appointment.status != 'SCHEDULED':
            return Response({"error": f"Cannot start appointment with status '{appointment.status}'"}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'IN_PROGRESS'
        appointment.actual_start_time = timezone.now()
        appointment.save()
        
        return Response({
            "message": "Appointment started",
            "appointment": AppointmentSerializer(appointment).data
        })


class CompleteAppointmentView(views.APIView):
    """Doctor completes a consultation - sets actual_end_time"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if not request.user.is_doctor:
            return Response({"error": "Only doctors can complete appointments"}, status=status.HTTP_403_FORBIDDEN)
        
        appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user.doctor_profile)
        
        if appointment.status != 'IN_PROGRESS':
            return Response({"error": f"Cannot complete appointment with status '{appointment.status}'"}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'COMPLETED'
        appointment.actual_end_time = timezone.now()
        appointment.save()
        
        return Response({
            "message": "Appointment completed",
            "appointment": AppointmentSerializer(appointment).data
        })


class CancelAppointmentView(views.APIView):
    """Cancel an appointment and refund if paid"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        user = request.user
        
        # Get appointment based on user type
        if user.is_patient:
            appointment = get_object_or_404(Appointment, pk=pk, patient=user.patient_profile)
        elif user.is_doctor:
            appointment = get_object_or_404(Appointment, pk=pk, doctor=user.doctor_profile)
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        if appointment.status not in ['SCHEDULED', 'IN_PROGRESS']:
            return Response({"error": f"Cannot cancel appointment with status '{appointment.status}'"}, status=status.HTTP_400_BAD_REQUEST)
        
        refund_amount = None
        cancellation_fee = None
        
        # Process refund if appointment was paid (with 5% cancellation fee)
        if appointment.is_paid:
            from payments.models import Wallet
            from decimal import Decimal, ROUND_HALF_UP
            
            full_amount = appointment.doctor.consultation_fee
            
            # Calculate 5% cancellation fee and 95% refund
            fee_rate = Decimal('0.05')
            cancellation_fee = (full_amount * fee_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            refund = full_amount - cancellation_fee
            
            # Refund to patient (95%)
            patient_wallet, _ = Wallet.objects.get_or_create(user=appointment.patient.user)
            patient_wallet.credit(
                amount=refund,
                reason="REFUND",
                appointment=appointment,
                description=f"Refund for cancelled appointment (5% cancellation fee deducted)"
            )
            
            # Debit from doctor (only the refund portion, doctor keeps the 5% fee)
            doctor_wallet, _ = Wallet.objects.get_or_create(user=appointment.doctor.user)
            if doctor_wallet.balance >= refund:
                doctor_wallet.debit(
                    amount=refund,
                    reason="REFUND",
                    appointment=appointment,
                    description=f"Refund to {appointment.patient.user.first_name} (kept ₹{cancellation_fee} cancellation fee)"
                )
            
            refund_amount = str(refund)
            cancellation_fee = str(cancellation_fee)
            appointment.is_paid = False
        
        appointment.status = 'CANCELLED'
        appointment.save()
        
        response_data = {
            "message": "Appointment cancelled",
            "appointment": AppointmentSerializer(appointment).data
        }
        
        if refund_amount:
            response_data["refund_amount"] = refund_amount
            response_data["cancellation_fee"] = cancellation_fee
            response_data["message"] = f"Appointment cancelled. ₹{refund_amount} refunded (5% cancellation fee: ₹{cancellation_fee})"
        
        return Response(response_data)


class DoctorQueueView(views.APIView):
    """Get today's queue for a doctor"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, doctor_id):
        today = timezone.now().date()
        
        appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            scheduled_time__date=today,
            status__in=['SCHEDULED', 'IN_PROGRESS']
        ).order_by('scheduled_time')
        
        return Response({
            "doctor_id": doctor_id,
            "date": today,
            "queue_count": appointments.count(),
            "appointments": AppointmentSerializer(appointments, many=True).data
        })


class WaitTimeView(views.APIView):
    """Get predicted wait time for an appointment"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        
        # Verify access
        user = request.user
        if user.is_patient and appointment.patient.user != user:
            return Response({"error": "Not your appointment"}, status=status.HTTP_403_FORBIDDEN)
        
        if appointment.status in ['COMPLETED', 'CANCELLED']:
            return Response({"error": "Appointment already completed or cancelled"}, status=status.HTTP_400_BAD_REQUEST)
        
        if appointment.status == 'IN_PROGRESS':
            return Response({
                "queue_position": 0,
                "people_ahead": 0,
                "current_status": "in_progress",
                "message": "Your consultation is in progress"
            })
        
        # Calculate wait time
        doctor = appointment.doctor
        today = timezone.now().date()
        now = timezone.now()
        
        # Get average consultation duration from recent completed appointments
        recent_completed = Appointment.objects.filter(
            doctor=doctor,
            status='COMPLETED',
            actual_start_time__isnull=False,
            actual_end_time__isnull=False
        ).order_by('-actual_end_time')[:10]
        
        if recent_completed.exists():
            durations = [
                (a.actual_end_time - a.actual_start_time).total_seconds() 
                for a in recent_completed
            ]
            avg_seconds = sum(durations) / len(durations)
            # Ensure minimum of 15 minutes
            avg_duration = timedelta(seconds=max(avg_seconds, 900))
        else:
            # Default to 15 minutes per consultation when no historical data is available
            avg_duration = timedelta(minutes=15)
        
        # Count appointments ahead (scheduled before this one, not completed)
        # Use the appointment's scheduled date, not today's date
        from datetime import datetime, time
        appt_date = appointment.scheduled_time.date()
        start_of_day = timezone.make_aware(datetime.combine(appt_date, time.min))
        end_of_day = timezone.make_aware(datetime.combine(appt_date, time.max))
        
        ahead = Appointment.objects.filter(
            doctor=doctor,
            scheduled_time__gte=start_of_day,
            scheduled_time__lte=end_of_day,
            scheduled_time__lt=appointment.scheduled_time,
            status__in=['SCHEDULED', 'IN_PROGRESS']
        ).exclude(id=appointment.id).count()
        
        # Calculate predicted start time based on queue
        # Check if there's an appointment in progress
        in_progress = Appointment.objects.filter(
            doctor=doctor,
            status='IN_PROGRESS'
        ).first()
        
        if in_progress and in_progress.actual_start_time:
            # There's an active consultation
            elapsed = now - in_progress.actual_start_time
            remaining = max(avg_duration - elapsed, timedelta(0))
            # Predicted start = remaining time + time for people ahead
            predicted_start = now + remaining + (ahead * avg_duration)
        else:
            # No active consultation
            # Get the earliest scheduled appointment for this doctor on this day
            earliest_appt = Appointment.objects.filter(
                doctor=doctor,
                scheduled_time__gte=start_of_day,
                scheduled_time__lte=end_of_day,
                status='SCHEDULED'
            ).order_by('scheduled_time').first()
            
            if earliest_appt:
                # Start from the earliest scheduled time
                base_start = max(now, earliest_appt.scheduled_time)
                # Calculate based on queue position from earliest
                all_ahead = Appointment.objects.filter(
                    doctor=doctor,
                    scheduled_time__gte=start_of_day,
                    scheduled_time__lte=end_of_day,
                    scheduled_time__lt=appointment.scheduled_time,
                    status='SCHEDULED'
                ).exclude(id=appointment.id).count()
                predicted_start = base_start + (all_ahead * avg_duration)
            else:
                # No other appointments, use scheduled time
                predicted_start = appointment.scheduled_time
        
        # Calculate wait time as delay beyond scheduled time
        if predicted_start <= appointment.scheduled_time:
            # Running on time or early - no wait
            estimated_wait_minutes = 0.0
            predicted_start = appointment.scheduled_time
            delay_minutes = 0.0
        else:
            # Running late - show delay
            delay = predicted_start - appointment.scheduled_time
            delay_minutes = delay.total_seconds() / 60
            estimated_wait_minutes = delay_minutes
        
        return Response({
            "queue_position": ahead + 1,
            "people_ahead": ahead,
            "avg_consultation_minutes": round(avg_duration.total_seconds() / 60, 1),
            "estimated_wait_minutes": round(estimated_wait_minutes, 1),
            "predicted_start_time": predicted_start,
            "delay_minutes": round(delay_minutes, 1),
            "current_status": "waiting"
        })

