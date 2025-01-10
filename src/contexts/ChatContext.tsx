import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ConversationManager } from '../lib/openai';
import { useAgentStore } from '../stores/agentStore';
import { useDocuments } from './DocumentContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: string;
  loading?: boolean;
  proposals?: any[];
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  selectedAgent: string;
  setSelectedAgent: (id: string) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Record<string, Message[]>>(
    {},
  );
  const [selectedAgent, setSelectedAgent] = useState<string>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedDocument } = useDocuments();
  const { getAgent } = useAgentStore();

  // Get current conversation based on document and agent
  const conversationKey = useMemo(
    () =>
      selectedDocument?.id ? `${selectedDocument.id}-${selectedAgent}` : null,
    [selectedDocument?.id, selectedAgent],
  );

  // Get current messages
  const messages = useMemo(
    () => (conversationKey ? conversations[conversationKey] || [] : []),
    [conversationKey, conversations],
  );

  // Initialize conversation manager for current agent
  const conversationManager = useMemo(() => {
    const agent = getAgent(selectedAgent);
    if (!agent) return null;

    return new ConversationManager({
      agent,
      debug: true,
      documentContent: selectedDocument?.content,
    });
  }, [selectedAgent, selectedDocument?.content, getAgent]);

  // Update conversation manager when document content changes
  useEffect(() => {
    if (conversationManager && selectedDocument?.content) {
      conversationManager.updateDocumentContent(selectedDocument.content);
    }
  }, [selectedDocument?.content, conversationManager]);

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setConversations((prevConversations) => {
        const newConversations = { ...prevConversations };
        Object.keys(newConversations).forEach((key) => {
          const messages = [...newConversations[key]];
          const messageIndex = messages.findIndex((m) => m.id === messageId);
          if (messageIndex !== -1) {
            messages[messageIndex] = { ...messages[messageIndex], ...updates };
            newConversations[key] = messages;
          }
        });
        return newConversations;
      });
    },
    [],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationManager || !selectedDocument || !conversationKey) return;

      const agent = getAgent(selectedAgent);
      if (!agent) return;

      setIsLoading(true);
      console.log('Sending message', content);

      try {
        // Add user message
        const userMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };

        // Add loading message
        const loadingMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          role: 'assistant',
          content: '',
          agent: agent.name,
          timestamp: new Date().toISOString(),
          loading: true,
        };

        // Update conversation with new messages
        setConversations((prevConversations) => ({
          ...prevConversations,
          [conversationKey]: [
            ...(prevConversations[conversationKey] || []),
            userMessage,
            loadingMessage,
          ],
        }));

        // Get response from API
        const response = await conversationManager.sendMessage(content);
        console.log('Response received', response);

        // Replace loading message with actual response
        setConversations((prevConversations) => {
          const currentMessages = [
            ...(prevConversations[conversationKey] || []),
          ];
          const loadingIndex = currentMessages.findIndex(
            (m) => m.id === loadingMessage.id,
          );
          if (loadingIndex !== -1) {
            currentMessages[loadingIndex] = {
              ...loadingMessage,
              content: response,
              loading: false,
            };
          }
          return {
            ...prevConversations,
            [conversationKey]: currentMessages,
          };
        });
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      conversationManager,
      selectedDocument,
      selectedAgent,
      getAgent,
      conversationKey,
    ],
  );

  // Add initial message when conversation starts
  useEffect(() => {
    if (conversationKey && !conversations[conversationKey]) {
      const agent = getAgent(selectedAgent);
      if (agent) {
        setConversations((prevConversations) => ({
          ...prevConversations,
          [conversationKey]: [
            {
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              role: 'assistant',
              content: agent.introMessage,
              agent: agent.name,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    }
  }, [conversationKey, selectedAgent, getAgent, conversations]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        isLoading,
        selectedAgent,
        setSelectedAgent,
        updateMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
