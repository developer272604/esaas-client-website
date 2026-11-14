"use client";
import { useState } from 'react';
import Image from 'next/image';
import { adapters, DEMO_OTP } from '@/lib/adapters';
import { PHONE_RE } from '@/lib/validation';
import { useAuthStore } from '@/store/auth';
import { useCheckoutStore } from '@/store/checkout';
import { useUiStore } from '@/store/ui';
import { Modal } from '@/components/common/Modal';
import Link from '@/components/common/Link';
import { useCatalog } from '@/lib/hooks';
import { ArrowRight, ChartNoAxesColumnIncreasing, Leaf, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react';

/** Phone and OTP sign-in. A modal only, never a page. */
export function AuthModal() {
  const { template } = useCatalog();
  const close = useUiStore((s) => s.closeModal);
  const signIn = useAuthStore((s) => s.signIn);
  const form = useCheckoutStore((s) => s.form);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [name, setName] = useState(form.name);
  const [phone, setPhone] = useState(form.phone);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (name.trim().length < 2) return setErr('Enter your name.');
    if (!PHONE_RE.test(phone)) return setErr('Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');
    setBusy(true);
    const r = await adapters.auth.sendOtp(phone);
    setBusy(false);
    if (!r.ok) return setErr(r.error ?? 'We could not send the OTP. Try again.');
    setErr('');
    setStep('otp');
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) return setErr('Enter the 6-digit OTP.');
    setBusy(true);
    const r = await adapters.auth.verifyOtp({ name, phone, otp });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    signIn(r.user);
    const resume = useUiStore.getState().afterAuth;
    useUiStore.setState({ modal: null, afterAuth: null });
    useUiStore.getState().showToast(`Signed in as ${r.user.name}`);
    resume?.();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busy) void (step === 'phone' ? send() : verify());
  };

  return (
    <Modal title="Sign in" onClose={close} wide className="auth-modal">
      <div className="auth-layout">
        <section className="auth-panel">
          <Link className="auth-brand" href="/" aria-label={`${template.name} home`}>
            <span className="auth-brand-mark">{template.logo}</span>
            <span>{template.name}</span>
          </Link>
          <div className="auth-heading">
            <span className="auth-kicker">{step === 'phone' ? 'Welcome back' : 'One more step'}</span>
            <h2>{step === 'phone' ? 'Sign in to your account' : 'Verify your number'}</h2>
            <p>{step === 'phone' ? 'Enter your details to continue.' : `Enter the code sent to +91 ${phone}. Demo code: ${DEMO_OTP}.`}</p>
          </div>
          <form onSubmit={submit} noValidate className="auth-form">
            {step === 'phone' ? (
              <>
                <div className="auth-field">
                  <label htmlFor="auth-name">Name</label>
                  <input id="auth-name" data-autofocus value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-phone">Mobile number</label>
                  <div className="auth-phone-input">
                    <span aria-hidden="true">+91</span>
                    <input id="auth-phone" value={phone} maxLength={10} inputMode="numeric" autoComplete="tel-national" onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" />
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-field">
                <label htmlFor="auth-otp">6-digit sign-in code</label>
                <input id="auth-otp" data-autofocus value={otp} maxLength={6} inputMode="numeric" autoComplete="one-time-code" onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Enter code" />
              </div>
            )}
            {err && <div className="er" role="alert">{err}</div>}
            <button type="submit" className="btn block auth-submit" disabled={busy}>
              {busy ? 'Please wait...' : step === 'phone' ? 'Send sign-in code' : 'Verify and sign in'}
              {!busy && <ArrowRight aria-hidden="true" size={17} />}
            </button>
            {step === 'otp' && (
              <button
                type="button"
                className="auth-change"
                onClick={() => {
                  setStep('phone');
                  setErr('');
                }}
              >
                Change mobile number
              </button>
            )}
            <p className="auth-legal">By continuing, you agree to the store’s terms and privacy policy.</p>
          </form>
        </section>
        <aside className="auth-visual" aria-hidden="true">
          <div className="auth-visual-top"><span>YOUR STORE</span><span>{template.name}</span></div>
          <div className="auth-art-frame">
            <Image src="/images/tour-guide.png" alt="" fill sizes="(max-width: 720px) 80vw, 320px" />
            <span className="auth-float auth-float-bag"><ShoppingBag /></span>
            <span className="auth-float auth-float-leaf"><Leaf /></span>
            <span className="auth-float auth-float-chart"><ChartNoAxesColumnIncreasing /></span>
            <span className="auth-float auth-float-sparkle"><Sparkles /></span>
            <span className="auth-float auth-float-package"><PackageCheck /></span>
          </div>
          <div className="auth-visual-bottom"><span>SHOP WITH CONFIDENCE</span><span className="auth-visual-dots"><i /><i /><i /></span></div>
        </aside>
      </div>
    </Modal>
  );
}
