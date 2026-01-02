from django.db import models
from django.conf import settings
from decimal import Decimal


TRANSACTION_TYPES = (
    ("CREDIT", "Credit"),
    ("DEBIT", "Debit"),
)

TRANSACTION_REASONS = (
    ("TOP_UP", "Wallet Top Up"),
    ("PAYMENT_DONE", "Payment done by user"),
    ("PAYMENT_RECEIVED", "Payment Received by user"),
    ("REFUND", "Refund"),
    ("WITHDRAWAL", "Withdrawal"),
)


class Wallet(models.Model):
    """Virtual wallet for all users (patients, doctors, providers)"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wallet"
    )
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet: {self.user.email} (₹{self.balance})"
    
    def credit(self, amount, reason, appointment=None, description=""):
        """Add money to wallet"""
        amount = Decimal(str(amount))
        self.balance += amount
        self.save()
        return Transaction.objects.create(
            wallet=self,
            amount=amount,
            type="CREDIT",
            reason=reason,
            appointment=appointment,
            description=description
        )
    
    def debit(self, amount, reason, appointment=None, description=""):
        """Remove money from wallet"""
        amount = Decimal(str(amount))
        if self.balance < amount:
            raise ValueError("Insufficient balance")
        self.balance -= amount
        self.save()
        return Transaction.objects.create(
            wallet=self,
            amount=amount,
            type="DEBIT",
            reason=reason,
            appointment=appointment,
            description=description
        )


class Transaction(models.Model):
    """Record of all wallet transactions"""
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    reason = models.CharField(max_length=30, choices=TRANSACTION_REASONS)
    appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions"
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} ₹{self.amount} - {self.reason}"
