"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"
import Image from "next/image"

export function ImageManager() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleUploadComplete = (url: string) => {
    setUploadedImages((prev) => [url, ...prev])
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const filteredImages = uploadedImages.filter((url) => url.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <ImageUpload
            onUploadComplete={handleUploadComplete}
            maxSizeMB={10}
            acceptedTypes="image/jpeg,image/png,image/webp,image/gif"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
            <Input
              type="search"
              placeholder="Search images..."
              className="max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {uploadedImages.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No images uploaded yet. Upload your first image to see it here.
              </CardContent>
            </Card>
          ) : filteredImages.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">No images match your search.</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredImages.map((url, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative h-40 w-full">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Input value={url} readOnly className="text-xs" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(url)}
                        className="flex-shrink-0"
                      >
                        {copied === url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
