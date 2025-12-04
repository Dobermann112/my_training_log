import { SampleResponse } from "react/types/api";

export async function fetchSample(): Promise<SampleResponse> {
  throw new Error("Manual error test");
}