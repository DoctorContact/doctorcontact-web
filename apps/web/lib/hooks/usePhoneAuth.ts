"use client";

import { useCallback, useRef, useState } from "react";
import { signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { firebaseAuth, RecaptchaVerifier } from "@/lib/firebase";

type Step = "enter-phone" | "enter-otp";

// Normalizes a bare 10-digit Indian number to E.164 (+91...) the same way
// the backend's phoneNormalizer does, so what Firebase sends and what the
// backend later verifies always agree.
function toE164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export function usePhoneAuth() {
  const [step, setStep] = useState<Step>("enter-phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<InstanceType<typeof RecaptchaVerifier> | null>(null);

  const ensureRecaptcha = useCallback((containerId: string) => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, containerId, {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  }, []);

  const sendOtp = useCallback(
    async (rawPhone: string, recaptchaContainerId: string) => {
      setError(null);
      setLoading(true);
      try {
        const e164 = toE164(rawPhone);
        const verifier = ensureRecaptcha(recaptchaContainerId);
        const confirmation = await signInWithPhoneNumber(firebaseAuth, e164, verifier);
        confirmationRef.current = confirmation;
        setPhone(e164);
        setStep("enter-otp");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not send OTP. Please try again.";
        setError(message);
        // A failed attempt can leave the invisible reCAPTCHA in a bad state —
        // drop it so the next attempt gets a fresh one instead of silently failing forever.
        recaptchaRef.current?.clear();
        recaptchaRef.current = null;
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureRecaptcha]
  );

  const confirmOtp = useCallback(async (code: string) => {
    if (!confirmationRef.current) {
      throw new Error("Please request an OTP first.");
    }
    setError(null);
    setLoading(true);
    try {
      const credential = await confirmationRef.current.confirm(code);
      const idToken = await credential.user.getIdToken();
      return idToken;
    } catch (err) {
      const message = err instanceof Error ? err.message : "That code didn't match. Please try again.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStep("enter-phone");
    setPhone("");
    setError(null);
    confirmationRef.current = null;
  }, []);

  return { step, phone, loading, error, sendOtp, confirmOtp, reset };
}
