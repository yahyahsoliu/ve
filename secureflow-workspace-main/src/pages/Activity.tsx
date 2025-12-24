import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity as ActivityIcon, Lock, Unlock, Key, Hash, Vault, Shield } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

const Activity = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadLogs();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('activity-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          setLogs((current) => [payload.new as ActivityLog, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
  };

  const getIcon = (action: string) => {
    if (action.includes("Encryption")) return <Lock className="w-5 h-5" />;
    if (action.includes("Decryption")) return <Unlock className="w-5 h-5" />;
    if (action.includes("Hash")) return <Hash className="w-5 h-5" />;
    if (action.includes("Key")) return <Key className="w-5 h-5" />;
    if (action.includes("vault")) return <Vault className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-cyber bg-clip-text text-transparent">Activity Logs</span>
        </h1>
        <p className="text-muted-foreground">Real-time tracking of all cryptographic operations</p>
      </div>

      {logs.length === 0 ? (
        <Card className="p-12 text-center border-primary/20">
          <ActivityIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground">Start using crypto tools to see activity logs</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4 border-primary/20 hover:border-primary/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-cyber text-background">
                  {getIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{log.action}</h3>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {JSON.stringify(log.details, null, 2)}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activity;