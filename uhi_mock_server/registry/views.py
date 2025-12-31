from rest_framework import views, status
from rest_framework.response import Response
from faker import Faker
import random
from datetime import datetime
from .models import MockAbhaRegistry, MockHealthProfessionalRegistry, MockHealthFacilityRegistry
from .serializers import (
    CreateAbhaSerializer, MockAbhaResponseSerializer,
    CreateHPRSerializer, MockHPRResponseSerializer,
    CreateHFRSerializer, MockHFRResponseSerializer
)

import uuid

fake = Faker('en_IN')  # Use Indian locale for realistic names

def create_fake_name():
    """Returns => (gender, first_name, last_name)"""
    gender = random.choice(['M', 'F'])
    first_name = ''
    last_name = ''
    if gender == 'M':
        first_name = fake.first_name_male()
        last_name = fake.last_name_male()
    else:
        first_name = fake.first_name_female()
        last_name = fake.last_name_female()
    
    return gender, first_name, last_name

class CreateAbhaView(views.APIView):
    """
    Simulates the ABDM creation flow.
    Generates a random identity based on the input mobile number.
    """
    def post(self, request):
        serializer = CreateAbhaSerializer(data=request.data)
        if serializer.is_valid():
            mobile = serializer.validated_data['mobile']
            aadhaar = serializer.validated_data.get('aadhaar', '')

            # Generate Fake Data
            gender, first_name, last_name = create_fake_name() 

            dob = fake.date_of_birth(minimum_age=18, maximum_age=80)
            
            # Generate ABHA Address (e.g. rajesh.kumar.1234@uhi)
            suffix = random.randint(1000, 9999)
            abha_address = f"{first_name}_{last_name}.{suffix}@uhi"

            # Save to Registry
            record, created = MockAbhaRegistry.objects.get_or_create(
                aadhaar_number = aadhaar,
                defaults = {
                'abha_address': abha_address,
                'first_name': first_name,
                'last_name': last_name,
                'gender': gender,
                'dob': dob,
                'mobile': mobile,}
            )
            if not created:
                return Response({"error": "ABHA Registration with given aadhaar already exists!"}, status=status.HTTP_400_BAD_REQUEST) 

            return Response(MockAbhaResponseSerializer(record).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class CreateHPRView(views.APIView):
    """
    Simulates HPR (Doctor) registration.
    """
    def post(self, request):
        serializer = CreateHPRSerializer(data=request.data)
        if serializer.is_valid():
            aadhaar = serializer.validated_data['aadhaar']
            mobile = serializer.validated_data['mobile']
            specialization = serializer.validated_data['specialization']

            # Generate Unique HPR ID
            hpr_id = "HPR-" + str(uuid.uuid4())
            
            # Fetch first_name, last_name
            gender, first_name, last_name = create_fake_name() 

            record, created = MockHealthProfessionalRegistry.objects.get_or_create(
                aadhaar=aadhaar,
                defaults={
                    'hpr_id': hpr_id,
                    'first_name': first_name,
                    'last_name': last_name,
                    'gender': gender,
                    'mobile': mobile,
                    'specialization': specialization,
                }
            )
            data = MockHPRResponseSerializer(record).data
            if not created:
                return Response({"error": "HPR Registration with give aadhaar already exists!"}, status=status.HTTP_400_BAD_REQUEST)

            # If created a new record, return the record
            return Response(data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateHFRView(views.APIView):
    """
    Simulates HFR (Facility) registration.
    """
    def post(self, request):
        serializer = CreateHFRSerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data['name']
            ftype = serializer.validated_data['type']
            address = serializer.validated_data['address']

            # Generate Unique HFR ID
            hfr_id = f"IN-{str(uuid.uuid4())[:8].upper()}"

            record = MockHealthFacilityRegistry.objects.create(
                hfr_id=hfr_id,
                name=name,
                type=ftype,
                address=address
            )
            return Response(MockHFRResponseSerializer(record).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
