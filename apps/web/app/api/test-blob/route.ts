import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export const dynamic = "force-dynamic"

/**
 * Test endpoint to verify Vercel Blob storage connection
 * This endpoint lists blobs to confirm the storage is accessible
 */
export async function GET() {
  try {
    // List blobs to verify connection
    const { blobs } = await list({
      limit: 10,
    })

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
      storageInfo: {
        provider: "Vercel Blob",
        status: "Connected",
        environment: process.env.NODE_ENV,
        hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
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

