"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload, X, Check } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void
  className?: string
  maxSizeMB?: number
  acceptedTypes?: string
  buttonText?: string
}

export function ImageUpload({
  onUploadComplete,
  className = "",
  maxSizeMB = 5,
  acceptedTypes = "image/jpeg,image/png,image/webp",
  buttonText = "Upload Image",
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) return

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
    setFile(selectedFile)

    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const blob = await response.json()

      if (onUploadComplete) {
        onUploadComplete(blob.url)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          {!preview ? (
            <>
              <label
                htmlFor="image-upload"
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to select an image</p>
                <p className="text-xs text-gray-400 mt-1">
                  {acceptedTypes
                    .split(",")
                    .map((type) => type.split("/")[1])
                    .join(", ")}{" "}
                  files up to {maxSizeMB}MB
                </p>
              </label>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={acceptedTypes}
              />
            </>
          ) : (
            <div className="relative w-full">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {file && (
            <div className="w-full">
              <p className="text-sm text-gray-500 truncate mb-2">{file.name}</p>
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : success ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Uploaded
                  </>
                ) : (
                  buttonText
                )}
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
