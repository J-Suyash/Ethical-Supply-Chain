import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 },
    );
  }

  const apiKey = process.env.FILEBASE_RPC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "IPFS API key not configured" },
      { status: 500 },
    );
  }

  const uploadForm = new FormData();
  uploadForm.set("file", file, file.name);

  const response = await fetch("https://rpc.filebase.io/api/v0/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: uploadForm,
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: `Filebase upload failed: ${response.status} ${text}` },
      { status: response.status },
    );
  }

  const result = await response.json();
  const cid = result.Hash as string;
  return NextResponse.json({
    cid,
    fileName: file.name,
    gatewayUrl: `https://steady-teal-squid.myfilebase.com/ipfs/${cid}`,
  });
}
