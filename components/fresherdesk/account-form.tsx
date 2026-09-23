"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loginAction, signupAction, type AuthState } from "@/app/actions/auth";

export function AccountForm({ signup = false }: { signup?: boolean }) {
  const [visible, setVisible] = useState(false);
  const action = signup ? signupAction : loginAction;
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    action,
    {}
  );

  return (
    <main className="account-page container">
      <div className="account-story">
        <span className="eyebrow">A FUTURE WORTH BUILDING</span>
        <h1>{signup ? "Your next chapter starts here." : "Good to see you again."}</h1>
        <p>
          Learn something new. Build something meaningful. Take one more step toward your future.
        </p>
        <div className="account-story-icon">
          <GraduationCap size={65} strokeWidth={1.2} />
        </div>
      </div>
      <section className="account-card">
        <h2>{signup ? "Create your account" : "Welcome back"}</h2>
        <p>
          {signup
            ? "Start your learning journey with FresherDesk."
            : "Sign in to manage your opportunities, leads, or applications."}
        </p>

        {state?.error && (
          <div className="flex items-center gap-2 p-3 my-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            <AlertCircle size={18} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction}>
          {signup && (
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                required
                placeholder="Your name"
                disabled={isPending}
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <Input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              required
              placeholder="you@example.com"
              disabled={isPending}
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <Input
                id="password"
                name="password"
                autoComplete={signup ? "new-password" : "current-password"}
                type={visible ? "text" : "password"}
                required
                placeholder="Enter your password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="button button-green w-full" type="submit" disabled={isPending}>
            {isPending
              ? signup
                ? "Creating account..."
                : "Signing in..."
              : signup
              ? "Create account"
              : "Log in"}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Demo Credentials:</p>
          <p>👑 Admin: <code>admin@fresherdesk.com</code> (Pass: <code>Admin@123456</code>)</p>
          <p>💼 Recruiter: <code>recruiter@fresherdesk.com</code> (Pass: <code>Recruiter@123456</code>)</p>
        </div>

        <p className="account-switch" style={{ marginTop: "20px" }}>
          {signup ? "Already have an account?" : "New to FresherDesk?"}{" "}
          <Link href={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </section>
    </main>
  );
}
