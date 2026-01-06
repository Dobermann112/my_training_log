import type { AvatarLevel } from "../types";

type Props = {
  level: AvatarLevel;
};

const LowerBodyPart = ({ level }: Props) => {
  return <div>LowerBody: {level}</div>;
};

export default LowerBodyPart;
