from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import HttpResponse
from django.conf import settings
import qrcode
import io
import json
import hashlib
import hmac
import base64
from .models import PatientProfile, DoctorProfile, ProviderProfile, User
from .serializers import PatientRegistrationSerializer, DoctorRegistrationSerializer, ProviderRegistrationSerializer

# Secret key for HMAC signing (in production, use settings.SECRET_KEY)
QR_SECRET_KEY = getattr(settings, 'SECRET_KEY', 'default-secret-key')


class PatientRegisterView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer
    queryset = PatientProfile.objects.all()
    permission_classes = [AllowAny]

class DoctorRegisterView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer
    queryset = DoctorProfile.objects.all()
    permission_classes = [AllowAny]

class ProviderRegistrationView(generics.CreateAPIView):
    serializer_class = ProviderRegistrationSerializer
    queryset = ProviderProfile.objects.all()
    permission_classes = [AllowAny]


# ============ QR Code APIs ============

def generate_qr_signature(abha_id, patient_id):
    """Generate HMAC signature for QR verification"""
    message = f"{abha_id}:{patient_id}"
    signature = hmac.new(
        QR_SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()[:16]  # Use first 16 chars for shorter QR
    return signature


def verify_qr_signature(abha_id, patient_id, signature):
    """Verify HMAC signature from QR"""
    expected = generate_qr_signature(abha_id, patient_id)
    return hmac.compare_digest(expected, signature)


class PatientQRCodeView(views.APIView):
    """
    Generate QR code for logged-in patient.
    QR contains: ABHA ID, patient ID, and HMAC signature for verification.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_patient:
            return Response({"error": "Only patients can generate QR codes"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            patient = request.user.patient_profile
        except PatientProfile.DoesNotExist:
            return Response({"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not patient.abha_id:
            return Response({"error": "ABHA ID not set for this patient"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate signature
        signature = generate_qr_signature(patient.abha_id, patient.id)
        
        # QR payload (minimal data for security)
        qr_payload = {
            "v": "1.0",  # version
            "a": patient.abha_id,  # ABHA ID
            "p": patient.id,  # Patient ID
            "s": signature  # Signature
        }
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_payload))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Return as PNG image
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return HttpResponse(buffer, content_type='image/png')


class GetQRDataView(views.APIView):
    """
    Get QR code data as JSON (for frontend to generate QR).
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_patient:
            return Response({"error": "Only patients can access QR data"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            patient = request.user.patient_profile
        except PatientProfile.DoesNotExist:
            return Response({"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not patient.abha_id:
            return Response({"error": "ABHA ID not set"}, status=status.HTTP_400_BAD_REQUEST)
        
        signature = generate_qr_signature(patient.abha_id, patient.id)
        
        return Response({
            "qr_data": {
                "v": "1.0",
                "a": patient.abha_id,
                "p": patient.id,
                "s": signature
            }
        })


class QRScanView(views.APIView):
    """
    Scan/decode QR and return patient data for form filling.
    Used by hospital staff to auto-fill registration forms.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Only doctors/providers can scan QR
        if request.user.is_patient:
            return Response({"error": "Patients cannot scan QR codes"}, status=status.HTTP_403_FORBIDDEN)
        
        qr_data = request.data.get('qr_data')
        if not qr_data:
            return Response({"error": "qr_data is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse QR data (can be string or dict)
        if isinstance(qr_data, str):
            try:
                qr_data = json.loads(qr_data)
            except json.JSONDecodeError:
                return Response({"error": "Invalid QR data format"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract fields
        abha_id = qr_data.get('a')
        patient_id = qr_data.get('p')
        signature = qr_data.get('s')
        
        if not all([abha_id, patient_id, signature]):
            return Response({"error": "Invalid QR: missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify signature
        if not verify_qr_signature(abha_id, patient_id, signature):
            return Response({"error": "Invalid QR: signature verification failed"}, status=status.HTTP_403_FORBIDDEN)
        
        # Fetch patient data
        try:
            patient = PatientProfile.objects.get(id=patient_id, abha_id=abha_id)
        except PatientProfile.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Return form data
        return Response({
            "patient_id": patient.id,
            "abha_id": patient.abha_id,
            "name": f"{patient.user.first_name} {patient.user.last_name}".strip() or patient.user.email,
            "email": patient.user.email,
            "phone_number": patient.user.phone_number,
            "date_of_birth": patient.dob,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "address": patient.address,
            "emergency_contact": {
                "name": patient.emergency_contact_name,
                "phone": patient.emergency_contact_phone
            },
            "allergies": patient.allergies,
            "current_medications": patient.current_medications
        })
