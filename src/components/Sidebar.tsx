import { SiGithub } from '@icons-pack/react-simple-icons';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import React from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { AgentSettings } from './Settings/AgentSettings';

export function Sidebar() {
  const {
    documents,
    selectedDocument,
    selectDocument,
    sidebarOpen,
    setSidebarOpen,
  } = useDocuments();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <>
      <Collapsible.Root
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="relative min-h-screen border-r border-gray-200 bg-white"
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <h2
            className={`font-semibold text-gray-800 ${
              !sidebarOpen && 'hidden'
            }`}
          >
            Documents
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded p-1 hover:bg-gray-100"
              title="Agent Settings"
            >
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
            <Collapsible.Trigger className="rounded p-1 hover:bg-gray-100">
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </Collapsible.Trigger>
          </div>
        </div>

        <Collapsible.Content className="flex h-[calc(100vh-3.5rem)] flex-col">
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50">
            <Plus className="h-4 w-4" />
            New Document
          </button>

          <ScrollArea.Root className="flex-1 w-64">
            <ScrollArea.Viewport className="h-full w-full">
              <div className="px-2 py-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => selectDocument(doc)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      selectedDocument?.id === doc.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText
                      className={`h-4 w-4 ${
                        selectedDocument?.id === doc.id
                          ? 'text-blue-500'
                          : 'text-gray-400'
                      }`}
                    />
                    {doc.title}
                  </button>
                ))}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex w-2.5 touch-none select-none bg-gray-100 p-0.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-300" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
          <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-500">
            <div className="mb-2">© 2025 Scientific Document Assistant</div>
            <div className="flex items-center justify-center gap-1">
              <a
                href="https://github.com/lx-0/scientific-document-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                <SiGithub className="h-4 w-4" />
              </a>
              <span>
                Created by{' '}
                <a
                  href="https://github.com/lx-0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700"
                >
                  @lx-0
                </a>
              </span>
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      <Dialog.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed inset-8 overflow-hidden rounded-lg bg-white shadow-xl">
            <Dialog.Title className="sr-only">Agent Settings</Dialog.Title>
            <AgentSettings />
            <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
