"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { COUNTRIES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AddContactModalProps {
  children?: React.ReactNode;
}

export function AddContactModal({ children }: AddContactModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");

  const handleSave = async () => {
    if (!firstName || !phone) {
      toast.error("First Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    // Simulate API Call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success("Contact added successfully.");
    setOpen(false);
    
    // Reset state
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setTags("");
    setCountryCode("US");
  };

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 h-9">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the details of the new contact. Ensure they have opted in to receive WhatsApp messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-xs">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
            <div className="flex gap-2">
              <div className="w-[140px] shrink-0">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span className="font-mono">{country.dialCode}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                id="phone"
                placeholder="555-0100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Enter the phone number without the country code.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-xs">Email Address (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags" className="text-xs">Tags (Comma separated)</Label>
            <Input
              id="tags"
              placeholder="vip, marketing, returning"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
