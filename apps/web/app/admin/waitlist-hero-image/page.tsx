"use client"

import { useState, useEffect } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WaitlistHeroImagePage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")

  useEffect(() => {
    // Fetch current image URL
    setCurrentImageUrl("https://obtmksfewry4ishp.public.blob.vercel-storage.com/hero%20banner")
  }, [])

  const handleUploadComplete = async (url: string) => {
    setUploadedImageUrl(url)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Waitlist Hero Image</h1>
          <p className="text-gray-600">
            Upload a new hero image for the waitlist page. The image should be representative of Fitnest's healthy meal delivery service.
          </p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Image uploaded successfully! Copy the URL below and update the waitlist page.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Current Waitlist Hero Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentImageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border mb-4">
                <Image
                  src={currentImageUrl}
                  alt="Current waitlist hero image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              onUploadComplete={handleUploadComplete}
              maxSizeMB={10}
              acceptedTypes="image/jpeg,image/png,image/webp"
              buttonText="Upload Waitlist Hero Image"
            />

            {uploadedImageUrl && (
              <div className="space-y-4 mt-6">
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                  <Image
                    src={uploadedImageUrl}
                    alt="Uploaded waitlist hero image"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={uploadedImageUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(uploadedImageUrl)
                        setSuccess(true)
                        setTimeout(() => setSuccess(false), 2000)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Copy URL
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Copy this URL and update it in <code className="bg-gray-100 px-1 rounded">apps/web/app/waitlist/page.tsx</code>
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/waitlist" target="_blank">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Waitlist Page
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Recommended size: 1200x800px or larger</li>
              <li>• Format: JPEG, PNG, or WebP</li>
              <li>• Should represent healthy meals, freshness, and Fitnest's brand</li>
              <li>• Consider images showing meal preparation, fresh ingredients, or happy customers</li>
              <li>• Keep file size under 2MB for optimal loading</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

