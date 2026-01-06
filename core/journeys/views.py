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
    Only returns data if consent is granted (for doctors).
    Providers can access for report uploads.
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
        
        elif user.is_provider:
            # Providers (labs) can look up patients by ABHA ID to upload reports
            # The patient implicitly consents by providing their ABHA ID at the lab
            journeys = Journey.objects.filter(patient=patient)
        
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = JourneySerializer(journeys, many=True)
        return Response({
            "patient_abha_id": abha_id,
            "patient_name": f"{patient.user.first_name} {patient.user.last_name}",
            "journeys": serializer.data
        })


# ============ Lab Report APIs ============

from rest_framework.parsers import MultiPartParser, FormParser
from .models import MedicalReport

class ReportUploadView(views.APIView):
    """
    Upload a medical report file for a journey step.
    Only providers (labs, hospitals) can upload reports.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, step_id):
        if not request.user.is_provider:
            return Response({"error": "Only providers can upload reports"}, status=status.HTTP_403_FORBIDDEN)
        
        step = get_object_or_404(JourneyStep, pk=step_id)
        
        # Verify step type is TEST
        if step.type != 'TEST':
            return Response({"error": "Reports can only be uploaded for TEST type steps"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if report already exists
        if hasattr(step, 'report') and step.report:
            return Response({"error": "Report already exists for this step"}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get optional parsed data
        data = request.data.get('data')
        parsed_data = None
        if data:
            import json
            try:
                parsed_data = json.loads(data)
            except json.JSONDecodeError:
                pass
        
        # Create report
        report = MedicalReport.objects.create(
            step=step,
            provider=request.user.provider_profile,
            file=file,
            data=parsed_data
        )
        
        return Response({
            "message": "Report uploaded successfully",
            "report_id": report.id,
            "file_url": request.build_absolute_uri(report.file.url) if report.file else None
        }, status=status.HTTP_201_CREATED)


class ReportDownloadView(views.APIView):
    """
    Download/view a medical report for a journey step.
    Patients can view their own reports.
    Doctors with consent can view patient reports.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, step_id):
        step = get_object_or_404(JourneyStep, pk=step_id)
        
        if not hasattr(step, 'report') or not step.report:
            return Response({"error": "No report found for this step"}, status=status.HTTP_404_NOT_FOUND)
        
        report = step.report
        user = request.user
        
        # Check access
        if user.is_patient:
            if step.journey.patient.user != user:
                return Response({"error": "Not your report"}, status=status.HTTP_403_FORBIDDEN)
        
        elif user.is_doctor:
            doctor = user.doctor_profile
            org = doctor.organization
            
            # Check consent
            has_consent = HealthDataConsent.objects.filter(
                patient=step.journey.patient,
                requesting_org=org,
                status='GRANTED'
            ).exists()
            
            journey_from_own_org = step.journey.created_by_org == org
            
            if not (journey_from_own_org or has_consent):
                return Response({"error": "Consent required"}, status=status.HTTP_403_FORBIDDEN)
        
        elif user.is_provider:
            # Provider can view reports they created
            if report.provider.user != user:
                return Response({"error": "Not your report"}, status=status.HTTP_403_FORBIDDEN)
        
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            "report_id": report.id,
            "step_id": step.id,
            "provider": report.provider.name if report.provider else None,
            "file_url": request.build_absolute_uri(report.file.url) if report.file else None,
            "data": report.data
        })


# ============ Doctor Action APIs ============

from .serializers import OrderTestSerializer, WritePrescriptionSerializer
from .models import Prescription

class OrderTestView(views.APIView):
    """
    Doctor orders a test for a patient within an existing journey.
    Creates a TEST type step in the journey.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_doctor:
            return Response({"error": "Only doctors can order tests"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderTestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        journey_id = serializer.validated_data['journey_id']
        test_name = serializer.validated_data['test_name']
        notes = serializer.validated_data.get('notes', '')
        
        doctor = request.user.doctor_profile
        org = doctor.organization
        
        # Get journey and check access
        try:
            journey = Journey.objects.get(id=journey_id)
        except Journey.DoesNotExist:
            return Response({"error": "Journey not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check consent
        has_consent = HealthDataConsent.objects.filter(
            patient=journey.patient,
            requesting_org=org,
            status='GRANTED'
        ).exists()
        
        journey_from_own_org = journey.created_by_org == org
        
        if not (journey_from_own_org or has_consent):
            return Response({"error": "Consent required to modify this journey"}, status=status.HTTP_403_FORBIDDEN)
        
        # Create TEST step
        step_order = journey.steps.count() + 1
        step = JourneyStep.objects.create(
            journey=journey,
            type="TEST",
            order=step_order,
            notes=f"{test_name}: {notes}" if notes else test_name,
            created_by_org=org,
            created_by_doctor=doctor
        )
        
        return Response({
            "message": f"Test '{test_name}' ordered successfully",
            "step_id": step.id,
            "journey_id": journey.id
        }, status=status.HTTP_201_CREATED)


class WritePrescriptionView(views.APIView):
    """
    Doctor writes a prescription within an existing journey.
    Creates a PHARMACY type step with prescription details.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_doctor:
            return Response({"error": "Only doctors can write prescriptions"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = WritePrescriptionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        journey_id = serializer.validated_data['journey_id']
        medications = serializer.validated_data['medications']
        notes = serializer.validated_data.get('notes', '')
        
        doctor = request.user.doctor_profile
        org = doctor.organization
        
        # Get journey and check access
        try:
            journey = Journey.objects.get(id=journey_id)
        except Journey.DoesNotExist:
            return Response({"error": "Journey not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check consent
        has_consent = HealthDataConsent.objects.filter(
            patient=journey.patient,
            requesting_org=org,
            status='GRANTED'
        ).exists()
        
        journey_from_own_org = journey.created_by_org == org
        
        if not (journey_from_own_org or has_consent):
            return Response({"error": "Consent required to modify this journey"}, status=status.HTTP_403_FORBIDDEN)
        
        # Create PHARMACY step
        step_order = journey.steps.count() + 1
        step = JourneyStep.objects.create(
            journey=journey,
            type="PHARMACY",
            order=step_order,
            notes=notes or "Prescription",
            created_by_org=org,
            created_by_doctor=doctor
        )
        
        # Create Prescription record
        prescription = Prescription.objects.create(
            step=step,
            doctor=doctor,
            medications=medications
        )
        
        return Response({
            "message": "Prescription created successfully",
            "step_id": step.id,
            "prescription_id": prescription.id,
            "journey_id": journey.id
        }, status=status.HTTP_201_CREATED)

