import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useSaveProfile } from "../hooks/useQueries";

interface ProfileProps {
  onNavigate: (path: string) => void;
  isFirstLogin?: boolean;
}

export function Profile({ onNavigate, isFirstLogin }: ProfileProps) {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useMyProfile();
  const saveProfile = useSaveProfile();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gmail: "",
    address: "",
    city: "",
    pincode: "",
    landmark: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        phone: profile.phone,
        gmail: profile.gmail,
        address: profile.address,
        city: profile.city,
        pincode: profile.pincode,
        landmark: profile.landmark ?? "",
      });
    }
  }, [profile]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">
          Please login to view your profile.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="btn-primary"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: form.name,
        phone: form.phone,
        gmail: form.gmail,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        landmark: form.landmark,
        profileComplete: true,
      });
      toast.success("Profile saved! ♥");
      if (isFirstLogin) {
        onNavigate("/");
      }
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const field = (
    id: string,
    label: string,
    key: keyof typeof form,
    type = "text",
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} <span className="text-primary">*</span>
      </Label>
      <Input
        id={id}
        data-ocid="profile.input"
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="rounded-xl border-border focus:border-primary"
      />
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8 pb-16 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 350), oklch(0.45 0.20 350))",
            }}
          >
            <User size={36} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isFirstLogin ? "Complete Your Profile 🎀" : "My Profile ♥"}
          </h1>
          {isFirstLogin && (
            <p className="text-muted-foreground mt-2 text-sm">
              Please fill in your details to continue shopping
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {identity.getPrincipal().toString().slice(0, 20)}...
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="card-pink p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field("name", "Full Name", "name")}
              {field("phone", "Phone Number", "phone", "tel")}
              {field("gmail", "Gmail Address", "gmail", "email")}
              {field("address", "Full Address", "address")}
              {field("city", "City", "city")}
              {field("pincode", "Pincode", "pincode")}
            </div>
            <div>
              {field("landmark", "Landmark (Near / Opposite)", "landmark")}
            </div>
            <Button
              type="submit"
              data-ocid="profile.submit_button"
              disabled={saveProfile.isPending}
              className="btn-primary w-full py-3 mt-2"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" /> Save Profile ♥
                </>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
