import { NextResponse } from "next/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function fail(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return fail("No image file was provided", 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail("Only JPG, PNG, WebP or GIF images are allowed", 400);
    }
    if (file.size > MAX_SIZE) {
      return fail("Image must be smaller than 5 MB", 400);
    }
    if (!process.env.IMGBB_API_KEY) {
      return fail("Image upload is not configured on the server", 500);
    }

    const body = new FormData();
    body.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      { method: "POST", body }
    );
    const result = await response.json();

    if (!response.ok || !result?.success) {
      return fail("Image hosting service rejected the upload", 502);
    }

    return NextResponse.json({ success: true, url: result.data.display_url });
  } catch (error) {
    console.error("Image upload failed:", error);
    return fail("Image upload failed. Please try again.", 500);
  }
}