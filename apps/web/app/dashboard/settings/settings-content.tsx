"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Lock, CheckCircle, AlertCircle } from "lucide-react"

interface SettingsUser {
  id: number
  name: string
  email: string
  role?: string
}

interface ProfileData {
  name: string
  phone: string
  city: string
}

export function SettingsContent({ user }: { user: SettingsUser }) {
  const [profile, setProfile] = useState<ProfileData>({
    name: user.name || "",
    phone: "",
    city: "",
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setProfile({
              name: data.user.name || "",
              phone: data.user.phone || "",
              city: data.user.city || "",
            })
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          city: profile.city,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile" })
        return
      }

      if (data.user) {
        setProfile({
          name: data.user.name || "",
          phone: data.user.phone || "",
          city: data.user.city || "",
        })
      }

      setProfileMessage({ type: "success", text: "Profile updated successfully" })
    } catch {
      setProfileMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      setPasswordSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" })
      setPasswordSaving(false)
      return
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" })
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage({ type: "success", text: "Password changed successfully" })
    } catch {
      setPasswordMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="h-32 flex items-center justify-center text-gray-500">Loading...</div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Casablanca"
                  />
                </div>

                {profileMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                      profileMessage.type === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {profileMessage.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {profileMessage.text}
                  </div>
                )}

                <Button type="submit" disabled={profileSaving} className="bg-green-600 hover:bg-green-700">
                  {profileSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {passwordMessage.text}
                </div>
              )}

              <Button type="submit" disabled={passwordSaving} className="bg-green-600 hover:bg-green-700">
                {passwordSaving ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
