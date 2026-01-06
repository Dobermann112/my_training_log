import type { AvatarScores } from "./types";

type Props = {
  scores: AvatarScores;
};

const AvatarView = ({ scores }: Props) => {
  return (
    <div>
      {/* Avatar will be rendered here */}
    </div>
  );
};

export default AvatarView;
