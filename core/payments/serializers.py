from rest_framework import serializers
from .models import Wallet, Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for transaction history"""
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'reason', 'appointment', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for wallet balance"""
    recent_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'created_at', 'updated_at', 'recent_transactions']
        read_only_fields = ['id', 'balance', 'created_at', 'updated_at']
    
    def get_recent_transactions(self, obj):
        recent = obj.transactions.all()[:5]
        return TransactionSerializer(recent, many=True).data


class TopUpSerializer(serializers.Serializer):
    """Serializer for wallet top-up"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value


class PaymentSerializer(serializers.Serializer):
    """Serializer for appointment payment"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
