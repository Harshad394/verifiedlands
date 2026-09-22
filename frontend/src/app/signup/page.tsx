"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Mail, Lock, Phone, ShoppingBag, Store, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { getErrorMessage, cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("BUYER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/signup", {
        fullName,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        role,
      });

      const { token, user } = response.data;

      if (token && user) {
        login(token, user);

        if (user.role === "SELLER") {
          router.push("/seller");
        } else {
          router.push("/buyer");
        }
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">Join VerifiedLand</h2>
          <p className="text-xs text-slate-400">
            Create an account to browse verified lands or list your land
          </p>
        </div>

        {/* Role Segmented Selector */}
        <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={cn(
              "py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
              role === "BUYER"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>I Want to Buy</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("SELLER")}
            className={cn(
              "py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
              role === "SELLER"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Store className="w-3.5 h-3.5" />
            <span>I Want to Sell</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

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
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
            minLength={6}
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+91 98765 43210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Register as {role === "SELLER" ? "Seller" : "Buyer"}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
