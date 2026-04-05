import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { SimpleCaptcha } from '../shared/SimpleCaptcha';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../../data/countryCodes';
import { apiUrl } from '../../config/api';

type LoginType = 'mobile' | 'email';

interface RegistrationFormData {
  loginType: LoginType;
  mobile?: string;
  countryCode?: string;
  email?: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

interface RegistrationFormProps {
  onSuccess: (payload: {
    userId: string;
    loginType: LoginType;
    identifier: string;
    devOtp?: string;
  }) => void;
  onError?: (error: string) => void;
}

export function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const [loginType, setLoginType] = useState<LoginType>('mobile');
  const [countryCode, setCountryCode] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [gender, setGender] = useState<
    'male' | 'female' | 'other' | 'prefer-not-to-say' | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    defaultValues: {
      loginType: 'mobile',
      countryCode: DEFAULT_COUNTRY_CODE,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!captchaVerified) {
      setError('Please complete the security check');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const normalizedAge = Number.isFinite(data.age) ? data.age : undefined;
      const payload = {
        loginType: loginType,
        ...(loginType === 'mobile'
          ? { mobile: data.mobile, countryCode: countryCode }
          : { email: data.email }),
        name: data.name,
        age: normalizedAge,
        gender,
      };

      const response = await fetch(apiUrl('/users/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        userId?: string;
        devOtp?: string;
        errors?: Array<{ message?: string }>;
      };

      if (!response.ok) {
        const firstValidationError = result.errors?.[0]?.message;
        throw new Error(firstValidationError || result.message || 'Registration failed');
      }

      const identifier =
        loginType === 'mobile' ? `${countryCode}${data.mobile?.trim() || ''}` : data.email?.trim() || '';

      onSuccess({
        userId: result.userId || '',
        loginType,
        identifier,
        devOtp: result.devOtp,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Register with your mobile number or email address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Login Type Selection */}
          <div className="space-y-3">
            <Label>Choose Registration Method</Label>
            <RadioGroup
              value={loginType}
              onValueChange={(value) => setLoginType(value as LoginType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="login-type-mobile" />
                <Label htmlFor="login-type-mobile" className="cursor-pointer font-normal">
                  📱 Mobile Number
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="login-type-email" />
                <Label htmlFor="login-type-email" className="cursor-pointer font-normal">
                  ✉️ Email Address
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mobile Number Input */}
          {loginType === 'mobile' && (
            <div className="space-y-2">
              <Label htmlFor="mobile-number">Mobile Number *</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="mobile-number"
                  type="tel"
                  placeholder="9876543210"
                  {...register('mobile', {
                    required: loginType === 'mobile' ? 'Mobile number is required' : false,
                    pattern: {
                      value: /^[0-9]{10,15}$/,
                      message: 'Enter a valid mobile number (10-15 digits)',
                    },
                  })}
                  className="flex-1"
                />
              </div>
              {errors.mobile && (
                <p className="text-sm text-destructive">{errors.mobile.message}</p>
              )}
            </div>
          )}

          {/* Email Input */}
          {loginType === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address *</Label>
              <Input
                id="email-address"
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: loginType === 'email' ? 'Email is required' : false,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Name must not exceed 100 characters',
                },
              })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Age Input */}
          <div className="space-y-2">
            <Label htmlFor="age">Age (Optional)</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              {...register('age', {
                min: {
                  value: 1,
                  message: 'Age must be at least 1',
                },
                max: {
                  value: 150,
                  message: 'Age must not exceed 150',
                },
                valueAsNumber: true,
              })}
            />
            {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender (Optional)</Label>
            <Select value={gender} onValueChange={(value) => setGender(value as typeof gender)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CAPTCHA */}
          <SimpleCaptcha
            onVerify={setCaptchaVerified}
            className="space-y-2"
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading || !captchaVerified}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending OTP...
              </>
            ) : (
              <>Send OTP</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By registering, you agree to our Terms of Service and Privacy Policy.
            <br />
            Your data will be encrypted and stored securely.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
