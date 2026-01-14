from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer to include user data in login response"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'is_patient': user.is_patient,
            'is_doctor': user.is_doctor,
            'is_provider': user.is_provider,
        }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns user data with tokens"""
    serializer_class = CustomTokenObtainPairSerializer


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


class DoctorListView(views.APIView):
    """List all doctors for appointment booking"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        doctors = DoctorProfile.objects.all()
        data = []
        for doc in doctors:
            data.append({
                'id': doc.id,
                'name': f"Dr. {doc.user.first_name} {doc.user.last_name}".strip(),
                'email': doc.user.email,
                'specialization': doc.specialization,
                'consultation_fee': str(doc.consultation_fee),
                'hpr_id': doc.hpr_id,
            })
        return Response(data)


class LabListView(views.APIView):
    """List all lab providers for test ordering"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        labs = ProviderProfile.objects.filter(type='LAB')
        data = []
        for lab in labs:
            data.append({
                'id': lab.id,
                'name': lab.name,
                'address': lab.address,
                'hfr_id': lab.hfr_id,
            })
        return Response(data)


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
    Contains all patient profile data for hospital form filling.
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
        
        # Include all profile data for hospital form filling
        return Response({
            "qr_data": {
                "version": "2.0",
                "abha_id": patient.abha_id,
                "patient_id": patient.id,
                "signature": signature,
                # User info
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "email": request.user.email,
                "phone_number": request.user.phone_number or "",
                # Patient profile data
                "date_of_birth": str(patient.dob) if patient.dob else "",
                "gender": patient.gender or "",
                "blood_group": patient.blood_group or "",
                "address": patient.address or "",
                "emergency_contact_name": patient.emergency_contact_name or "",
                "emergency_contact_phone": patient.emergency_contact_phone or "",
                "allergies": patient.allergies or "",
                "current_medications": patient.current_medications or "",
            }
        })


class QRScanView(views.APIView):
    """
    Scan/decode QR and return patient data for form filling.
    Used by hospital staff to auto-fill registration forms.
    Supports both v1.0 (minimal) and v2.0 (full profile) QR formats.
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
        
        # Extract fields - support both old abbreviated and new descriptive names
        abha_id = qr_data.get('abha_id') or qr_data.get('a')
        patient_id = qr_data.get('patient_id') or qr_data.get('p')
        signature = qr_data.get('signature') or qr_data.get('s')
        version = qr_data.get('version') or qr_data.get('v', '1.0')
        
        if not all([abha_id, patient_id, signature]):
            return Response({"error": "Invalid QR: missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify signature
        if not verify_qr_signature(abha_id, patient_id, signature):
            return Response({"error": "Invalid QR: signature verification failed"}, status=status.HTTP_403_FORBIDDEN)
        
        # For v2.0 QR codes, use embedded data (faster, no DB lookup required)
        # Support both old abbreviated and new descriptive field names
        first_name = qr_data.get('first_name') or qr_data.get('fn')
        if version == "2.0" and first_name is not None:
            last_name = qr_data.get('last_name') or qr_data.get('ln', '')
            email = qr_data.get('email') or qr_data.get('e', '')
            return Response({
                "patient_id": patient_id,
                "abha_id": abha_id,
                "name": f"{first_name} {last_name}".strip() or email,
                "email": email,
                "phone_number": qr_data.get('phone_number') or qr_data.get('ph', ''),
                "date_of_birth": qr_data.get('date_of_birth') or qr_data.get('dob', ''),
                "gender": qr_data.get('gender') or qr_data.get('g', ''),
                "blood_group": qr_data.get('blood_group') or qr_data.get('bg', ''),
                "address": qr_data.get('address') or qr_data.get('addr', ''),
                "emergency_contact": {
                    "name": qr_data.get('emergency_contact_name') or qr_data.get('ecn', ''),
                    "phone": qr_data.get('emergency_contact_phone') or qr_data.get('ecp', '')
                },
                "allergies": qr_data.get('allergies') or qr_data.get('alg', ''),
                "current_medications": qr_data.get('current_medications') or qr_data.get('med', '')
            })
        
        # For v1.0 or fallback: Fetch patient data from database
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


# ============ Profile APIs ============

class ProfileView(views.APIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "type": user.type,
        }
        
        if user.is_patient:
            try:
                profile = user.patient_profile
                data["profile"] = {
                    "abha_id": profile.abha_id,
                    "dob": profile.dob,
                    "gender": profile.gender,
                    "blood_group": profile.blood_group,
                    "address": profile.address,
                    "emergency_contact_name": profile.emergency_contact_name,
                    "emergency_contact_phone": profile.emergency_contact_phone,
                    "allergies": profile.allergies,
                    "current_medications": profile.current_medications,
                }
            except PatientProfile.DoesNotExist:
                pass
        
        elif user.is_doctor:
            try:
                profile = user.doctor_profile
                data["profile"] = {
                    "hpr_id": profile.hpr_id,
                    "specialization": profile.specialization,
                    "consultation_fee": str(profile.consultation_fee),
                    "organization": profile.organization.name if profile.organization else None,
                }
            except DoctorProfile.DoesNotExist:
                pass
        
        elif user.is_provider:
            try:
                profile = user.provider_profile
                data["profile"] = {
                    "hfr_id": profile.hfr_id,
                    "name": profile.name,
                    "type": profile.type,
                    "address": profile.address,
                }
            except ProviderProfile.DoesNotExist:
                pass
        
        return Response(data)
    
    def patch(self, request):
        user = request.user
        data = request.data
        
        # Update basic user fields
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "phone_number" in data:
            user.phone_number = data["phone_number"]
        user.save()
        
        # Update profile-specific fields
        profile_data = data.get("profile", {})
        
        if user.is_patient:
            try:
                profile = user.patient_profile
                if "dob" in profile_data:
                    profile.dob = profile_data["dob"]
                if "gender" in profile_data:
                    profile.gender = profile_data["gender"]
                if "blood_group" in profile_data:
                    profile.blood_group = profile_data["blood_group"]
                if "address" in profile_data:
                    profile.address = profile_data["address"]
                if "emergency_contact_name" in profile_data:
                    profile.emergency_contact_name = profile_data["emergency_contact_name"]
                if "emergency_contact_phone" in profile_data:
                    profile.emergency_contact_phone = profile_data["emergency_contact_phone"]
                if "allergies" in profile_data:
                    profile.allergies = profile_data["allergies"]
                if "current_medications" in profile_data:
                    profile.current_medications = profile_data["current_medications"]
                profile.save()
            except PatientProfile.DoesNotExist:
                pass
        
        elif user.is_doctor:
            try:
                profile = user.doctor_profile
                if "specialization" in profile_data:
                    profile.specialization = profile_data["specialization"]
                if "consultation_fee" in profile_data:
                    from decimal import Decimal
                    profile.consultation_fee = Decimal(profile_data["consultation_fee"])
                profile.save()
            except DoctorProfile.DoesNotExist:
                pass
        
        elif user.is_provider:
            try:
                profile = user.provider_profile
                if "name" in profile_data:
                    profile.name = profile_data["name"]
                if "address" in profile_data:
                    profile.address = profile_data["address"]
                profile.save()
            except ProviderProfile.DoesNotExist:
                pass
        
        return Response({"message": "Profile updated successfully"})


class ChangePasswordView(views.APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        
        if not current_password or not new_password:
            return Response(
                {"error": "Both current_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {"error": "New password must be at least 8 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Password changed successfully"})


# ============ Organization Management APIs ============

class OrganizationDoctorsView(views.APIView):
    """
    Manage doctors affiliated with a provider organization.
    Providers can list, add, and remove doctors.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List all doctors in the organization"""
        if not request.user.is_provider:
            return Response({"error": "Only providers can access this"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            provider = request.user.provider_profile
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        doctors = DoctorProfile.objects.filter(organization=provider)
        data = []
        for doc in doctors:
            data.append({
                'id': doc.id,
                'name': f"Dr. {doc.user.first_name} {doc.user.last_name}".strip() or doc.user.email,
                'email': doc.user.email,
                'specialization': doc.specialization,
                'hpr_id': doc.hpr_id,
                'consultation_fee': str(doc.consultation_fee),
            })
        
        return Response({"doctors": data})
    
    def post(self, request):
        """Add a doctor to the organization by HPR ID or email"""
        if not request.user.is_provider:
            return Response({"error": "Only providers can add doctors"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            provider = request.user.provider_profile
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        hpr_id = request.data.get('hpr_id')
        email = request.data.get('email')
        
        if not hpr_id and not email:
            return Response({"error": "Provide either hpr_id or email"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find doctor
        doctor = None
        if hpr_id:
            doctor = DoctorProfile.objects.filter(hpr_id=hpr_id).first()
        if not doctor and email:
            try:
                user = User.objects.get(email=email, type='DOCTOR')
                doctor = user.doctor_profile
            except (User.DoesNotExist, DoctorProfile.DoesNotExist):
                pass
        
        if not doctor:
            return Response({"error": "Doctor not found with provided HPR ID or email"}, status=status.HTTP_404_NOT_FOUND)
        
        if doctor.organization == provider:
            return Response({"message": "Doctor is already part of your organization"})
        
        if doctor.organization:
            return Response(
                {"error": f"Doctor is already affiliated with {doctor.organization.name}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add doctor to organization
        doctor.organization = provider
        doctor.save()
        
        return Response({
            "message": f"Dr. {doctor.user.first_name} {doctor.user.last_name} has been added to your organization",
            "doctor": {
                'id': doctor.id,
                'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}".strip(),
                'email': doctor.user.email,
                'specialization': doctor.specialization,
                'hpr_id': doctor.hpr_id,
            }
        }, status=status.HTTP_201_CREATED)
    
    def delete(self, request):
        """Remove a doctor from the organization"""
        if not request.user.is_provider:
            return Response({"error": "Only providers can remove doctors"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            provider = request.user.provider_profile
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        doctor_id = request.data.get('doctor_id')
        if not doctor_id:
            return Response({"error": "doctor_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id, organization=provider)
        except DoctorProfile.DoesNotExist:
            return Response({"error": "Doctor not found in your organization"}, status=status.HTTP_404_NOT_FOUND)
        
        doctor.organization = None
        doctor.save()
        
        return Response({"message": f"Doctor has been removed from your organization"})
