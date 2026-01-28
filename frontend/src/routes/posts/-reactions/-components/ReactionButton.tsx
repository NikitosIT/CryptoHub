import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useToggleReaction } from "@/routes/posts/-reactions/-api/useToggleReaction";
import type { TelegramPost } from "@/types/db";

import { getReactionClasses, REACTIONS } from "../-utils/reactionStyles";

type ReactionType = "like" | "dislike";

export function ReactionButton({ post }: { post: TelegramPost }) {
  const mutation = useToggleReaction();
  const { user } = useAuthState({ checkTwoFactor: false });

  const userReaction = user?.id ? post.user_reaction : null;
  const isDisabled = !user?.id;

  const handleReaction = (reactionType: ReactionType) => {
    if (!user?.id) return;
    mutation.mutate({ postId: post.id, reactionType, userId: user.id });
  };

  return (
    <div className="flex items-center gap-3">
      {(Object.keys(REACTIONS) as ReactionType[]).map((type) => {
        const config = REACTIONS[type];
        const isActive = userReaction === type;

        const classes = getReactionClasses({
          isActive,
          isDisabled,
          activeBg: config.activeBg,
          hoverBg: config.hoverBg,
          activeText: config.activeText,
          hoverText: config.hoverText,
        });

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleReaction(type)}
            disabled={isDisabled}
            aria-pressed={isActive}
            aria-label={`${config.label} (${post[config.countKey]})`}
            className={classes.button}
          >
            <img
              src={config.icon}
              alt=""
              aria-hidden="true"
              width={14}
              height={14}
              className={classes.icon}
            />
            <span className={classes.count}>{post[config.countKey]}</span>
          </button>
        );
      })}
    </div>
  );
}
