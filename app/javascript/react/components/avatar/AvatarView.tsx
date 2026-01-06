import type { AvatarScores, AvatarLevel } from "./types";
import AvatarPart from "./parts/AvatarPart";

type Props = {
  scores: AvatarScores;
};

const LEVEL_3 = 300;
const LEVEL_7 = 700;

const getAvatarLevel = (point: number): AvatarLevel => {
  if (point >= LEVEL_7) return "level_7";
  if (point >= LEVEL_3) return "level_3";
  return "base";
};

const AvatarView = ({ scores }: Props) => {
  return (
    <div className="avatar">
      <AvatarPart
        part="lower_body"
        level={getAvatarLevel(scores.lower_body)}
      />
      <AvatarPart
        part="core"
        level={getAvatarLevel(scores.core)}
      />
      <AvatarPart
        part="upper_body"
        level={getAvatarLevel(scores.upper_body)}
      />
    </div>
  );
};

export default AvatarView;
