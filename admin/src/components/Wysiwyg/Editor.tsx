/*
 *
 * Editor
 *
 */

//@ts-nocheck
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { isString } from 'lodash';
import CodeMirror from 'codemirror5';
import 'codemirror5/addon/display/placeholder';
import PreviewWysiwyg from '../PreviewWysiwyg';
import { EditorStylesContainer } from './EditorStylesContainer';
import { EditorAndPreviewWrapper } from './WysiwygStyles';
import newlineAndIndentContinueMarkdownList from './utils/continueList';

type EditorProps = {
    disabled?: boolean,
    editorRef: any,
    error?: string,
    isPreviewMode: boolean,
    isExpandMode: boolean,
    name: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>)=>void,
    placeholder: string,
    textareaRef: any,
    value: string,
  };

const Editor: React.FC<EditorProps>= ({
  disabled,
  editorRef,
  error,
  isPreviewMode,
  isExpandMode,
  name,
  onChange,
  placeholder,
  textareaRef,
  value,
}) => {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
      lineWrapping: true,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: false,
        'Shift-Tab': false,
      },
      readOnly: false,
      smartIndent: false,
      placeholder,
      spellcheck: true,
      inputStyle: 'contenteditable',
    });

    CodeMirror.commands.newlineAndIndentContinueMarkdownList = newlineAndIndentContinueMarkdownList;
    editorRef.current.on('change', doc => {
      onChangeRef.current({ target: { name, value: doc.getValue(), type: 'wysiwyg' } });
    });
  }, [editorRef, textareaRef, name, placeholder]);

  useEffect(() => {
    if (isString(value) && !editorRef.current.state.focused) {
      editorRef.current.setValue(value);
    }
  }, [editorRef, value]);

  useEffect(() => {
    if (isPreviewMode || disabled) {
      editorRef.current.setOption('readOnly', 'nocursor');
    } else {
      editorRef.current.setOption('readOnly', false);
    }
  }, [disabled, isPreviewMode, editorRef]);

  useEffect(() => {
    if (error) {
      editorRef.current.setOption('screenReaderLabel', error);
    } else {
      // to replace with translation
      editorRef.current.setOption('screenReaderLabel', 'Editor');
    }
  }, [editorRef, error]);

  return (
    <EditorAndPreviewWrapper>
      <EditorStylesContainer isExpandMode={isExpandMode} disabled={disabled || isPreviewMode}>
        <textarea ref={textareaRef} />
      </EditorStylesContainer>
      {isPreviewMode && <PreviewWysiwyg data={value} />}
    </EditorAndPreviewWrapper>
  );
};

export default Editor;
