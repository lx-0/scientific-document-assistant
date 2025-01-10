import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ChatPanel } from "./components/ChatPanel";
import { Editor } from "./components/Editor";
import { Sidebar } from "./components/Sidebar";
import { ChatProvider } from "./contexts/ChatContext";
import { DocumentProvider, useDocuments } from "./contexts/DocumentContext";
import { ToastProvider } from "./hooks/useToast";

function AppContent() {
  const { selectedDocument } = useDocuments();

  return (
    <div className="flex h-screen">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} id="sidebar" order={1}>
          <Sidebar />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
        <Panel
          defaultSize={selectedDocument ? 55 : 80}
          minSize={30}
          id="editor"
          order={2}
        >
          <Editor />
        </Panel>
        {selectedDocument && (
          <>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
            <Panel defaultSize={25} minSize={20} id="chat" order={3}>
              <ChatPanel />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DocumentProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </DocumentProvider>
    </ToastProvider>
  );
}
