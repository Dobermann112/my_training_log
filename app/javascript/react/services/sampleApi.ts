import { SampleResponse } from "react/types/api";

export async function fetchSample(): Promise<SampleResponse> {
  await new Promise((r) => setTimeout(r, 1000));
  const res = await fetch("/api/sample");

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json() as Promise<SampleResponse>;
}