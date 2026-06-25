import { useState, useEffect, useRef } from 'react';
import api from '@/shared/utils/api';

const RESEND_COOLDOWN = 60; // seconds

export default function EmailVerifyStep({ accountType, onVerified, onBack }) {
  // ── Phase: 'email' | 'code' ──────────────────────────────────────────────
  const [phase, setPhase]           = useState('email');
  const [email, setEmail]           = useState('');
  const [digits, setDigits]         = useState(['', '', '', '', '', '']);
  const [error, setError]           = useState('');
  const [info, setInfo]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [cooldown, setCooldown]     = useState(0);
  const inputRefs                   = useRef([]);
  const timerRef                    = useRef(null);

  const accent      = accountType === 'provider' ? 'border-pink-500'   : 'border-purple-500';
  const btnClass    = accountType === 'provider'
    ? 'bg-pink-600 hover:bg-pink-500 disabled:opacity-50'
    : 'bg-purple-600 hover:bg-purple-500 disabled:opacity-50';
  const linkClass   = accountType === 'provider' ? 'text-pink-400' : 'text-purple-400';

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  // ── Send code ─────────────────────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e?.preventDefault();
    setError('');
    setInfo('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/email-verify/send', { email: trimmed });
      setInfo(data.message || 'Code sent — check your inbox.');
      setCooldown(RESEND_COOLDOWN);
      setPhase('code');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to send code.';
      const waitSecs = err?.response?.data?.retryAfterSeconds;
      if (waitSecs) setCooldown(waitSecs);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Digit input handling ──────────────────────────────────────────────────
  const handleDigit = (i, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    setError('');
    if (char && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Confirm code ──────────────────────────────────────────────────────────
  const handleConfirm = async (e) => {
    e?.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/email-verify/confirm', {
        email: email.trim().toLowerCase(),
        code,
      });
      onVerified({ email: data.email, verificationToken: data.verificationToken });
    } catch (err) {
      setError(err?.response?.data?.error || 'Incorrect code.');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const codeComplete = digits.every((d) => d !== '');

  return (
    <div className="signup-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className={`bg-gray-300 text-center rounded-lg w-full max-w-sm p-6 mx-auto form-bg border-t-4 ${accent}`}>

        {/* Header */}
        <h1 className="text-black text-2xl font-bold mb-1">Verify Your Email</h1>
        <p className="text-gray-600 text-sm mb-5">
          {phase === 'email'
            ? 'Enter the email you want to register with. We\'ll send a 6-digit code.'
            : `We sent a code to ${email}. Enter it below.`}
        </p>

        {/* ── Phase: enter email ── */}
        {phase === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="border-2 border-pink-600 px-3 py-2 text-base text-black bg-white placeholder-gray-500 rounded-lg w-full"
              autoFocus
              autoComplete="email"
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-white font-semibold transition-colors ${btnClass}`}
            >
              {loading ? 'Sending…' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* ── Phase: enter code ── */}
        {phase === 'code' && (
          <form onSubmit={handleConfirm} className="space-y-4">
            {info && <p className="text-green-700 text-sm bg-green-50 rounded-lg px-3 py-2">{info}</p>}

            {/* 6-digit split inputs */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-10 h-12 text-center text-xl font-bold border-2 border-pink-500 rounded-lg bg-white text-black focus:border-pink-600 focus:outline-none"
                />
              ))}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !codeComplete}
              className={`w-full py-2.5 rounded-lg text-white font-semibold transition-colors ${btnClass}`}
            >
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>

            {/* Resend */}
            <div className="text-sm text-gray-600">
              {cooldown > 0 ? (
                <span>Resend in <strong>{cooldown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className={`font-medium underline ${linkClass} disabled:opacity-50`}
                >
                  Resend code
                </button>
              )}
            </div>

            {/* Change email */}
            <button
              type="button"
              onClick={() => { setPhase('email'); setError(''); setInfo(''); }}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {/* Back to account type */}
        <button
          type="button"
          onClick={onBack}
          className="mt-5 text-sm text-gray-600 underline hover:text-gray-900"
        >
          ← Change account type
        </button>
      </div>
    </div>
  );
}
