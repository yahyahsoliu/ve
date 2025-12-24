import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Lock, Vault, Activity, Key } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    encryptedItems: 0,
    activityLogs: 0,
    encryptionKeys: 0,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadStats(user.id);
      }
    });
  }, []);

  const loadStats = async (userId: string) => {
    const [items, logs, keys] = await Promise.all([
      supabase.from("encrypted_items").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("activity_logs").select("id", { count: "exact" }).eq("user_id", userId),
      supabase.from("encryption_keys").select("id", { count: "exact" }).eq("user_id", userId),
    ]);

    setStats({
      encryptedItems: items.count || 0,
      activityLogs: logs.count || 0,
      encryptionKeys: keys.count || 0,
    });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, <span className="bg-gradient-cyber bg-clip-text text-transparent">{user?.email?.split("@")[0]}</span>
        </h1>
        <p className="text-muted-foreground">Manage your encrypted data and security tools</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Vault className="w-8 h-8" />}
          title="Encrypted Items"
          value={stats.encryptedItems}
          gradient="from-primary to-secondary"
        />
        <StatCard
          icon={<Activity className="w-8 h-8" />}
          title="Activity Logs"
          value={stats.activityLogs}
          gradient="from-secondary to-primary"
        />
        <StatCard
          icon={<Key className="w-8 h-8" />}
          title="Encryption Keys"
          value={stats.encryptionKeys}
          gradient="from-primary to-accent"
        />
        <StatCard
          icon={<Lock className="w-8 h-8" />}
          title="Security Score"
          value="A+"
          gradient="from-accent to-secondary"
          isText
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 border-primary/20">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<Lock className="w-6 h-6" />}
            title="Encrypt Data"
            description="Use AES-256 or RSA encryption"
            href="/tools"
          />
          <QuickActionCard
            icon={<Vault className="w-6 h-6" />}
            title="Access Vault"
            description="View your encrypted items"
            href="/vault"
          />
          <QuickActionCard
            icon={<Key className="w-6 h-6" />}
            title="Generate Keys"
            description="Create new RSA key pairs"
            href="/tools"
          />
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  gradient,
  isText = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  gradient: string;
  isText?: boolean;
}) => {
  return (
    <Card className="p-6 border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow-primary group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} text-background`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <p className="text-3xl font-bold">
        {isText ? value : value.toLocaleString()}
      </p>
    </Card>
  );
};

const QuickActionCard = ({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) => {
  return (
    <a
      href={href}
      className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all hover:shadow-glow-primary group"
    >
      <div className="flex items-start gap-3">
        <div className="text-primary group-hover:animate-glow">{icon}</div>
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default Dashboard;