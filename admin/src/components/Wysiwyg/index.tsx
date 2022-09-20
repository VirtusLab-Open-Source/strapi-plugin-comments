/*
 *
 * WYSIWYG
 *
 */

import React, { useRef, useState } from 'react';
//@ts-ignore
import styled, {ThemeInterface} from 'styled-components';
import { useIntl } from 'react-intl';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { Box } from '@strapi/design-system/Box';
//@ts-ignore
import { Stack } from '@strapi/design-system/Stack';
//@ts-ignore
import { prefixFileUrlWithBackendUrl, useLibrary } from '@strapi/helper-plugin';
import Editor from './Editor';
import WysiwygNav from './WysiwygNav';
import WysiwygFooter from './WysiwygFooter';
import Hint from '../Hint';
import {
  markdownHandler,
  listHandler,
  titleHandler,
  insertFile,
  quoteAndCodeHandler,
} from './utils/utils';
import { EditorLayout } from './EditorLayout';


const LabelAction = styled(Box)`
  svg path {
    fill: ${({ theme }:ThemeInterface) => theme.colors.neutral500};
  }
`;

const TypographyAsterisk = styled(Typography)`
  line-height: 0;
`;

type WysiwygProps = {
  description?:{
    id: string,
    defaultMessage: string,
    values: {},
  },
  disabled?: boolean,
  error?: string,
  intlLabel:{
    id: string,
    defaultMessage: string,
    values: {},
  },
  labelAction?: JSX.Element,
  name: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  placeholder?: {
    id: string,
    defaultMessage: string,
    values: {},
  },
  required?: boolean,
  value: string,
};

const Wysiwyg: React.FC<WysiwygProps> = ({
  description,
  disabled,
  error,
  intlLabel,
  labelAction,
  name,
  onChange,
  placeholder,
  value,
  required,
}) => {
  const { formatMessage } = useIntl();
  const textareaRef = useRef<string | null>(null);
  const editorRef = useRef<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [mediaLibVisible, setMediaLibVisible] = useState<boolean>(false);
  const [isExpandMode, setIsExpandMode] = useState<boolean>(false);
  const { components } = useLibrary();

  const MediaLibraryDialog = components['media-library'];

  const handleToggleMediaLib = () => setMediaLibVisible(prev => !prev);
  const handleTogglePreviewMode = () => setIsPreviewMode(prev => !prev);
  const handleToggleExpand = () => {
    setIsPreviewMode(false);
    setIsExpandMode(prev => !prev);
  };

  const handleActionClick = ( value:string, currentEditorRef:string, togglePopover: ()=>void ) => {
    switch (value) {
      case 'Link':
      case 'Strikethrough': {
        markdownHandler(currentEditorRef, value);
        togglePopover();
        break;
      }
      case 'Code':
      case 'Quote': {
        quoteAndCodeHandler(currentEditorRef, value);
        togglePopover();
        break;
      }
      case 'Bold':
      case 'Italic':
      case 'Underline': {
        markdownHandler(currentEditorRef, value);
        break;
      }
      case 'BulletList':
      case 'NumberList': {
        listHandler(currentEditorRef, value);
        togglePopover();
        break;
      }
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        titleHandler(currentEditorRef, value);
        break;
      }
      default: {
        // Nothing
      }
    }
  };

  const handleSelectAssets = (files: any) => {
    const formattedFiles = files.map((f:any) => ({
      alt: f.alternativeText || f.name,
      url: prefixFileUrlWithBackendUrl(f.url),
      mime: f.mime,
    }));

    insertFile(editorRef, formattedFiles);
    setMediaLibVisible(false);
  };

  const formattedPlaceholder = placeholder
    ? formatMessage(
        { id: placeholder.id, defaultMessage: placeholder.defaultMessage },
        { ...placeholder.values }
      )
    : '';

  const label = intlLabel.id
    ? formatMessage(
        { id: intlLabel.id, defaultMessage: intlLabel.defaultMessage },
        { ...intlLabel.values }
      )
    : name;

  return (
    <>
      <Stack spacing={1}>
        <Stack horizontal spacing={1}>
          <Typography variant="pi" fontWeight="bold" textColor="neutral800">
            {label}
            {required && <TypographyAsterisk textColor="danger600">*</TypographyAsterisk>}
          </Typography>
          {labelAction && <LabelAction paddingLeft={1}>{labelAction}</LabelAction>}
        </Stack>

        <EditorLayout
          isExpandMode={isExpandMode}
          error={error}
          previewContent={value}
          onCollapse={handleToggleExpand}
        >
          <WysiwygNav
            isExpandMode={isExpandMode}
            editorRef={editorRef}
            isPreviewMode={isPreviewMode}
            onActionClick={handleActionClick}
            onToggleMediaLib={handleToggleMediaLib}
            onTogglePreviewMode={isExpandMode ? undefined : handleTogglePreviewMode}
            disabled={disabled}
          />

          <Editor
            disabled={disabled}
            isExpandMode={isExpandMode}
            editorRef={editorRef}
            error={error}
            isPreviewMode={isPreviewMode}
            name={name}
            onChange={onChange}
            placeholder={formattedPlaceholder}
            textareaRef={textareaRef}
            value={value}
          />

          {!isExpandMode && <WysiwygFooter onToggleExpand={handleToggleExpand} />}
        </EditorLayout>

        <Hint 
          description={description} 
          name={name} 
          error={error}
          id={name} 
        />

      </Stack>

      {error && (
        <Box paddingTop={1}>
          <Typography variant="pi" textColor="danger600" data-strapi-field-error>
            {error}
          </Typography>
        </Box>
      )}

      {mediaLibVisible && (
        <MediaLibraryDialog onClose={handleToggleMediaLib} onSelectAssets={handleSelectAssets} />
      )}
    </>
  );
};

export default Wysiwyg;
