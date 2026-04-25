interface Env {
  FILEBASE_RPC_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file received." }), {
        status: 400,
        headers,
      });
    }

    const apiKey = context.env.FILEBASE_RPC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "FILEBASE_RPC_API_KEY not configured." }),
        { status: 500, headers }
      );
    }

    const outbound = new FormData();
    outbound.set("file", file, file.name);

    const response = await fetch("https://rpc.filebase.io/api/v0/add", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outbound,
    });

    const rawText = await response.text();
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: rawText || "Filebase RPC upload failed." }),
        { status: response.status, headers }
      );
    }

    const payloadLines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const lastLine = payloadLines.at(-1);
    if (!lastLine) {
      return new Response(
        JSON.stringify({ error: "Filebase returned empty response." }),
        { status: 500, headers }
      );
    }

    const payload = JSON.parse(lastLine) as { Hash?: string; Name?: string };
    if (!payload.Hash) {
      return new Response(
        JSON.stringify({ error: "No CID returned from Filebase." }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        cid: payload.Hash,
        fileName: payload.Name || file.name,
        objectKey: `${Date.now()}-${file.name}`,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown IPFS upload error.",
      }),
      { status: 500, headers }
    );
  }
};
