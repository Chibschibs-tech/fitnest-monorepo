"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Save, Info, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface HeroContent {
  id?: number
  desktopImageUrl?: string | null
  mobileImageUrl?: string | null
  title?: string | null
  description?: string | null
  altText?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  isActive?: boolean
}

export function HeroContentManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<HeroContent>({
    desktopImageUrl: null,
    mobileImageUrl: null,
    title: null,
    description: null,
    altText: null,
    seoTitle: null,
    seoDescription: null,
  })

  useEffect(() => {
    loadHeroContent()
  }, [])

  const loadHeroContent = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/content/hero")
      if (!response.ok) throw new Error("Failed to load hero content")

      const result = await response.json()
      if (result.data) {
        setFormData(result.data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load hero content")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch("/api/admin/content/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save hero content")
      }

      const result = await response.json()
      setFormData(result.data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save hero content")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-fitnest-green" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hero Section Management</h1>
        <p className="text-gray-600 mt-2">Manage the hero section content for the home page</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Hero content saved successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Desktop Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Desktop Hero Image</CardTitle>
            <CardDescription>Upload the hero image for desktop/tablet screens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Guidelines:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Recommended size: 1920x1080px or larger (16:9 aspect ratio)</li>
                  <li>File format: JPG, PNG, or WebP</li>
                  <li>Max file size: 5MB</li>
                  <li>Ensure the image is high quality and optimized for web</li>
                  <li>Important content should be centered, as it may be cropped on different screen sizes</li>
                </ul>
              </AlertDescription>
            </Alert>
            {formData.desktopImageUrl ? (
              <div className="relative w-full h-64 rounded-md overflow-hidden border">
                <Image
                  src={formData.desktopImageUrl}
                  alt="Desktop hero preview"
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData({ ...formData, desktopImageUrl: null })}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <ImageUpload
                onUploadComplete={(url) => setFormData({ ...formData, desktopImageUrl: url })}
                buttonText="Upload Desktop Image"
                maxSizeMB={5}
              />
            )}
          </CardContent>
        </Card>

        {/* Mobile Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Hero Image</CardTitle>
            <CardDescription>Upload the hero image for mobile screens (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Guidelines:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Recommended size: 750x1334px or similar (9:16 aspect ratio for portrait)</li>
                  <li>File format: JPG, PNG, or WebP</li>
                  <li>Max file size: 3MB</li>
                  <li>Optimize for mobile to ensure fast loading</li>
                  <li>If not provided, desktop image will be used (may be cropped)</li>
                </ul>
              </AlertDescription>
            </Alert>
            {formData.mobileImageUrl ? (
              <div className="relative w-full h-64 rounded-md overflow-hidden border">
                <Image
                  src={formData.mobileImageUrl}
                  alt="Mobile hero preview"
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData({ ...formData, mobileImageUrl: null })}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <ImageUpload
                onUploadComplete={(url) => setFormData({ ...formData, mobileImageUrl: url })}
                buttonText="Upload Mobile Image"
                maxSizeMB={3}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEO & Content Fields */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Content Information</CardTitle>
          <CardDescription>Add SEO metadata and content for the hero section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text (Image Accessibility)</Label>
            <Input
              id="altText"
              value={formData.altText || ""}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              placeholder="e.g., Healthy meal delivery service in Morocco"
            />
            <p className="text-xs text-gray-500">
              Describe the image for screen readers and SEO. Be descriptive and include relevant keywords.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              value={formData.seoTitle || ""}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="e.g., Fitnest.ma | Healthy Meal Delivery in Morocco"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">Optimal length: 50-60 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription || ""}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              placeholder="e.g., Fitnest.ma delivers healthy, chef-prepared meals and tailored meal plans across Morocco..."
              rows={3}
            />
            <p className="text-xs text-gray-500">Optimal length: 150-160 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Hero Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Healthy Meals, Delivered Fresh"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">Optional title to display over the hero image</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Hero Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Choose your plan, select your meals, we cook & deliver..."
              rows={3}
            />
            <p className="text-xs text-gray-500">Optional description to display over the hero image</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-fitnest-green hover:bg-fitnest-green/90">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Hero Content
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

