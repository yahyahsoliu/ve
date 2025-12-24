import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, Hash, Key, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { encryptAES, decryptAES, hashSHA256, hashSHA512, generateRSAKeyPair, encryptRSA, decryptRSA } from "@/lib/crypto";

const Tools = () => {
  const [aesData, setAesData] = useState({ text: "", password: "", result: "" });
  const [hashData, setHashData] = useState({ text: "", sha256: "", sha512: "" });
  const [rsaKeys, setRsaKeys] = useState({ publicKey: "", privateKey: "" });
  const [rsaData, setRsaData] = useState({ text: "", encrypted: "", decrypted: "" });
  const [loading, setLoading] = useState(false);

  const logActivity = async (action: string, details: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action,
        details,
      });
    }
  };

  const handleAESEncrypt = async () => {
    if (!aesData.text || !aesData.password) {
      toast.error("Please enter text and password");
      return;
    }
    setLoading(true);
    try {
      const encrypted = await encryptAES(aesData.text, aesData.password);
      setAesData({ ...aesData, result: encrypted });
      await logActivity("AES Encryption", { length: aesData.text.length });
      toast.success("Text encrypted successfully!");
    } catch (error) {
      toast.error("Encryption failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAESDecrypt = async () => {
    if (!aesData.result || !aesData.password) {
      toast.error("Please enter encrypted text and password");
      return;
    }
    setLoading(true);
    try {
      const decrypted = await decryptAES(aesData.result, aesData.password);
      setAesData({ ...aesData, text: decrypted });
      await logActivity("AES Decryption", {});
      toast.success("Text decrypted successfully!");
    } catch (error) {
      toast.error("Decryption failed - incorrect password or corrupted data");
    } finally {
      setLoading(false);
    }
  };

  const handleHash = async () => {
    if (!hashData.text) {
      toast.error("Please enter text to hash");
      return;
    }
    setLoading(true);
    try {
      const [sha256, sha512] = await Promise.all([
        hashSHA256(hashData.text),
        hashSHA512(hashData.text),
      ]);
      setHashData({ ...hashData, sha256, sha512 });
      await logActivity("Hash Generation", { algorithm: "SHA-256, SHA-512" });
      toast.success("Hashes generated successfully!");
    } catch (error) {
      toast.error("Hashing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRSA = async () => {
    setLoading(true);
    try {
      const keys = await generateRSAKeyPair();
      setRsaKeys(keys);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("encryption_keys").insert({
          user_id: user.id,
          key_type: "RSA-2048",
          public_key: keys.publicKey,
          encrypted_private_key: keys.privateKey,
        });
      }
      
      await logActivity("RSA Key Generation", { keySize: 2048 });
      toast.success("RSA key pair generated!");
    } catch (error) {
      toast.error("Key generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRSAEncrypt = async () => {
    if (!rsaData.text || !rsaKeys.publicKey) {
      toast.error("Please enter text and generate keys first");
      return;
    }
    setLoading(true);
    try {
      const encrypted = await encryptRSA(rsaData.text, rsaKeys.publicKey);
      setRsaData({ ...rsaData, encrypted });
      await logActivity("RSA Encryption", {});
      toast.success("Text encrypted with RSA!");
    } catch (error) {
      toast.error("RSA encryption failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRSADecrypt = async () => {
    if (!rsaData.encrypted || !rsaKeys.privateKey) {
      toast.error("Please enter encrypted text and have private key");
      return;
    }
    setLoading(true);
    try {
      const decrypted = await decryptRSA(rsaData.encrypted, rsaKeys.privateKey);
      setRsaData({ ...rsaData, decrypted });
      await logActivity("RSA Decryption", {});
      toast.success("Text decrypted successfully!");
    } catch (error) {
      toast.error("RSA decryption failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-cyber bg-clip-text text-transparent">Crypto Tools</span>
        </h1>
        <p className="text-muted-foreground">Professional encryption and hashing tools</p>
      </div>

      <Tabs defaultValue="aes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="aes">AES-256</TabsTrigger>
          <TabsTrigger value="hash">Hashing</TabsTrigger>
          <TabsTrigger value="rsa">RSA</TabsTrigger>
        </TabsList>

        {/* AES Tab */}
        <TabsContent value="aes" className="space-y-4">
          <Card className="p-6 border-primary/20">
            <div className="space-y-4">
              <div>
                <Label htmlFor="aes-text">Text to Encrypt/Decrypt</Label>
                <Textarea
                  id="aes-text"
                  value={aesData.text}
                  onChange={(e) => setAesData({ ...aesData, text: e.target.value })}
                  placeholder="Enter your text here..."
                  className="mt-2 min-h-[100px] font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="aes-password">Password</Label>
                <Input
                  id="aes-password"
                  type="password"
                  value={aesData.password}
                  onChange={(e) => setAesData({ ...aesData, password: e.target.value })}
                  placeholder="Enter encryption password"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAESEncrypt} disabled={loading} className="bg-gradient-cyber">
                  <Lock className="w-4 h-4 mr-2" />
                  Encrypt
                </Button>
                <Button onClick={handleAESDecrypt} disabled={loading} variant="outline">
                  <Unlock className="w-4 h-4 mr-2" />
                  Decrypt
                </Button>
              </div>

              {aesData.result && (
                <div>
                  <Label>Encrypted Result</Label>
                  <div className="relative">
                    <Textarea
                      value={aesData.result}
                      readOnly
                      className="mt-2 min-h-[100px] font-mono text-primary"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(aesData.result)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Hash Tab */}
        <TabsContent value="hash" className="space-y-4">
          <Card className="p-6 border-primary/20">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hash-text">Text to Hash</Label>
                <Textarea
                  id="hash-text"
                  value={hashData.text}
                  onChange={(e) => setHashData({ ...hashData, text: e.target.value })}
                  placeholder="Enter text to hash..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <Button onClick={handleHash} disabled={loading} className="bg-gradient-cyber">
                <Hash className="w-4 h-4 mr-2" />
                Generate Hashes
              </Button>

              {hashData.sha256 && (
                <div className="space-y-4">
                  <div>
                    <Label>SHA-256</Label>
                    <div className="relative">
                      <Textarea
                        value={hashData.sha256}
                        readOnly
                        className="mt-2 font-mono text-sm text-primary"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(hashData.sha256)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>SHA-512</Label>
                    <div className="relative">
                      <Textarea
                        value={hashData.sha512}
                        readOnly
                        className="mt-2 font-mono text-sm text-secondary"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(hashData.sha512)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* RSA Tab */}
        <TabsContent value="rsa" className="space-y-4">
          <Card className="p-6 border-primary/20">
            <div className="space-y-4">
              <Button onClick={handleGenerateRSA} disabled={loading} className="bg-gradient-cyber">
                <Key className="w-4 h-4 mr-2" />
                Generate RSA Key Pair
              </Button>

              {rsaKeys.publicKey && (
                <div className="space-y-4">
                  <div>
                    <Label>Public Key</Label>
                    <Textarea
                      value={rsaKeys.publicKey}
                      readOnly
                      className="mt-2 h-32 font-mono text-xs text-primary"
                    />
                  </div>
                  
                  <div>
                    <Label>Text to Encrypt</Label>
                    <Textarea
                      value={rsaData.text}
                      onChange={(e) => setRsaData({ ...rsaData, text: e.target.value })}
                      placeholder="Enter text to encrypt with RSA..."
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleRSAEncrypt} disabled={loading}>
                      <Lock className="w-4 h-4 mr-2" />
                      Encrypt
                    </Button>
                    <Button onClick={handleRSADecrypt} disabled={loading} variant="outline">
                      <Unlock className="w-4 h-4 mr-2" />
                      Decrypt
                    </Button>
                  </div>

                  {rsaData.encrypted && (
                    <div>
                      <Label>Encrypted Result</Label>
                      <Textarea
                        value={rsaData.encrypted}
                        readOnly
                        className="mt-2 h-32 font-mono text-xs text-primary"
                      />
                    </div>
                  )}

                  {rsaData.decrypted && (
                    <div>
                      <Label>Decrypted Result</Label>
                      <Textarea
                        value={rsaData.decrypted}
                        readOnly
                        className="mt-2 text-secondary"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tools;