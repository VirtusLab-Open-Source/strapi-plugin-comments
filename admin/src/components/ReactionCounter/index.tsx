import { Tooltip } from '@strapi/design-system';
import { usePluginTheme } from '@sensinum/strapi-utils';

import {
  ReactionCounterContainer,
  ReactionCounterDot,
  ReactionEmoji,
  ReactionImage,
  ReactionName,
} from './styled';

export type ReactionCounterProps = {
  name: string;
  icon?: { url?: string } | null;
  emoji?: string | null;
  count: number;
};

export const ReactionCounter = ({
  name,
  icon,
  emoji,
  count = 0,
}: ReactionCounterProps) => {
  const { theme } = usePluginTheme();

  return (
    <ReactionCounterContainer active>
      {icon && <ReactionImage src={icon.url} />}
      {!icon && <ReactionEmoji>{emoji}</ReactionEmoji>}
      <ReactionName>
        <Tooltip description={name}>
          <span>{name}</span>
        </Tooltip>
      </ReactionName>
      <ReactionCounterDot theme={theme}>{count}</ReactionCounterDot>
    </ReactionCounterContainer>
  );
};
