import { useEffect, useState } from "react";
import { fetchSample } from "react/services/sampleApi";
import { SampleResponse } from "react/types/api";

export default function ApiSample() {
  const [data, setData] = useState<SampleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/not_found");

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h3>API Response:</h3>
      <p>{data?.message}</p>
    </div>
  );
}