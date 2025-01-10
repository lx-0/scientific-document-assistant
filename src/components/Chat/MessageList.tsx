import { clsx } from 'clsx';
import { Bot, User } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useDocuments } from '../../contexts/DocumentContext';
import { ChangeProposal } from '../../types/changeProposal';
import { parseChangeProposals } from '../../utils/changeProposalParser';
import { ChangeProposalView } from './ChangeProposal';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: string;
  loading?: boolean;
  proposals?: ChangeProposal[];
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const { selectedDocument, updateDocument } = useDocuments();
  const { updateMessage } = useChat();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Parse proposals for new messages
  useEffect(() => {
    messages.forEach((message) => {
      if (
        message.role === 'assistant' &&
        !message.proposals &&
        !message.loading
      ) {
        const { content, proposals } = parseChangeProposals(message.content);
        if (proposals.length > 0) {
          updateMessage(message.id, { content, proposals });
        }
      }
    });
  }, [messages, updateMessage]);

  const handleProposalAction = useCallback(
    (
      messageId: string,
      proposal: ChangeProposal,
      action: 'accept' | 'reject',
    ) => {
      if (!selectedDocument?.content) return;
      if (!proposal.location?.startLine) {
        console.warn('Proposal missing line numbers:', proposal);
        return;
      }

      const message = messages.find((m) => m.id === messageId);
      if (!message?.proposals) return;

      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Update proposal status immediately
      const updatedProposals = message.proposals.map((p) =>
        p.id === proposal.id ? { ...p, status: action } : p,
      );
      updateMessage(messageId, { proposals: updatedProposals });

      if (action === 'accept') {
        // Delay document update slightly to avoid React state update conflicts
        updateTimeoutRef.current = setTimeout(() => {
          try {
            const lines = selectedDocument.content!.split('\n');
            const { startLine, endLine } = proposal.location!;
            const finalEndLine = endLine || startLine;

            // Ensure line numbers are within bounds
            if (startLine < 1 || finalEndLine > lines.length) {
              console.error('Line numbers out of bounds:', {
                startLine,
                finalEndLine,
                totalLines: lines.length,
              });
              return;
            }

            lines.splice(
              startLine - 1,
              finalEndLine - startLine + 1,
              proposal.proposedText,
            );

            updateDocument(selectedDocument.id, lines.join('\n'));
          } catch (error) {
            console.error('Error applying proposal:', error);
          }
        }, 0);
      }
    },
    [selectedDocument, messages, updateMessage, updateDocument],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={clsx(
            'group flex gap-3 transition-opacity hover:opacity-100',
            {
              'justify-end': message.role === 'user',
              'opacity-90': message.role === 'assistant',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
          )}
          <div className="flex max-w-[80%] flex-col">
            <div
              className={clsx(
                'relative rounded-lg px-4 py-2 shadow-sm transition-shadow',
                'hover:shadow-md',
                {
                  'bg-blue-600 text-white': message.role === 'user',
                  'bg-gray-100 text-gray-800': message.role === 'assistant',
                },
              )}
            >
              {message.role === 'assistant' && message.agent && (
                <div className="mb-1 text-xs font-medium text-gray-500">
                  {message.agent.charAt(0).toUpperCase() +
                    message.agent.slice(1)}{' '}
                  Assistant
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                ) : (
                  message.content
                )}
              </div>
              <div className="mt-1 text-right text-xs opacity-50">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {!message.loading &&
              message.proposals?.map((proposal) => (
                <ChangeProposalView
                  key={proposal.id}
                  proposal={proposal}
                  onAccept={() =>
                    handleProposalAction(message.id, proposal, 'accept')
                  }
                  onReject={() =>
                    handleProposalAction(message.id, proposal, 'reject')
                  }
                />
              ))}
          </div>
          {message.role === 'user' && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 transition-colors group-hover:bg-blue-700">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
