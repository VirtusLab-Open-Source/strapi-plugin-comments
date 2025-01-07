import React from 'react';

type RenderIfProps = {
  children: React.ReactNode;
  condition: boolean;
}
export const RenderIf: React.FC<RenderIfProps> = ({
  children,
  condition,
}) => {
  return condition ? <>{children}</> : null;
};