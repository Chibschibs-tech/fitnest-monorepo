"use client";
import { useState } from "react";
export default function UploadTest() {
  const [out, setOut] = useState<any>(null);
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    setOut(await r.json());
  }
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin — Upload Test</h1>
      <input type="file" onChange={onChange} />
      <pre>{JSON.stringify(out, null, 2)}</pre>
    </main>
  );
}
