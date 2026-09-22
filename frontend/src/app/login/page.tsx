"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;

      if (token && user) {
        login(token, user);

        // Redirect based on query param or role
        if (redirectUrl) {
          router.push(decodeURIComponent(redirectUrl));
        } else if (user.role === "ADMIN") {
          router.push("/admin");
        } else if (user.role === "SELLER") {
          router.push("/seller");
        } else {
          router.push("/buyer");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Log In to VerifiedLand</h2>
        <p className="text-xs text-slate-400">
          Access admin-audited land listings and document status
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Log In
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 space-y-2">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
        <p className="text-[11px] text-slate-500">
          Internal setup?{" "}
          <Link href="/admin/setup" className="text-slate-400 underline">
            Admin account setup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<CardSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
