from django.urls import path
from .views import (
    JourneyListCreateView, JourneyDetailView, JourneyStepCreateView,
    RequestAccessByAbhaView, PatientConsentListView, ConsentRespondView,
    FetchJourneysByAbhaView
)

urlpatterns = [
    # Journey CRUD
    path('', JourneyListCreateView.as_view(), name='journey_list_create'),
    path('<int:pk>/', JourneyDetailView.as_view(), name='journey_detail'),
    path('steps/', JourneyStepCreateView.as_view(), name='journey_step_create'),
    
    # Cross-Org Access APIs
    path('request-access/', RequestAccessByAbhaView.as_view(), name='request_access'),
    path('my-consents/', PatientConsentListView.as_view(), name='patient_consents'),
    path('consent/<int:consent_id>/respond/', ConsentRespondView.as_view(), name='consent_respond'),
    path('by-abha/<str:abha_id>/', FetchJourneysByAbhaView.as_view(), name='fetch_by_abha'),
]
