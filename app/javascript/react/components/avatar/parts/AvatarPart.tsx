import type { AvatarLevel } from "../types";

type Props = {
  part: "upper_body" | "core" | "lower_body";
  level: AvatarLevel;
};

const AvatarPart = ({ part, level }: Props) => {
  const src = `/assets/avatar/${part}/${level}.svg`;

  return <img src={src} alt={`${part} avatar`} />;
};

export default AvatarPart;
