import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

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

    console.log("requesting url :", url.toString());

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