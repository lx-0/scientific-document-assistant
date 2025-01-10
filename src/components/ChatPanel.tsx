import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Send } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { AgentSelector } from './Chat/AgentSelector';
import { MessageList } from './Chat/MessageList';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, selectedAgent, setSelectedAgent } =
    useChat();

  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    console.log('messages', messages);
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <AgentSelector value={selectedAgent} onValueChange={setSelectedAgent} />
      </div>

      <ScrollArea.Root className="relative flex-1 overflow-hidden">
        <ScrollArea.Viewport ref={scrollViewportRef} className="h-full w-full">
          <MessageList messages={messages} />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex w-2.5 touch-none select-none bg-gray-100 p-0.5"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-300" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Press Shift + Enter for a new line
        </div>
      </form>
    </div>
  );
}
