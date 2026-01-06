import type { AvatarScores, AvatarLevel } from "./types";
import AvatarPart from "./parts/AvatarPart";

type Props = {
  scores: AvatarScores;
};

const getAvatarLevel = (point: number): AvatarLevel => {
  if (point >= 7) return "level_7";
  if (point >= 3) return "level_3";
  return "base";
};

const AvatarView = ({ scores }: Props) => {
  return (
    <div className="avatar">
      <AvatarPart
        part="upper_body"
        level={getAvatarLevel(scores.upper_body)}
      />
      <AvatarPart
        part="core"
        level={getAvatarLevel(scores.core)}
      />
      <AvatarPart
        part="lower_body"
        level={getAvatarLevel(scores.lower_body)}
      />
    </div>
  );
};

export default AvatarView;
