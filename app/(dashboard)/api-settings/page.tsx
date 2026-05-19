"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Smartphone, ShieldCheck, Copy, CheckCircle2, Webhook, Link as LinkIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApiSettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  
  const webhookUrl = "https://api.adeona.io/webhooks/meta/whatsapp";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="WhatsApp API Integration"
        description="Configure your Meta App and connect your WhatsApp Business Account (WABA) to start messaging."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: API Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Webhook Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Webhook className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">1. Webhook Setup</CardTitle>
                  <CardDescription>Configure these in your Meta App Dashboard under WhatsApp &gt; Configuration.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Callback URL</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted/50 rounded-md border border-border text-sm font-mono text-muted-foreground flex items-center justify-between">
                    <span className="truncate">{webhookUrl}</span>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleCopy(webhookUrl, "webhook")}>
                    {copied === "webhook" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verify-token">Verify Token <span className="text-danger">*</span></Label>
                <p className="text-[11px] text-muted-foreground -mt-1">
                  Create a secure verify token and use it here and in your Meta App setup.
                </p>
                <Input id="verify-token" placeholder="e.g. my_secure_verify_token_123" defaultValue="adeona_secure_verify_token_2026" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border py-3">
              <Button size="sm" className="ml-auto">Save Webhook Settings</Button>
            </CardFooter>
          </Card>

          {/* Section 2: Meta App & WABA Credentials */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-base">2. API Credentials</CardTitle>
                  <CardDescription>Enter your Meta App and WhatsApp Business Account identifiers.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="waba-id">WhatsApp Business Account ID <span className="text-danger">*</span></Label>
                  <Input id="waba-id" placeholder="e.g. 102938475610293" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-secret">App Secret <span className="text-danger">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="app-secret" 
                      type={showSecret ? "text" : "password"} 
                      placeholder="Enter App Secret" 
                      className="pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-token">System User Access Token <span className="text-danger">*</span></Label>
                <p className="text-[11px] text-muted-foreground -mt-1">
                  Use a permanent system user token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
                </p>
                <div className="relative">
                  <Input 
                    id="access-token" 
                    type={showToken ? "text" : "password"} 
                    placeholder="EAA..." 
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Tokens are securely encrypted before storage.
              </div>
              <Button size="sm" className="ml-auto">Connect API</Button>
            </CardFooter>
          </Card>

          {/* Section 3: Add Phone Number / Sender */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">3. Add Sender (Phone Number)</CardTitle>
                  <CardDescription>Register a new WhatsApp number for sending campaigns.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone-number-id">Phone Number ID <span className="text-danger">*</span></Label>
                  <Input id="phone-number-id" placeholder="e.g. 48392019483" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name <span className="text-danger">*</span></Label>
                  <Input id="display-name" placeholder="e.g. AcmeCorp Support" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number (with country code) <span className="text-danger">*</span></Label>
                <Input id="phone-number" placeholder="e.g. +94 77 123 4567" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border py-3">
              <Button size="sm" className="ml-auto">Register Sender</Button>
            </CardFooter>
          </Card>

        </div>

        {/* Right Column: Guide & Help */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" />
                Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 text-muted-foreground leading-relaxed">
              <p>
                To connect your WhatsApp Business API, you must have a registered 
                <strong className="text-foreground font-medium"> Meta Developer App</strong> and a 
                <strong className="text-foreground font-medium"> WhatsApp Business Account (WABA)</strong>.
              </p>
              
              <ol className="list-decimal pl-4 space-y-3 marker:text-primary marker:font-semibold">
                <li>
                  <span className="text-foreground font-medium">Set up Webhooks:</span> Go to your Meta App &gt; WhatsApp &gt; Configuration. Paste the Callback URL and Verify Token from Step 1.
                </li>
                <li>
                  <span className="text-foreground font-medium">Generate Token:</span> Go to Business Settings &gt; System Users. Generate a token with <code className="bg-muted px-1 py-0.5 rounded text-[10px]">whatsapp_business_messaging</code> permissions.
                </li>
                <li>
                  <span className="text-foreground font-medium">Get IDs:</span> Find your WABA ID and Phone Number ID in your App Dashboard under WhatsApp &gt; API Setup.
                </li>
              </ol>

              <div className="pt-4 border-t border-primary/10">
                <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1">
                  Read Meta Official Docs
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
