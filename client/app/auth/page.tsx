"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 as Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/get-session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) router.replace("/app");
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow dark:bg-neutral-900">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-semibold">Notebook LLM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const data = new FormData(form);
            const email = String(data.get("email") || "");
            const password = String(data.get("password") || "");

            setSubmitting(true);
            try {
              const result = await signIn.email({ email, password });
              if (result.error) {
                throw new Error(result.error.message || "Sign in failed");
              }
              toast.success("Signed in");
              router.replace("/app");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Sign in failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input name="email" type="email" placeholder="you@company.com" required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary underline">
                Forgot password?
              </Link>
            </div>
            <Input name="password" type="password" placeholder="••••••••" required />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-muted-foreground/40" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground dark:bg-neutral-900">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          disabled={googleLoading}
          onClick={async () => {
            setGoogleLoading(true);
            try {
              await signIn.social({
                provider: "google",
                callbackURL: "/app",
              });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Google sign-in failed");
              setGoogleLoading(false);
            }
          }}
        >
          {googleLoading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Sign in with Google"
          )}
        </Button>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
