from django.urls import path
from .views import (
    AppointmentListCreateView, AppointmentDetailView,
    StartAppointmentView, CompleteAppointmentView, CancelAppointmentView,
    DoctorQueueView, WaitTimeView
)

urlpatterns = [
    # Appointment CRUD
    path('', AppointmentListCreateView.as_view(), name='appointment_list_create'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment_detail'),
    
    # Actions
    path('<int:pk>/start/', StartAppointmentView.as_view(), name='appointment_start'),
    path('<int:pk>/complete/', CompleteAppointmentView.as_view(), name='appointment_complete'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='appointment_cancel'),
    
    # Queue and Wait Time
    path('queue/doctor/<int:doctor_id>/', DoctorQueueView.as_view(), name='doctor_queue'),
    path('<int:pk>/wait-time/', WaitTimeView.as_view(), name='appointment_wait_time'),
]
