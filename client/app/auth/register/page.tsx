"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 as Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth-client";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        throw new Error(result.error.message || "Registration failed");
      }

      if (workspaceTitle.trim()) {
        try {
          await api.workspaces.create({ title: workspaceTitle.trim() });
        } catch {
          toast.message("Account created, but workspace creation failed");
        }
      }

      toast.success("Account created");
      router.replace("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow dark:bg-neutral-900">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started with Notebook LLM
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Full name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Confirm password</label>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              First workspace (optional)
            </label>
            <Input
              value={workspaceTitle}
              onChange={(e) => setWorkspaceTitle(e.target.value)}
              placeholder="My Research Notebook"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
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
              toast.error(
                err instanceof Error ? err.message : "Google sign-in failed",
              );
              setGoogleLoading(false);
            }
          }}
        >
          {googleLoading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Continue with Google"
          )}
        </Button>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth" className="text-primary underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
