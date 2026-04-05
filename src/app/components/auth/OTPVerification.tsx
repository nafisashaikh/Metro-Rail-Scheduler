import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { apiUrl } from '../../config/api';

interface OTPVerificationProps {
  userId: string;
  loginType: 'mobile' | 'email';
  identifier: string; // The mobile number or email for display
  devOtp?: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onBack?: () => void;
}

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

export function OTPVerification({
  userId,
  loginType,
  identifier,
  devOtp,
  onSuccess,
  onError,
  onBack,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the complete OTP');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/users/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess(result.token);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      onError?.(errorMessage);
      setOtp(''); // Clear OTP on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/users/resend-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend OTP');
      }

      if (result.devOtp) {
        setOtp(result.devOtp);
      }

      // Reset timer
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setOtp('');
      
      // Show success message briefly
      setError(null);
    } catch (err) {
      const errorMessage = formatFirebasePhoneAuthError(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>
          {success ? (
            <span className="text-green-600 font-medium">✓ Verification successful!</span>
          ) : (
            <>
              Enter the 6-digit code sent to your {loginType === 'mobile' ? 'mobile' : 'email'}
              <br />
              <span className="font-mono text-sm">{identifier}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OTP Input */}
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying || success}
          >
            <InputOTPGroup>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-muted-foreground">
                ⏱️ Code expires in{' '}
                <span className="font-mono font-semibold text-foreground">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-destructive font-medium">⏰ OTP expired</p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {devOtp && (
          <Alert>
            <AlertDescription>
              Development OTP: <span className="font-mono">{devOtp}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <AlertDescription className="text-green-700 dark:text-green-300">
              ✓ Verification successful! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Resend OTP Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendOTP}
            disabled={!canResend || isResending || success}
          >
            {isResending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Resending...
              </>
            ) : canResend ? (
              '↻ Resend OTP'
            ) : (
              `Resend available in ${formatTime(timeLeft)}`
            )}
          </Button>

          {/* Back Button */}
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBack}
              disabled={isVerifying || success}
            >
              ← Back to Registration
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Didn't receive the code? Check your spam folder or try resending.</p>
          <p>For security, OTPs expire after 5 minutes.</p>
        </div>
      </CardContent>
    </Card>
  );
}
