import { Typography, Badge } from '@strapi/design-system';
import styled from 'styled-components';


export const StatusBadgeStyled = styled(Badge)`
  padding: 5px 8px;
  border: 1px ${({ theme, color }) => theme.colors[`${color}200`]} solid;

  overflow: hidden;

  text-overflow: ellipsis;

  cursor: default;

  span {
    text-transform: none;
  }
`;

export const StatusBadge = ({ children, textColor, ...rest }: any) => (
  <StatusBadgeStyled {...rest}>
    <Typography variant="omega" fontWeight="semibold" textColor={textColor}>
      {children}
    </Typography>
  </StatusBadgeStyled>
);