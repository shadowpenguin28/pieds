from django.urls import path
from .views import (
    WalletView, TopUpView, TransactionListView,
    AppointmentPaymentView, AppointmentRefundView
)

urlpatterns = [
    path('', WalletView.as_view(), name='wallet'),
    path('topup/', TopUpView.as_view(), name='wallet_topup'),
    path('transactions/', TransactionListView.as_view(), name='wallet_transactions'),
    path('appointments/<int:pk>/pay/', AppointmentPaymentView.as_view(), name='appointment_pay'),
    path('appointments/<int:pk>/refund/', AppointmentRefundView.as_view(), name='appointment_refund'),
]
