import type { AvatarLevel } from "../types";

type Props = {
  level: AvatarLevel;
};

const CorePart = ({ level }: Props) => {
  return <div>Core: {level}</div>;
};

export default CorePart;
