import React, { useState, useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { marked } from 'marked';
import { useDocuments } from '../../contexts/DocumentContext';
import { useChat } from '../../contexts/ChatContext';
import { ChangeProposal } from '../../types/changeProposal';

type ViewMode = 'edit' | 'preview';

export function MarkdownEditor() {
  const { selectedDocument, updateDocument } = useDocuments();
  const { messages } = useChat();
  const [content, setContent] = useState(selectedDocument?.content || '');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const previousDocumentId = useRef<string | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Get pending proposals from messages
  const pendingProposals = React.useMemo(() => {
    return messages
      .flatMap((msg) => msg.proposals || [])
      .filter((proposal) => proposal.status === 'pending' && proposal.location);
  }, [messages]);

  // Update content when document changes
  useEffect(() => {
    if (selectedDocument?.id !== previousDocumentId.current) {
      setContent(selectedDocument?.content || '');
      previousDocumentId.current = selectedDocument?.id || null;
    }
  }, [selectedDocument]);

  // Update content when changes are accepted
  useEffect(() => {
    if (selectedDocument?.content !== content) {
      setContent(selectedDocument?.content || '');
    }
  }, [selectedDocument?.content]);

  // Apply decorations for pending changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations: editor.IModelDeltaDecoration[] = pendingProposals
      .map((proposal) => {
        if (!proposal.location?.startLine) return null;

        const startLine = proposal.location.startLine;
        const endLine = proposal.location.endLine || startLine;
        const startColumn = 1;
        const endColumn = editorRef
          .current!.getModel()!
          .getLineMaxColumn(endLine);

        return {
          range: new monacoRef.current!.Range(
            startLine,
            startColumn,
            endLine,
            endColumn,
          ),
          options: {
            isWholeLine: true,
            className: 'proposed-change-line',
            glyphMarginClassName: 'proposed-change-glyph',
            overviewRuler: {
              color: '#60A5FA',
              position: monacoRef.current!.editor.OverviewRulerLane.Left,
            },
            minimap: {
              color: '#60A5FA',
              position: monacoRef.current!.editor.MinimapPosition.Inline,
            },
            hoverMessage: {
              value: `Suggested Change:\n${proposal.proposedText}\n\nReason: ${proposal.reason || 'No reason provided'}`,
            },
          },
        };
      })
      .filter(Boolean) as editor.IModelDeltaDecoration[];

    const oldDecorations =
      editorRef.current.getModel()?.getAllDecorations() || [];
    editorRef.current.deltaDecorations(
      oldDecorations.map((d) => d.id),
      decorations,
    );
  }, [pendingProposals, content]);

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add custom CSS class for proposed changes
    monaco.editor.defineTheme('custom-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {},
    });

    // Apply the theme
    monaco.editor.setTheme('custom-theme');
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      if (selectedDocument) {
        updateDocument(selectedDocument.id, value);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h1 className="text-lg font-semibold text-gray-800">
          {selectedDocument?.title}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === 'edit'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
          {pendingProposals.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {pendingProposals.length} pending changes
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white">
        {viewMode === 'edit' && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={content}
            onChange={handleChange}
            onMount={handleEditorDidMount}
            theme="custom-theme"
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              wrappingIndent: 'same',
              lineNumbers: 'on',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              fontSize: 14,
              renderLineHighlight: 'all',
              occurrencesHighlight: false,
              folding: true,
              lineDecorationsWidth: 16,
              glyphMargin: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        )}

        {viewMode === 'preview' && (
          <div className="prose prose-sm mx-auto h-full max-w-3xl overflow-y-auto p-6">
            <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
          </div>
        )}
      </div>
    </div>
  );
}
