import React, { createContext, useCallback, useContext, useState } from 'react';

interface Document {
  id: string;
  title: string;
  content?: string;
}

interface DocumentContextType {
  documents: Document[];
  selectedDocument: Document | null;
  selectDocument: (doc: Document | null) => void;
  updateDocument: (id: string, content: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined,
);

const initialDocuments: Document[] = [
  {
    id: '1',
    title: 'Research Paper Draft',
    content:
      '# Research Paper Draft\n\nThis is a draft of my research paper.\n\n## Introduction\n\nDescribe your research here...',
  },
  {
    id: '2',
    title: 'Literature Review',
    content:
      '# Literature Review\n\n## Background\n\nSummarize existing research...',
  },
  {
    id: '3',
    title: 'Methodology Section',
    content:
      '# Methodology\n\n## Research Design\n\nDescribe your methodology...',
  },
];

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectDocument = useCallback((doc: Document | null) => {
    setSelectedDocument(doc);
  }, []);

  const updateDocument = useCallback(
    (id: string, content: string) => {
      // Update documents state
      setDocuments((prevDocs) => {
        const newDocs = prevDocs.map((doc) =>
          doc.id === id ? { ...doc, content } : doc,
        );

        // Update selected document if it's the one being modified
        if (selectedDocument?.id === id) {
          setSelectedDocument({ ...selectedDocument, content });
        }

        return newDocs;
      });
    },
    [selectedDocument],
  );

  const value = React.useMemo(
    () => ({
      documents,
      selectedDocument,
      selectDocument,
      updateDocument,
      sidebarOpen,
      setSidebarOpen,
    }),
    [documents, selectedDocument, selectDocument, updateDocument, sidebarOpen],
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
