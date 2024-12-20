import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import crypto from "crypto";

export async function GET() {
  try {
    const blobs = await list();

    if (!blobs || !blobs.blobs || blobs.blobs.length === 0) {
      console.log("No blobs found in storage.");
      return NextResponse.json({ success: true, images: [] });
    }

    // Map blobs to extract required data
    const images = blobs.blobs.map((blob) => ({
      url: blob.url, // Public URL of the image
      prompt: blob.meta?.prompt || "No prompt available", // Retrieve the prompt from metadata
      createdAt: blob.uploadedAt, // Date the blob was uploaded
    }));

    // Sort images by newest first
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    if (!process.env.URL_PATH) {
      throw new Error("URL_PATH environment variable is not defined");
    }
    const url = new URL(process.env.URL_PATH);
    url.searchParams.set("prompt", text)

    const headers: HeadersInit = {
      Accept: "image/jpeg",
    };
    
    if (process.env.API_KEY) {
      headers["X-API-KEY"] = process.env.API_KEY;
    } else {
      throw new Error("API_KEY environment variable is not defined");
    }
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response", errorText);
      throw new Error(`HTTP error: ${response.status}, message: ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    const filename = `${crypto.randomUUID()}.jpg`;

    const blob = await put(filename, imageBuffer, {
      access : "public",
      contentType: "image/jpeg",
      meta: { prompt: text },
    });

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}