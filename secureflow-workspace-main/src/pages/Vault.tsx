import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Vault as VaultIcon, Plus, Trash2, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { encryptAES, decryptAES } from "@/lib/crypto";

interface EncryptedItem {
  id: string;
  title: string;
  encrypted_content: string;
  encryption_type: string;
  created_at: string;
}

const Vault = () => {
  const [items, setItems] = useState<EncryptedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", content: "", password: "" });
  const [viewPassword, setViewPassword] = useState("");
  const [viewContent, setViewContent] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("encrypted_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content || !newItem.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const encrypted = await encryptAES(newItem.content, newItem.password);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.from("encrypted_items").insert({
          user_id: user.id,
          title: newItem.title,
          encrypted_content: encrypted,
          encryption_type: "AES-256",
        });

        if (!error) {
          toast.success("Item added to vault!");
          setNewItem({ title: "", content: "", password: "" });
          loadItems();
          
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action: "Added item to vault",
            details: { title: newItem.title },
          });
        }
      }
    } catch (error) {
      toast.error("Failed to encrypt and save item");
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = async (item: EncryptedItem) => {
    if (!viewPassword) {
      toast.error("Please enter password");
      return;
    }

    setLoading(true);
    try {
      const decrypted = await decryptAES(item.encrypted_content, viewPassword);
      setViewContent({ id: item.id, content: decrypted });
      toast.success("Decrypted successfully!");
    } catch (error) {
      toast.error("Failed to decrypt - incorrect password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase.from("encrypted_items").delete().eq("id", id);
    
    if (!error) {
      toast.success("Item deleted from vault");
      loadItems();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          user_id: user.id,
          action: "Deleted item from vault",
          details: { id },
        });
      }
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-cyber bg-clip-text text-transparent">Encrypted Vault</span>
          </h1>
          <p className="text-muted-foreground">Securely store your encrypted data</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-cyber">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/20">
            <DialogHeader>
              <DialogTitle>Add to Vault</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Item title"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="Sensitive data to encrypt..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="password">Encryption Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newItem.password}
                  onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                  placeholder="Strong password"
                  className="mt-2"
                />
              </div>

              <Button onClick={handleAddItem} disabled={loading} className="w-full bg-gradient-cyber">
                <Lock className="w-4 h-4 mr-2" />
                Encrypt & Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center border-primary/20">
          <VaultIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Your vault is empty</h3>
          <p className="text-muted-foreground">Add your first encrypted item to get started</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="p-6 border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.encryption_type} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter password to view"
                    value={viewContent?.id === item.id ? "" : viewPassword}
                    onChange={(e) => setViewPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleViewItem(item)}
                    disabled={loading}
                  >
                    {viewContent?.id === item.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                {viewContent?.id === item.id && (
                  <Textarea
                    value={viewContent.content}
                    readOnly
                    className="mt-2 min-h-[100px] font-mono text-sm"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vault;