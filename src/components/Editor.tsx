import React from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { MarkdownEditor } from './Editor/MarkdownEditor';

export function Editor() {
  const { selectedDocument } = useDocuments();

  if (!selectedDocument) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            No Document Selected
          </h2>
          <p className="mt-2 text-gray-500">
            Select a document from the sidebar or create a new one to start
            editing.
          </p>
        </div>
      </div>
    );
  }

  return <MarkdownEditor />;
}
