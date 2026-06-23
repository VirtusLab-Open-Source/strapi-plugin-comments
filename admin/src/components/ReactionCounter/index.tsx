import type { FC } from 'react';
import { Tooltip } from '@strapi/design-system';
import { usePluginTheme } from '@sensinum/strapi-utils';
import type { ReactionType } from 'src/utils/reactionsIntegration';
import {
  ReactionCounterContainer,
  ReactionCounterDot,
  ReactionEmoji,
  ReactionImage,
  ReactionName,
} from './styled';

type ReactionCounterProps = Omit<ReactionType, 'slug'> & {
  count: number;
};

export const ReactionCounter: FC<ReactionCounterProps> = ({ name, icon, emoji, count = 0 }) => {
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
