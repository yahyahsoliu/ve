import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Updated profile",
        details: {},
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-2xl">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-cyber bg-clip-text text-transparent">Profile Settings</span>
        </h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="p-6 border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="p-4 rounded-full bg-gradient-cyber text-background">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account Details</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-2 bg-muted"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} disabled={loading} className="bg-gradient-cyber">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary text-background">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Security Status</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your account is secured with industry-standard encryption
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-primary/20 text-primary">AES-256 Encryption</span>
              <span className="px-2 py-1 rounded bg-secondary/20 text-secondary">RSA-2048 Keys</span>
              <span className="px-2 py-1 rounded bg-accent/20 text-accent">Secure Storage</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;