import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getFilebaseApiKey() {
  const apiKey = process.env.FILEBASE_RPC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FILEBASE_RPC_API_KEY.");
  }

  return apiKey;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const apiKey = getFilebaseApiKey();
    const outbound = new FormData();
    outbound.set("file", file, file.name);

    const response = await fetch("https://rpc.filebase.io/api/v0/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: outbound,
    });

    const rawText = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        {
          error: rawText || "Filebase RPC upload failed.",
        },
        { status: response.status },
      );
    }

    const payloadLines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const lastLine = payloadLines.at(-1);
    if (!lastLine) {
      throw new Error("Filebase RPC upload returned an empty response.");
    }

    const payload = JSON.parse(lastLine) as {
      Hash?: string;
      Name?: string;
    };

    if (!payload.Hash) {
      throw new Error("Filebase RPC upload succeeded but no CID was returned.");
    }

    const objectKey = `${Date.now()}-${file.name}`;

    return NextResponse.json({
      cid: payload.Hash,
      fileName: payload.Name || file.name,
      objectKey,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown IPFS upload error.",
      },
      { status: 500 },
    );
  }
}
