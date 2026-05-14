"use client";

import { useQuery } from "@tanstack/react-query";
import { getSenders } from "@/data/senders";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CountryFlag } from "@/components/shared/country-flag";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, MessageSquare, Settings, Smartphone, MoreVertical } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/format";

export default function SendersPage() {
  const { data: senders, isLoading } = useQuery({
    queryKey: ["senders"],
    queryFn: () => getSenders(),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="WhatsApp Senders"
        description="Manage your connected WhatsApp Business phone numbers."
        actions={
          <Button render={<Link href={ROUTES.ONBOARDING} />} nativeButton={false}>
            Add Sender
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {senders?.map((sender) => (
          <Card key={sender.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{sender.displayName}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CountryFlag flag={sender.countryFlag} className="w-4 h-4 text-xs" />
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {sender.phoneNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" />}>
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href={`${ROUTES.SENDERS}/${sender.id}`} />}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Verify Number</DropdownMenuItem>
                    <DropdownMenuItem className="text-danger">Remove Sender</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={sender.status} />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
                  <div className={`w-2 h-2 rounded-full ${sender.qualityRating === 'high' ? 'bg-success' : sender.qualityRating === 'medium' ? 'bg-warning' : 'bg-danger'}`} />
                  <span className="capitalize">{sender.qualityRating} Quality</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Messaging Tier Limit</span>
                  <span className="font-medium tabular-nums">{formatNumber(sender.usedToday)} / {formatNumber(sender.dailyLimit)}</span>
                </div>
                <Progress value={(sender.usedToday / sender.dailyLimit) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">Messages sent today</p>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border gap-2">
              <Button variant="outline" className="flex-1" render={<Link href={`${ROUTES.CONVERSATIONS}?sender=${sender.id}`} />} nativeButton={false}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Inbox
              </Button>
              <Button variant="outline" size="icon" render={<Link href={`${ROUTES.SENDERS}/${sender.id}`} />} nativeButton={false}>
                <Settings className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
