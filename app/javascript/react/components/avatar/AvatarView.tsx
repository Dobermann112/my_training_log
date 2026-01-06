import type { AvatarScores, AvatarLevel } from "./types";

type Props = {
  scores: AvatarScores;
};

const getAvatarLevel = (point: number): AvatarLevel => {
  if (point >= 7) return "level_7";
  if (point >= 3) return "level_3";
  return "base";
};

const AvatarView = ({ scores }: Props) => {
  const upperLevel = getAvatarLevel(scores.upper_body);
  const coreLevel = getAvatarLevel(scores.core);
  const lowerLevel = getAvatarLevel(scores.lower_body);

  return (
    <div>
      <div>Upper: {upperLevel}</div>
      <div>Core: {coreLevel}</div>
      <div>Lower: {lowerLevel}</div>
    </div>
  );
};

export default AvatarView;
