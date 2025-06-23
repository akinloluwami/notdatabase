"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Globe,
} from "lucide-react";
import Ttile from "@/components/ttile";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  return (
    <>
      <Ttile>Settings - NotDatabase</Ttile>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="flex flex-row items-center">
            <img
              src="https://api.iconify.design/solar:box-minimalistic-bold-duotone.svg?color=%23888888"
              className="w-8"
            />
            <p className="text-lg font-semibold">NotDatabase</p>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    Databases
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-gray-400 mt-2">
                Manage your account settings and preferences
              </p>
            </header>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Billing & Usage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-400">
                          Receive email notifications about your databases
                        </p>
                      </div>
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Communications</Label>
                        <p className="text-sm text-gray-400">
                          Receive updates about new features and products
                        </p>
                      </div>
                      <Switch
                        checked={marketing}
                        onCheckedChange={setMarketing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!hasPassword && (
                      <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-md">
                        <p className="text-sm text-blue-300">
                          You don't have a password set. You can only sign in
                          with your email provider.
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        disabled={!hasPassword}
                        placeholder={
                          hasPassword
                            ? "Enter current password"
                            : "No password set"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        disabled={!hasPassword}
                        placeholder={
                          hasPassword ? "Enter new password" : "No password set"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        disabled={!hasPassword}
                        placeholder={
                          hasPassword
                            ? "Confirm new password"
                            : "No password set"
                        }
                      />
                    </div>
                    <Button variant="outline" disabled={!hasPassword}>
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Free Plan</h3>
                        <p className="text-sm text-gray-400">
                          Perfect for getting started
                        </p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Databases</span>
                        <span>1 / 1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Collections per database</span>
                        <span>5 / 5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>API requests per month</span>
                        <span>1,000 / 1,000</span>
                      </div>
                    </div>
                    <Button className="w-full">Upgrade Plan</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Requests</span>
                        <span>247 / 1,000</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "24.7%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Used</span>
                        <span>2.3 MB / 100 MB</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "2.3%" }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No billing history yet</p>
                      <p className="text-sm">
                        Your invoices will appear here once you upgrade to a
                        paid plan
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payment method added</p>
                      <p className="text-sm">
                        Add a payment method to upgrade your plan
                      </p>
                      <Button variant="outline" className="mt-4">
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
