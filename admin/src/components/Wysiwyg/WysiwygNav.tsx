/*
 *
 * WYSIWYG Nav
 *
 */
import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
//@ts-ignore
import { FocusTrap } from '@strapi/design-system/FocusTrap';
//@ts-ignore
import { Box } from '@strapi/design-system/Box';
//@ts-ignore
import { Button } from '@strapi/design-system/Button';
//@ts-ignore
import { IconButtonGroup } from '@strapi/design-system/IconButton';
//@ts-ignore
import { Option, Select } from '@strapi/design-system/Select';
//@ts-ignore
import { Popover } from '@strapi/design-system/Popover';
//@ts-ignore
import { Flex } from '@strapi/design-system/Flex';
//@ts-ignore
import Bold from '@strapi/icons/Bold';
//@ts-ignore
import Italic from '@strapi/icons/Italic';
//@ts-ignore
import Underline from '@strapi/icons/Underline';
//@ts-ignore
import StrikeThrough from '@strapi/icons/StrikeThrough';
//@ts-ignore
import BulletList from '@strapi/icons/BulletList';
//@ts-ignore
import NumberList from '@strapi/icons/NumberList';
//@ts-ignore
import Code from '@strapi/icons/Code';
//@ts-ignore
import Image from '@strapi/icons/Picture';
//@ts-ignore
import Link from '@strapi/icons/Link';
//@ts-ignore
import Quote from '@strapi/icons/Quote';
//@ts-ignore
import More from '@strapi/icons/More';
import {
  MainButtons,
  CustomIconButton,
  IconButtonGroupMargin,
  CustomLinkIconButton,
} from './WysiwygStyles';

type WysiwygNavProps = {
  disabled?: boolean,
  editorRef: any,
  isExpandMode: boolean,
  isPreviewMode: boolean,
  onActionClick: (value:string,currentEditorRef:string,togglePopover?:any ) => void,
  onToggleMediaLib: () => void,
  onTogglePreviewMode: undefined | (() => void)
}

const WysiwygNav: React.FC<WysiwygNavProps> = ({
  disabled,
  editorRef,
  isExpandMode,
  isPreviewMode,
  onActionClick,
  onToggleMediaLib,
  onTogglePreviewMode,
}) => {
  const [visiblePopover, setVisiblePopover] = useState<boolean>(false);
  const { formatMessage } = useIntl();
  const buttonMoreRef = useRef();

  const handleTogglePopover = () => {
    setVisiblePopover(prev => !prev);
  };

  if (disabled || isPreviewMode) {
    return (
      <Box padding={2} background="neutral100">
        <Flex justifyContent="space-between">
          <Flex>
            <MainButtons>
              <CustomIconButton disabled id="Bold" label="Bold" name="Bold" icon={<Bold />} />
              <CustomIconButton
                disabled
                id="Italic"
                label="Italic"
                name="Italic"
                icon={<Italic />}
              />
              <CustomIconButton
                disabled
                id="Underline"
                label="Underline"
                name="Underline"
                icon={<Underline />}
              />
            </MainButtons>
          </Flex>

          {!isExpandMode && (
            <Button onClick={onTogglePreviewMode} variant="tertiary" id="preview">
              {formatMessage({
                id: 'components.Wysiwyg.ToggleMode.markdown-mode',
                defaultMessage: 'Markdown mode',
              })}
            </Button>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={2} background="neutral100">
      <Flex justifyContent="space-between">
        <Flex>
          <MainButtons>
            <CustomIconButton
              onClick={() => onActionClick('Bold', editorRef)}
              id="Bold"
              label="Bold"
              name="Bold"
              icon={<Bold />}
            />
            <CustomIconButton
              onClick={() => onActionClick('Italic', editorRef)}
              id="Italic"
              label="Italic"
              name="Italic"
              icon={<Italic />}
            />
            <CustomIconButton
              onClick={() => onActionClick('Underline', editorRef)}
              id="Underline"
              label="Underline"
              name="Underline"
              icon={<Underline />}
            />
          </MainButtons>
          {visiblePopover && (
            <Popover centered source={buttonMoreRef} spacing={4} id="popover">
              <FocusTrap onEscape={handleTogglePopover} restoreFocus={false}>
                <Flex>
                  <IconButtonGroupMargin>
                    <CustomIconButton
                      onClick={() => onActionClick('Strikethrough', editorRef, handleTogglePopover)}
                      id="Strikethrough"
                      label="Strikethrough"
                      name="Strikethrough"
                      icon={<StrikeThrough />}
                    />
                    <CustomIconButton
                      onClick={() => onActionClick('BulletList', editorRef, handleTogglePopover)}
                      id="BulletList"
                      label="BulletList"
                      name="BulletList"
                      icon={<BulletList />}
                    />
                    <CustomIconButton
                      onClick={() => onActionClick('NumberList', editorRef, handleTogglePopover)}
                      id="NumberList"
                      label="NumberList"
                      name="NumberList"
                      icon={<NumberList />}
                    />
                  </IconButtonGroupMargin>
                  <IconButtonGroup>
                    <CustomIconButton
                      onClick={() => onActionClick('Code', editorRef, handleTogglePopover)}
                      id="Code"
                      label="Code"
                      name="Code"
                      icon={<Code />}
                    />
                    <CustomIconButton
                      onClick={() => {
                        handleTogglePopover();
                        onToggleMediaLib();
                      }}
                      id="Image"
                      label="Image"
                      name="Image"
                      icon={<Image />}
                    />
                    <CustomLinkIconButton
                      onClick={() => onActionClick('Link', editorRef, handleTogglePopover)}
                      id="Link"
                      label="Link"
                      name="Link"
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid
                      icon={<Link />}
                    />
                    <CustomIconButton
                      onClick={() => onActionClick('Quote', editorRef, handleTogglePopover)}
                      id="Quote"
                      label="Quote"
                      name="Quote"
                      icon={<Quote />}
                    />
                  </IconButtonGroup>
                </Flex>
              </FocusTrap>
            </Popover>
          )}
        </Flex>

        {onTogglePreviewMode && (
          <Button onClick={onTogglePreviewMode} variant="tertiary" id="preview">
            {formatMessage({
              id: 'components.Wysiwyg.ToggleMode.preview-mode',
              defaultMessage: 'Preview mode',
            })}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default WysiwygNav;
