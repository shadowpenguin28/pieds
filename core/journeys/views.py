from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import Journey, JourneyStep, HealthDataConsent
from .serializers import (
    JourneySerializer, JourneyCreateSerializer,
    JourneyStepSerializer, JourneyStepCreateSerializer,
    HealthDataConsentSerializer, ConsentRequestSerializer, ConsentResponseSerializer
)
from users.models import PatientProfile, DoctorProfile


class JourneyListCreateView(generics.ListCreateAPIView):
    """
    List journeys for the authenticated user or create a new journey.
    - Patients see their own journeys
    - Doctors see journeys where they have access (own org or consented)
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JourneyCreateSerializer
        return JourneySerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_patient:
            # Patients see all their journeys
            return Journey.objects.filter(patient=user.patient_profile)
        
        elif user.is_doctor:
            doctor = user.doctor_profile
            org = doctor.organization
            
            # Get patients who have granted consent to this org
            consented_patients = HealthDataConsent.objects.filter(
                requesting_org=org,
                status='GRANTED'
            ).values_list('patient_id', flat=True)
            
            # Journeys from own org OR from consented patients
            return Journey.objects.filter(
                Q(created_by_org=org) | Q(patient_id__in=consented_patients)
            ).distinct()
        
        return Journey.objects.none()


class JourneyDetailView(generics.RetrieveAPIView):
    """Get a single journey with all steps (respecting consent)"""
    permission_classes = [IsAuthenticated]
    serializer_class = JourneySerializer
    
    def get_queryset(self):
        return Journey.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        journey = self.get_object()
        user = request.user
        
        # Check access
        if user.is_patient:
            if journey.patient.user != user:
                return Response({"error": "Not your journey"}, status=status.HTTP_403_FORBIDDEN)
        
        elif user.is_doctor:
            doctor = user.doctor_profile
            org = doctor.organization
            
            # Check if doctor's org created this journey OR has consent
            has_consent = HealthDataConsent.objects.filter(
                patient=journey.patient,
                requesting_org=org,
                status='GRANTED'
            ).exists()
            
            journey_from_own_org = journey.created_by_org == org
            
            if not (journey_from_own_org or has_consent):
                return Response(
                    {"error": "Consent required to view this journey"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(journey)
        return Response(serializer.data)


class JourneyStepCreateView(generics.CreateAPIView):
    """Create a new step in a journey"""
    permission_classes = [IsAuthenticated]
    serializer_class = JourneyStepCreateSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# ============ Cross-Org Access APIs ============

class RequestAccessByAbhaView(views.APIView):
    """
    Doctor/Org requests access to a patient's data by ABHA ID.
    Creates a consent request that the patient must approve.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ConsentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        abha_id = serializer.validated_data['patient_abha_id']
        purpose = serializer.validated_data.get('purpose', '')
        
        # Find patient by ABHA ID
        try:
            patient = PatientProfile.objects.get(abha_id=abha_id)
        except PatientProfile.DoesNotExist:
            return Response({"error": "No patient found with this ABHA ID"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get requesting doctor's org
        if not request.user.is_doctor:
            return Response({"error": "Only doctors can request access"}, status=status.HTTP_403_FORBIDDEN)
        
        doctor = request.user.doctor_profile
        org = doctor.organization
        
        if not org:
            return Response({"error": "Doctor must be affiliated with an organization"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if consent already exists
        existing = HealthDataConsent.objects.filter(patient=patient, requesting_org=org).first()
        if existing:
            if existing.status == 'GRANTED':
                return Response({"message": "Access already granted", "consent": HealthDataConsentSerializer(existing).data})
            elif existing.status == 'PENDING':
                return Response({"message": "Request already pending", "consent": HealthDataConsentSerializer(existing).data})
            else:
                # Update existing denied/revoked request
                existing.status = 'PENDING'
                existing.purpose = purpose
                existing.requesting_doctor = doctor
                existing.save()
                return Response({"message": "New access request submitted", "consent": HealthDataConsentSerializer(existing).data})
        
        # Create new consent request
        consent = HealthDataConsent.objects.create(
            patient=patient,
            requesting_org=org,
            requesting_doctor=doctor,
            purpose=purpose,
            status='PENDING'
        )
        
        return Response({
            "message": "Access request sent to patient",
            "consent": HealthDataConsentSerializer(consent).data
        }, status=status.HTTP_201_CREATED)


class PatientConsentListView(generics.ListAPIView):
    """List all consent requests for the authenticated patient"""
    permission_classes = [IsAuthenticated]
    serializer_class = HealthDataConsentSerializer
    
    def get_queryset(self):
        if not self.request.user.is_patient:
            return HealthDataConsent.objects.none()
        return HealthDataConsent.objects.filter(patient=self.request.user.patient_profile)


class ConsentRespondView(views.APIView):
    """Patient grants or denies a consent request"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, consent_id):
        if not request.user.is_patient:
            return Response({"error": "Only patients can respond to consent requests"}, status=status.HTTP_403_FORBIDDEN)
        
        consent = get_object_or_404(HealthDataConsent, id=consent_id, patient=request.user.patient_profile)
        
        serializer = ConsentResponseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        consent.status = serializer.validated_data['status']
        consent.responded_at = timezone.now()
        consent.save()
        
        return Response({
            "message": f"Consent {consent.status.lower()}",
            "consent": HealthDataConsentSerializer(consent).data
        })


class FetchJourneysByAbhaView(views.APIView):
    """
    Fetch all journeys for a patient by ABHA ID.
    Only returns data if consent is granted.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, abha_id):
        # Find patient
        try:
            patient = PatientProfile.objects.get(abha_id=abha_id)
        except PatientProfile.DoesNotExist:
            return Response({"error": "No patient found with this ABHA ID"}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        
        if user.is_patient:
            # Patient can only fetch their own data
            if patient.user != user:
                return Response({"error": "Cannot access another patient's data"}, status=status.HTTP_403_FORBIDDEN)
            journeys = Journey.objects.filter(patient=patient)
        
        elif user.is_doctor:
            doctor = user.doctor_profile
            org = doctor.organization
            
            # Check consent
            has_consent = HealthDataConsent.objects.filter(
                patient=patient,
                requesting_org=org,
                status='GRANTED'
            ).exists()
            
            if not has_consent:
                return Response({
                    "error": "Consent required",
                    "message": "You must request and receive consent from the patient to view their data."
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Return all journeys (with consent, they can see everything)
            journeys = Journey.objects.filter(patient=patient)
        
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = JourneySerializer(journeys, many=True)
        return Response({
            "patient_abha_id": abha_id,
            "patient_name": f"{patient.user.first_name} {patient.user.last_name}",
            "journeys": serializer.data
        })
