import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError

UHI_MOCK_URL = "http://localhost:8001"  # Assuming Mock Server runs on 8001

class UHIClient:
    """
    Client to interact with the UHI Mock Service.
    """
    
    @staticmethod
    def create_abha(mobile, aadhaar):
        url = f"{UHI_MOCK_URL}/v1/abha/create"
        payload = {"mobile": mobile, "aadhaar": aadhaar}
        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            # Try to parse the error message from the mock server
            try:
                error_msg = response.json().get("error", str(e))
            except:
                error_msg = str(e)
            raise ValidationError(f"Failed to create ABHA: {error_msg}")
        except requests.RequestException as e:
            raise ValidationError(f"Failed to create ABHA: {str(e)}")

    @staticmethod
    def create_hpr(name, aadhar, specialization):
        url = f"{UHI_MOCK_URL}/v1/hpr/create"
        payload = {
            "aadhar": aadhar, 
            "specialization": specialization
        }
        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            try:
                error_msg = response.json().get("error", str(e))
            except:
                error_msg = str(e)
            raise ValidationError(f"Failed to create HPR ID: {error_msg}")
        except requests.RequestException as e:
            raise ValidationError(f"Failed to create HPR ID: {str(e)}")

    @staticmethod
    def create_hfr(name, type, address):
        url = f"{UHI_MOCK_URL}/v1/hfr/create"
        payload = {
            "name": name, 
            "type": type, 
            "address": address
        }
        try:
            response = requests.post(url, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            try:
                error_msg = response.json().get("error", str(e))
            except:
                error_msg = str(e)
            raise ValidationError(f"Failed to create HFR ID: {error_msg}")
        except requests.RequestException as e:
            raise ValidationError(f"Failed to create HFR ID: {str(e)}")
