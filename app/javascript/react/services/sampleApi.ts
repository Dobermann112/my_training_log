import { SampleResponse } from "react/types/api";

export async function fetchSample(): Promise<SampleResponse> {
  const res = await fetch("/api/sample");

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json() as Promise<SampleResponse>;
}