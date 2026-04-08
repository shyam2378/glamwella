import glamwellaLogo from "@/assets/glamwella-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface AdminLoginProps {
  onNavigate: (path: string) => void;
}

export function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { actor } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await actor!.adminLogin(username, password);
      if (result.__kind__ === "ok") {
        localStorage.setItem("glamwella_admin_token", result.ok);
        toast.success("Welcome, Admin! 🎀");
        onNavigate("/admin/dashboard");
      } else {
        setError(result.err);
        toast.error(result.err);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      toast.error("Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-pink p-8 w-full max-w-md relative"
      >
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 350), oklch(0.45 0.20 350))",
            }}
          >
            <Lock size={28} className="text-white" />
          </div>
          <img
            src={glamwellaLogo}
            alt="GLAMWELLA"
            className="h-10 w-auto object-contain mx-auto mb-2"
          />
          <p className="text-sm text-muted-foreground">Admin Portal 🎀</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              data-ocid="admin.input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl"
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              data-ocid="admin.input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          {error && (
            <p
              className="text-sm text-destructive"
              data-ocid="admin.error_state"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            data-ocid="admin.submit_button"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Logging
                in...
              </>
            ) : (
              "Login to Admin 🔐"
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
