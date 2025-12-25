import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export const dynamic = "force-dynamic"

/**
 * Test endpoint to verify Vercel Blob storage connection
 * This endpoint lists blobs to confirm the storage is accessible
 */
export async function GET() {
  try {
    // Check if token exists
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN
    const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN 
      ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 10) + "..." 
      : "NOT SET"
    
    // List blobs to verify connection - get more to find Images folder
    const { blobs } = await list({
      limit: 100,
      prefix: 'Images/',
    })

    // Also try to get all images
    let allBlobs = []
    try {
      const allBlobsResult = await list({ limit: 200 })
      allBlobs = allBlobsResult.blobs.filter(b => 
        b.pathname.toLowerCase().includes('hero') || 
        b.pathname.toLowerCase().includes('image')
      ).map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
      }))
    } catch (err) {
      console.log("Error listing all blobs:", err)
    }

    return NextResponse.json({
      success: true,
      message: "Vercel Blob storage is connected and working",
      blobCount: blobs.length,
      blobs: blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
      heroImages: allBlobs,
      environmentVariables: {
        BLOB_READ_WRITE_TOKEN: {
          exists: hasToken,
          prefix: tokenPrefix,
          length: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
        },
        NODE_ENV: process.env.NODE_ENV,
      },
      storageInfo: {
        provider: "Vercel Blob",
        status: "Connected",
        environment: process.env.NODE_ENV,
        hasToken: hasToken,
      },
    })
  } catch (error) {
    console.error("Vercel Blob test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Vercel Blob storage",
        error: error instanceof Error ? error.message : String(error),
        storageInfo: {
          provider: "Vercel Blob",
          status: "Error",
          environment: process.env.NODE_ENV,
          hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        },
      },
      { status: 500 }
    )
  }
}

