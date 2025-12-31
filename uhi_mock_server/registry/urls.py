from django.urls import path
from .views import CreateAbhaView, CreateHPRView, CreateHFRView

urlpatterns = [
    path('v1/abha/create', CreateAbhaView.as_view(), name='create_abha'),
    path('v1/hpr/create', CreateHPRView.as_view(), name='create_hpr'),
    path('v1/hfr/create', CreateHFRView.as_view(), name='create_hfr'),
]
