import type { FieldValue } from '@strapi/admin/strapi-admin';

import { Field, Flex } from '@strapi/design-system';
// @ts-ignore
import { EditorFromTextArea } from 'codemirror5';
import * as React from 'react';

//
import { Editor, EditorApi } from './Editor';
import { EditorLayout } from './EditorLayout';
import { listHandler, markdownHandler, quoteAndCodeHandler, titleHandler } from './utils/utils';
import { WysiwygFooter } from './WysiwygFooter';
import { WysiwygNav } from './WysiwygNav';

interface WysiwygProps extends Pick<FieldValue, 'onChange'>{
  value: string;
  name: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const Wysiwyg = React.forwardRef<EditorApi, WysiwygProps>(
  ({ disabled, name, placeholder, label, onChange, value }, forwardedRef) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const editorRef = React.useRef<EditorFromTextArea>(
      null,
    ) as React.MutableRefObject<EditorFromTextArea>;
    const [isPreviewMode, setIsPreviewMode] = React.useState(false);
    const [isExpandMode, setIsExpandMode] = React.useState(false);

    const handleTogglePreviewMode = () => setIsPreviewMode((prev) => !prev);
    const handleToggleExpand = () => {
      setIsPreviewMode(false);
      setIsExpandMode((prev) => !prev);
    };

    const handleActionClick = (
      value: string,
      currentEditorRef: React.MutableRefObject<EditorFromTextArea>,
      togglePopover?: () => void,
    ) => {
      switch (value) {
        case 'Link':
        case 'Strikethrough': {
          markdownHandler(currentEditorRef, value);
          togglePopover?.();
          break;
        }
        case 'Code':
        case 'Quote': {
          quoteAndCodeHandler(currentEditorRef, value);
          togglePopover?.();
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
          togglePopover?.();
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

    return (
      <Field.Root name={name} required>
        <Flex direction="column" alignItems="stretch" gap={1}>
          {label && <Field.Label>{label}</Field.Label>}
          <EditorLayout
            isExpandMode={isExpandMode}
            previewContent={value}
            onCollapse={handleToggleExpand}
          >
            <WysiwygNav
              isExpandMode={isExpandMode}
              editorRef={editorRef}
              isPreviewMode={isPreviewMode}
              onActionClick={handleActionClick}
              onTogglePreviewMode={isExpandMode ? undefined : handleTogglePreviewMode}
              disabled={disabled}
            />

            <Editor
              disabled={disabled}
              isExpandMode={isExpandMode}
              editorRef={editorRef}
              isPreviewMode={isPreviewMode}
              name={name}
              onChange={onChange}
              placeholder={placeholder}
              textareaRef={textareaRef}
              value={value}
              ref={forwardedRef}
            />

            {!isExpandMode && <WysiwygFooter onToggleExpand={handleToggleExpand} />}
          </EditorLayout>
          <Field.Hint />
          <Field.Error />
        </Flex>
      </Field.Root>
    );
  },
);

const MemoizedWysiwyg = React.memo(Wysiwyg);

export { MemoizedWysiwyg as Wysiwyg };
