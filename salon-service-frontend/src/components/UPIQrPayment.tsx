import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, QrCode } from 'lucide-react';

interface UPIQrPaymentProps {
  bookingId: number;
  totalPrice: number; // in INR
  paymentLinkId: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const UPIQrPayment: React.FC<UPIQrPaymentProps> = ({
  bookingId,
  totalPrice,
  paymentLinkId,
  onPaymentSuccess,
  onCancel
}) => {
  const { showToast } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [verifying, setVerifying] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      showToast("Payment window expired. Please try booking again.", "warning");
      onCancel();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel, showToast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmPayment = async () => {
    setVerifying(true);
    try {
      // Simulate verification api call
      const verified = await apiRequest(`/api/payments/proceed?paymentLinkId=${paymentLinkId}&paymentId=mock`, {
        method: "PATCH"
      });
      
      if (verified) {
        showToast("Payment verified successfully! Reservation confirmed.", "success");
        onPaymentSuccess();
      } else {
        showToast("Failed to verify payment. Please try again.", "danger");
      }
    } catch (e: any) {
      showToast(e.message || "Verification failed", "danger");
    } finally {
      setVerifying(false);
    }
  };

  // Dynamic scannable UPI string format
  const upiUrl = `upi://pay?pa=aura.pay@icici&pn=AURA%20Salon&am=${totalPrice}&cu=INR&tn=RSV-${bookingId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="upi-payment-panel text-center" style={{ padding: '20px 10px' }}>
      <h3 className="gold-text playfair" style={{ fontSize: '24px', marginBottom: '8px' }}>Scan & Pay via UPI</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Complete payment to confirm your booking at AURA
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <div style={{ display: 'inline-block', padding: '10px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <img 
            src={qrImageUrl} 
            alt="Scan to Pay" 
            style={{ display: 'block', width: '200px', height: '200px', borderRadius: '4px' }}
          />
        </div>
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <QrCode size={14} className="gold-text" />
          <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>BHIM / PhonePe / Paytm / GPay</span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-md)', padding: '16px', margin: '20px 0', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Amount to Pay:</span>
          <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>₹{totalPrice}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>UPI ID:</span>
          <span style={{ fontFamily: 'monospace' }}>aura.pay@icici</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Reference ID:</span>
          <span>RSV-{bookingId}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', color: 'var(--color-warning)', fontSize: '13px' }}>
        <AlertCircle size={16} />
        <span>Expires in: <strong style={{ fontSize: '14px' }}>{formatTime(timeLeft)}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button className="btn btn-secondary w-full" onClick={onCancel} disabled={verifying}>
          Cancel
        </button>
        <button className="btn btn-gold w-full" onClick={handleConfirmPayment} disabled={verifying}>
          {verifying ? "Verifying..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};
