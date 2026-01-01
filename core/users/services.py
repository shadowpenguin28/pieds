import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError

UHI_MOCK_URL = "http://localhost:8001"  # Assuming Mock Server runs on 8001

class UHIClient:
    """
    Client to interact with the UHI Mock Service.
    """
    
    @staticmethod
    def create_abha(phone_number, aadhaar):
        url = f"{UHI_MOCK_URL}/v1/abha/create"
        payload = {"phone_number": phone_number, "aadhaar": aadhaar}
        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise ValidationError(f"Failed to create ABHA: {str(e)}")

    @staticmethod
    def create_hpr(aadhar, specialization, phone_number):
        url = f"{UHI_MOCK_URL}/v1/hpr/create"
        payload = {
            "specialization": specialization,
            "aadhaar": aadhar,
            "phone_number": phone_number
        }
        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise ValidationError(f"Failed to create HPR ID: {str(e)}")

    @staticmethod
    def create_hfr(name, type, address, phone_number):
        url = f"{UHI_MOCK_URL}/v1/hfr/create"
        payload = {
            "name": name, 
            "type": type, 
            "address": address,
            "phone_number": phone_number
        }
        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise ValidationError(f"Failed to create HFR ID: {str(e)}")
