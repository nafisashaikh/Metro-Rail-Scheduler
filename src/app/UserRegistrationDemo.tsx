import { UserRegistrationFlow } from './components/auth';

/**
 * User Registration Demo Page
 * 
 * This page demonstrates the complete user registration flow with:
 * - Mobile or Email registration
 * - OTP verification
 * - User profile management
 * - Encrypted data storage
 */
export function UserRegistrationDemo() {
  const handleComplete = (token: string) => {
    console.log('✅ Registration completed successfully!');
    console.log('🔑 JWT Token:', token);
    
    // In production, you would:
    // 1. Store token in localStorage or secure storage
    // 2. Redirect to dashboard
    // 3. Initialize user session
    
    localStorage.setItem('authToken', token);
  };

  return (
    <div className="min-h-screen">
      <UserRegistrationFlow onComplete={handleComplete} />
    </div>
  );
}
