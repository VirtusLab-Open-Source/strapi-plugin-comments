import { FC } from 'react';

type WysiwygProps = {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  intlLabel: {
    id: string;
    defaultMessage: string;
    values: Record<string, string>;
  };
};
// TODO: Implement Wysiwyg component
export const Wysiwyg: FC<WysiwygProps> = () => {
  return null;
};