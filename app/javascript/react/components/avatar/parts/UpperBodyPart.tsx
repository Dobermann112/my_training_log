import type { AvatarLevel } from "../types";

type Props = {
  level: AvatarLevel;
};

const UpperBodyPart = ({ level }: Props) => {
  return <div>UpperBody: {level}</div>;
};

export default UpperBodyPart;
