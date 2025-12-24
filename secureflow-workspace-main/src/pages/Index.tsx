import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, FileKey, Activity, Vault } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-24">
          <div className="flex flex-col items-center text-center space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/30 shadow-glow-primary">
              <Shield className="w-4 h-4 text-primary animate-glow" />
              <span className="text-sm font-medium text-primary">Enterprise-Grade Encryption</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl">
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Secure Your Data
              </span>
              <br />
              <span className="text-foreground">With Military-Grade Crypto</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Professional cryptography tools for encryption, key management, and secure data storage. 
              Built for security professionals and privacy-conscious users.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="bg-gradient-cyber hover:shadow-glow-primary transition-all">
                <Link to="/auth">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-card">
                <Link to="/auth">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Premium Cryptography Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for secure data encryption and management
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="AES-256 Encryption"
            description="Military-grade encryption for your sensitive data with advanced key management"
          />
          <FeatureCard
            icon={<Key className="w-8 h-8" />}
            title="RSA Key Generation"
            description="Generate secure RSA key pairs for asymmetric encryption and digital signatures"
          />
          <FeatureCard
            icon={<FileKey className="w-8 h-8" />}
            title="File Encryption"
            description="Encrypt files of any size with secure storage and easy retrieval"
          />
          <FeatureCard
            icon={<Activity className="w-8 h-8" />}
            title="Real-time Activity Logs"
            description="Track all encryption operations with detailed audit trails"
          />
          <FeatureCard
            icon={<Vault className="w-8 h-8" />}
            title="Encrypted Vault"
            description="Secure storage for your encrypted data with time-locked access"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Multi-Factor Security"
            description="Advanced unlocking mechanisms with location and time-based controls"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="relative rounded-3xl bg-card border border-primary/20 p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
          <div className="relative text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Secure Your Data?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join security professionals using our platform to protect sensitive information
            </p>
            <Button asChild size="lg" className="bg-gradient-cyber hover:shadow-glow-primary transition-all">
              <Link to="/auth">Start Encrypting Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-glow-primary">
      <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
      <div className="relative space-y-4">
        <div className="text-primary">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Index;