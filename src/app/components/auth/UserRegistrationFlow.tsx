import { useState } from 'react';
import { RegistrationForm } from './RegistrationForm';
import { OTPVerification } from './OTPVerification';
import { UserProfilePage } from './UserProfilePage';

type AuthStep = 'registration' | 'otp-verification' | 'profile';

interface UserRegistrationFlowProps {
  onComplete?: (token: string) => void;
}

export function UserRegistrationFlow({ onComplete }: UserRegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('registration');
  const [userId, setUserId] = useState<string>('');
  const [loginType, setLoginType] = useState<'mobile' | 'email'>('mobile');
  const [identifier, setIdentifier] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [authToken, setAuthToken] = useState<string>('');

  const handleRegistrationSuccess = (payload: {
    userId: string;
    loginType: 'mobile' | 'email';
    identifier: string;
    devOtp?: string;
  }) => {
    setUserId(payload.userId);
    setLoginType(payload.loginType);
    setIdentifier(payload.identifier);
    setDevOtp(payload.devOtp);
    setCurrentStep('otp-verification');
  };

  const handleOTPSuccess = (token: string) => {
    setAuthToken(token);
    setCurrentStep('profile');
    onComplete?.(token);
  };

  const handleLogout = () => {
    setCurrentStep('registration');
    setUserId('');
    setAuthToken('');
    setIdentifier('');
    setDevOtp(undefined);
  };

  const handleBackToRegistration = () => {
    setCurrentStep('registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'registration'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                {currentStep === 'registration' ? '1' : '✓'}
              </div>
              <span className="ml-2 text-sm font-medium">Register</span>
            </div>

            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600">
              <div
                className={`h-full bg-blue-600 transition-all ${
                  currentStep !== 'registration' ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'otp-verification'
                    ? 'bg-blue-600 text-white'
                    : currentStep === 'profile'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {currentStep === 'profile' ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Verify OTP</span>
            </div>

            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600">
              <div
                className={`h-full bg-blue-600 transition-all ${
                  currentStep === 'profile' ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm font-medium">Profile</span>
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        {currentStep === 'registration' && (
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onError={(error) => console.error('Registration error:', error)}
          />
        )}

        {currentStep === 'otp-verification' && (
          <OTPVerification
            userId={userId}
            loginType={loginType}
            identifier={identifier || (loginType === 'mobile' ? 'your mobile' : 'your email')}
            devOtp={devOtp}
            onSuccess={handleOTPSuccess}
            onError={(error) => console.error('OTP error:', error)}
            onBack={handleBackToRegistration}
          />
        )}

        {currentStep === 'profile' && authToken && (
          <UserProfilePage token={authToken} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}
