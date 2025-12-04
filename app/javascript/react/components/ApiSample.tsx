import { useEffect, useState } from "react";

type SampleResponse = {
  message: string;
};

export default function ApiSample() {
  const [data, setData] = useState<SampleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sample")
      .then((res) => {
        if (!res.ok) {
          throw new Error("API request failed");
        }
        return res.json();
      })
      .then((json: SampleResponse) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
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