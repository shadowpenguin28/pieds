from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import PatientProfile, DoctorProfile, ProviderProfile, User
from .serializers import PatientRegistrationSerializer, DoctorRegistrationSerializer, ProviderRegistrationSerializer

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
