import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { apiUrl } from '../../config/api';

interface UserProfile {
  id: string;
  mobile: string | null;
  countryCode: string | null;
  email: string | null;
  name: string;
  age: number | null;
  gender: string | null;
  loginType: 'mobile' | 'email';
  createdAt: string;
}

interface UserProfileFormData {
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

interface UserProfilePageProps {
  token: string;
  onLogout?: () => void;
}

export function UserProfilePage({ token, onLogout }: UserProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserProfileFormData>();

  const selectedGender = watch('gender');

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/users/profile'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch profile');
      }

      setProfile(result.user);
      reset({
        name: result.user.name,
        age: result.user.age || undefined,
        gender: result.user.gender || undefined,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserProfileFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(apiUrl('/users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile(); // Refresh profile data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      reset({
        name: profile.name,
        age: profile.age || undefined,
        gender: profile.gender || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && !profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchProfile} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              {isEditing ? 'Update your personal information' : 'View your account details'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </Button>
            )}
            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                🚪 Logout
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information (Read-only) */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Login Method</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <span className="text-sm">
                    {profile.loginType === 'mobile' ? '📱 Mobile' : '✉️ Email'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  {profile.loginType === 'mobile' ? 'Mobile Number' : 'Email Address'}
                </Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <span className="text-sm font-mono">
                    {profile.loginType === 'mobile'
                      ? `${profile.countryCode} ${profile.mobile}`
                      : profile.email}
                  </span>
                  <span className="ml-auto text-xs text-green-600">✓ Verified</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">User ID</Label>
                <div className="p-2 bg-muted/50 rounded-md">
                  <span className="text-sm font-mono">{profile.id}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Member Since</Label>
                <div className="p-2 bg-muted/50 rounded-md">
                  <span className="text-sm">
                    {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Personal Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                disabled={!isEditing}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  {...register('age', {
                    min: { value: 1, message: 'Invalid age' },
                    max: { value: 150, message: 'Invalid age' },
                    valueAsNumber: true,
                  })}
                  disabled={!isEditing}
                />
                {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={selectedGender}
                  onValueChange={(value) =>
                    setValue('gender', value as UserProfileFormData['gender'], { shouldDirty: true })
                  }
                  disabled={!isEditing}
                >
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
            </div>
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-green-700 dark:text-green-300">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Data Security Notice */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <span className="text-blue-600 dark:text-blue-400">🔒</span>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your personal data is encrypted with AES-256 encryption and stored securely.
                We never share your information with third parties.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
