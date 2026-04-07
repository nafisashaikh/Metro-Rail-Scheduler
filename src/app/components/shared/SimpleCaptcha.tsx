import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
  className?: string;
}

/**
 * Simple Math-based CAPTCHA
 * For production, replace with Google reCAPTCHA or hCaptcha
 */
export function SimpleCaptcha({ onVerify, className }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  const handleVerify = () => {
    const correctAnswer = num1 + num2;
    const verified = parseInt(userAnswer) === correctAnswer;
    setIsVerified(verified);
    onVerify(verified);

    if (!verified) {
      // Generate new challenge on failure
      setTimeout(generateChallenge, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="captcha">Security Check *</Label>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <span className="text-lg font-mono font-bold">{num1}</span>
          <span className="text-lg">+</span>
          <span className="text-lg font-mono font-bold">{num2}</span>
          <span className="text-lg">=</span>
        </div>

        <Input
          id="captcha"
          type="number"
          placeholder="?"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isVerified}
          className="w-20"
        />

        {!isVerified && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVerify}
            disabled={!userAnswer}
          >
            Verify
          </Button>
        )}

        {isVerified && <span className="text-green-600 font-medium">✓ Verified</span>}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateChallenge}
          title="New challenge"
        >
          ↻
        </Button>
      </div>
      {!isVerified && userAnswer && (
        <p className="text-xs text-muted-foreground mt-1">Enter the result to continue</p>
      )}
    </div>
  );
}

/**
 * Google reCAPTCHA v2 Integration (for production)
 *
 * Usage:
 * 1. Get site key from https://www.google.com/recaptcha/admin
 * 2. Install: npm install react-google-recaptcha @types/react-google-recaptcha
 * 3. Use GoogleReCaptcha component below
 */

/*
import ReCAPTCHA from 'react-google-recaptcha';

interface GoogleReCaptchaProps {
  onVerify: (token: string | null) => void;
  siteKey: string;
}

export function GoogleReCaptcha({ onVerify, siteKey }: GoogleReCaptchaProps) {
  return (
    <div>
      <Label>Security Check *</Label>
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={onVerify}
        theme="light"
      />
    </div>
  );
}
*/
