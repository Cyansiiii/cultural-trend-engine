"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "next/link";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
      callbackURL: "/", // Default to dashboard
    });

    setLoading(false);

    if (error?.code) {
      toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
      return;
    }

    // Redirect based on query param or default
    const redirect = searchParams.get("redirect") || "/";
    router.push(redirect);
  };

  if (registered) {
    toast.success("Account created! Please sign in to continue.");
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md glass-effect"> {/* Assuming glass style from design */}
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <CardTitle className="text-2xl text-center text-foreground">
            Sign In
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Enter your credentials to access the Cultural Resonance Engine
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="off"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}