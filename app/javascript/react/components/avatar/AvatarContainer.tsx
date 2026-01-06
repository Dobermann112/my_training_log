import { useEffect, useState } from "react";
import type { AvatarScores } from "./types";

const AvatarContainer = () => {
  const [scores, setScores] = useState<AvatarScores | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const response = await fetch("/api/avatar");
      const data: AvatarScores = await response.json();
      setScores(data);
    };

    fetchAvatar();
  }, []);

  return null;
};

export default AvatarContainer;
