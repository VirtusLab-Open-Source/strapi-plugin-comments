import * as React from 'react';

import {
  Button,
  Flex,
  IconButton,
  IconButtonGroup,
  SingleSelectOption,
  Popover,
  SingleSelect,
  Field,
} from '@strapi/design-system';
import {
  Bold,
  BulletList,
  Code,
  Italic,
  Link,
  More,
  NumberList,
  Image,
  Quotes,
  StrikeThrough,
  Underline,
} from '@strapi/icons';
// @ts-ignore
import { EditorFromTextArea } from 'codemirror5';
import { useIntl } from 'react-intl';

import { IconButtonGroupMargin, MainButtons, MoreButton } from './WysiwygStyles';

interface WysiwygNavProps {
  disabled?: boolean;
  editorRef: React.MutableRefObject<EditorFromTextArea>;
  isExpandMode?: boolean;
  isPreviewMode?: boolean;
  onActionClick: (
    action: string,
    editorRef: React.MutableRefObject<EditorFromTextArea>,
    callback?: () => void
  ) => void;
  onTogglePreviewMode?: () => void;
}

/**
 * TODO: refactor this mess.
 */
const WysiwygNav = ({
  disabled,
  editorRef,
  isExpandMode,
  isPreviewMode,
  onActionClick,
  onTogglePreviewMode,
}: WysiwygNavProps) => {
  const [visiblePopover, setVisiblePopover] = React.useState(false);
  const { formatMessage } = useIntl();
  const selectPlaceholder = formatMessage({
    id: 'components.Wysiwyg.selectOptions.title',
    defaultMessage: 'Add a title',
  });
  const buttonMoreRef = React.useRef<HTMLButtonElement>(null!);

  const handleTogglePopover = () => {
    setVisiblePopover((prev) => !prev);
  };

  if (disabled || isPreviewMode) {
    return (
      <Flex
        padding={2}
        background="neutral100"
        justifyContent="space-between"
        borderRadius={`0.4rem 0.4rem 0 0`}
      >
        <Flex>
          <Field.Root>
            <SingleSelect
              disabled
              placeholder={selectPlaceholder}
              aria-label={selectPlaceholder}
              size="S"
            >
              <SingleSelectOption value="h1">h1</SingleSelectOption>
              <SingleSelectOption value="h2">h2</SingleSelectOption>
              <SingleSelectOption value="h3">h3</SingleSelectOption>
              <SingleSelectOption value="h4">h4</SingleSelectOption>
              <SingleSelectOption value="h5">h5</SingleSelectOption>
              <SingleSelectOption value="h6">h6</SingleSelectOption>
            </SingleSelect>
          </Field.Root>

          <MainButtons>
            <IconButton disabled label={getMessage('wysiwyg.bold', "Bold")}  name="Bold">
              <Bold />
            </IconButton>
            <IconButton disabled label={getMessage('wysiwyg.italic', "Italic")} name="Italic">
              <Italic />
            </IconButton>
            <IconButton disabled label={getMessage('wysiwyg.underline', "Underline")} name="Underline">
              <Underline />
            </IconButton>
          </MainButtons>

          <MoreButton disabled label={getMessage('common.more', "More")}>
            <More />
          </MoreButton>
        </Flex>

        {!isExpandMode && (
          <Button onClick={onTogglePreviewMode} variant="tertiary">
            {formatMessage({
              id: 'components.Wysiwyg.ToggleMode.markdown-mode',
              defaultMessage: 'Markdown mode',
            })}
          </Button>
        )}
      </Flex>
    );
  }

  return (
    <Flex
      padding={2}
      background="neutral100"
      justifyContent="space-between"
      borderRadius={`0.4rem 0.4rem 0 0`}
    >
      <Flex>
        <Field.Root>
          <SingleSelect
            placeholder={selectPlaceholder}
            aria-label={selectPlaceholder}
            // @ts-expect-error – DS v2 will only allow strings.
            onChange={(value) => onActionClick(value, editorRef)}
            size="S"
          >
            <SingleSelectOption value="h1">h1</SingleSelectOption>
            <SingleSelectOption value="h2">h2</SingleSelectOption>
            <SingleSelectOption value="h3">h3</SingleSelectOption>
            <SingleSelectOption value="h4">h4</SingleSelectOption>
            <SingleSelectOption value="h5">h5</SingleSelectOption>
            <SingleSelectOption value="h6">h6</SingleSelectOption>
          </SingleSelect>
        </Field.Root>

        <MainButtons>
          <IconButton onClick={() => onActionClick('Bold', editorRef)} label={getMessage('wysiwyg.bold', "Bold")} name="Bold">
            <Bold />
          </IconButton>
          <IconButton
            onClick={() => onActionClick('Italic', editorRef)}
            label={getMessage('wysiwyg.italic', "Italic")}
            name="Italic"
          >
            <Italic />
          </IconButton>
          <IconButton
            onClick={() => onActionClick('Underline', editorRef)}
            label={getMessage('wysiwyg.underline', "Underline")}
            name="Underline"
          >
            <Underline />
          </IconButton>
        </MainButtons>
        <Popover.Root>
          <Popover.Trigger>
            <MoreButton label={getMessage('common.more', "More")}>
              <More />
            </MoreButton>
          </Popover.Trigger>
          <Popover.Content sideOffset={12}>
            <Flex padding={2}>
              <IconButtonGroupMargin>
                <IconButton
                  onClick={() => onActionClick('Strikethrough', editorRef, handleTogglePopover)}
                  label={getMessage('wysiwyg.strikethrough', "Strikethrough")}
                  name="Strikethrough"
                >
                  <StrikeThrough />
                </IconButton>
                <IconButton
                  onClick={() => onActionClick('BulletList', editorRef, handleTogglePopover)}
                  label={getMessage('wysiwyg.bulletList', "BulletList")}
                  name="BulletList"
                >
                  <BulletList />
                </IconButton>
                <IconButton
                  onClick={() => onActionClick('NumberList', editorRef, handleTogglePopover)}
                  label={getMessage('wysiwyg.numberList', "NumberList")}
                  name="NumberList"
                >
                  <NumberList />
                </IconButton>
              </IconButtonGroupMargin>
              <IconButtonGroup>
                <IconButton
                  onClick={() => onActionClick('Code', editorRef, handleTogglePopover)}
                  label={getMessage('wysiwyg.code', "Code")}
                  name="Code"
                >
                  <Code />
                </IconButton>
                <IconButton
                  onClick={() => onActionClick('Link', editorRef, handleTogglePopover)}
                  label={getMessage('wysiwyg.link', "Link")}
                  name="Link"
                >
                  <Link />
                </IconButton>
                <IconButton
                  onClick={() => onActionClick('Quote', editorRef, handleTogglePopover)}
                  label={getMessage('wysiwyg.quote', "Quote")}
                  name="Quote"
                >
                  <Quotes />
                </IconButton>
              </IconButtonGroup>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      </Flex>

      {onTogglePreviewMode && (
        <Button onClick={onTogglePreviewMode} variant="tertiary">
          {formatMessage({
            id: 'components.Wysiwyg.ToggleMode.preview-mode',
            defaultMessage: 'Preview mode',
          })}
        </Button>
      )}
    </Flex>
  );
};

export { WysiwygNav };
export type { WysiwygNavProps };
