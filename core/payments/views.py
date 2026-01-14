from rest_framework import views, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import Wallet, Transaction, COMMISSION_RATE
from .serializers import WalletSerializer, TransactionSerializer, TopUpSerializer, PaymentSerializer
from appointments.models import Appointment


class WalletView(views.APIView):
    """Get current user's wallet balance"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class TopUpView(views.APIView):
    """Add money to wallet (mock for demo)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        transaction = wallet.credit(
            amount=amount,
            reason="TOP_UP",
            description="Wallet top-up"
        )
        
        return Response({
            "message": f"₹{amount} added to wallet",
            "new_balance": wallet.balance,
            "transaction": TransactionSerializer(transaction).data
        })


class TransactionListView(generics.ListAPIView):
    """Get transaction history"""
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        wallet, _ = Wallet.objects.get_or_create(user=self.request.user)
        return wallet.transactions.all()


class AppointmentPaymentView(views.APIView):
    """Pay for an appointment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        
        # Verify patient is paying for their own appointment
        if not request.user.is_patient:
            return Response({"error": "Only patients can pay for appointments"}, status=status.HTTP_403_FORBIDDEN)
        
        if appointment.patient.user != request.user:
            return Response({"error": "This is not your appointment"}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already paid (check for existing payment transaction)
        existing_payment = Transaction.objects.filter(
            appointment=appointment,
            reason="PAYMENT_DONE"
        ).exists()
        if existing_payment:
            return Response({"error": "Appointment already paid"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get amount from doctor's consultation fee
        amount = appointment.doctor.consultation_fee
        if amount <= 0:
            return Response({"error": "Doctor has no consultation fee set"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate commission (5% on top of consultation fee)
        commission = (amount * COMMISSION_RATE).quantize(Decimal("0.01"))
        total_amount = amount + commission
        
        # Get patient wallet
        patient_wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        # Check balance (must cover consultation fee + commission)
        if patient_wallet.balance < total_amount:
            return Response({
                "error": "Insufficient balance",
                "required": str(total_amount),
                "available": str(patient_wallet.balance)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Debit total from patient (consultation fee + commission)
        patient_wallet.debit(
            amount=total_amount,
            reason="PAYMENT_DONE",
            appointment=appointment,
            description=f"Payment for appointment with Dr. {appointment.doctor.user.first_name} (includes ₹{commission} platform fee)"
        )
        
        # Credit full consultation fee to doctor
        doctor_wallet, _ = Wallet.objects.get_or_create(user=appointment.doctor.user)
        doctor_wallet.credit(
            amount=amount,
            reason="PAYMENT_RECEIVED",
            appointment=appointment,
            description=f"Payment received from {appointment.patient.user.first_name}"
        )
        

        
        # Mark appointment as paid
        appointment.is_paid = True
        appointment.save()
        
        return Response({
            "message": "Payment successful",
            "consultation_fee": str(amount),
            "platform_fee": str(commission),
            "total_paid": str(total_amount),
            "patient_new_balance": str(patient_wallet.balance)
        })


class AppointmentRefundView(views.APIView):
    """Refund for cancelled appointment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        
        # Only cancelled appointments can be refunded
        if appointment.status != "CANCELLED":
            return Response({"error": "Only cancelled appointments can be refunded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if payment exists
        payment = Transaction.objects.filter(
            appointment=appointment,
            reason="PAYMENT_DONE"
        ).first()
        
        if not payment:
            return Response({"error": "No payment found for this appointment"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already refunded
        refund_exists = Transaction.objects.filter(
            appointment=appointment,
            reason="REFUND"
        ).exists()
        
        if refund_exists:
            return Response({"error": "Refund already processed"}, status=status.HTTP_400_BAD_REQUEST)
        
        amount = payment.amount
        
        # Credit back to patient
        patient_wallet = Wallet.objects.get(user=appointment.patient.user)
        patient_wallet.credit(
            amount=amount,
            reason="REFUND",
            appointment=appointment,
            description=f"Refund for cancelled appointment"
        )
        
        # Debit from doctor
        doctor_wallet = Wallet.objects.get(user=appointment.doctor.user)
        doctor_wallet.debit(
            amount=amount,
            reason="REFUND",
            appointment=appointment,
            description=f"Refund for cancelled appointment"
        )
        
        return Response({
            "message": "Refund processed",
            "amount": str(amount),
            "patient_new_balance": str(patient_wallet.balance)
        })
