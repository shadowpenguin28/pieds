from django.urls import path
from .views import (
    JourneyListCreateView, JourneyDetailView, JourneyStepCreateView,
    RequestAccessByAbhaView, PatientConsentListView, ConsentRespondView,
    FetchJourneysByAbhaView, ReportUploadView, ReportDownloadView,
    OrderTestView, WritePrescriptionView
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
    
    # Lab Reports
    path('steps/<int:step_id>/report/', ReportUploadView.as_view(), name='report_upload'),
    path('steps/<int:step_id>/report/download/', ReportDownloadView.as_view(), name='report_download'),
    
    # Doctor Actions
    path('order-test/', OrderTestView.as_view(), name='order_test'),
    path('prescribe/', WritePrescriptionView.as_view(), name='write_prescription'),
]

