import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { useAgentStore } from '../../stores/agentStore';

interface AgentSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function AgentSelector({ value, onValueChange }: AgentSelectorProps) {
  const { agents } = useAgentStore();

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
        aria-label="Select agent"
      >
        <Bot className="h-4 w-4 text-gray-500" />
        <Select.Value>
          {agents.find((a) => a.id === value)?.name || 'Select Agent'}
        </Select.Value>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
          <Select.Viewport className="p-1">
            {agents.map((agent) => (
              <Select.Item
                key={agent.id}
                value={agent.id}
                className={clsx(
                  'relative flex select-none items-center rounded-md px-6 py-2 text-sm outline-none',
                  'data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-600',
                  'cursor-pointer',
                )}
              >
                <Select.ItemText>{agent.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
