import React from 'react';
import * as Switch from '@radix-ui/react-switch';
import { useAgentStore, Agent } from '../../stores/agentStore';
import { debounce } from '../../utils/debounce';
import { HighlightedTextarea } from './HighlightedTextarea';

interface AgentFormProps {
  agent: Agent;
  onSave: (updates: Partial<Agent>) => void;
  onDelete: () => void;
}

export function AgentForm({ agent, onSave, onDelete }: AgentFormProps) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [savedFields, setSavedFields] = React.useState<Record<string, boolean>>(
    {},
  );
  const [localValues, setLocalValues] = React.useState({
    name: agent.name,
    description: agent.description,
  });
  const { globalVariables } = useAgentStore();

  const debouncedSave = React.useMemo(
    () =>
      debounce((updates: Partial<Agent>) => {
        onSave(updates);
        // Show saved feedback
        const fieldName = Object.keys(updates)[0];
        if (fieldName) {
          setSavedFields((prev) => ({ ...prev, [fieldName]: true }));
          setTimeout(() => {
            setSavedFields((prev) => ({ ...prev, [fieldName]: false }));
          }, 2000);
        }
      }, 500),
    [onSave],
  );

  const handleTextChange = (name: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [name]: value }));
    debouncedSave({ [name]: value });
  };

  const handleSwitchChange = (
    name: keyof Agent['capabilities'],
    checked: boolean,
  ) => {
    debouncedSave({
      capabilities: {
        ...agent.capabilities,
        [name]: checked,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={localValues.name}
          onChange={(e) => handleTextChange('name', e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200 ${
            savedFields.name
              ? 'border-green-500 focus:border-green-600 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-1`}
        />
        {savedFields.name && (
          <p className="mt-1 text-sm text-green-600">Changes saved</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <input
          type="text"
          id="description"
          value={localValues.description}
          onChange={(e) => handleTextChange('description', e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200 ${
            savedFields.description
              ? 'border-green-500 focus:border-green-600 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-1`}
        />
        {savedFields.description && (
          <p className="mt-1 text-sm text-green-600">Changes saved</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="systemInstruction"
            className="block text-sm font-medium text-gray-700"
          >
            System Instruction
          </label>
        </div>
        <HighlightedTextarea
          id="systemInstruction"
          value={agent.systemInstruction}
          onChange={(value) => debouncedSave({ systemInstruction: value })}
          variables={Object.keys(globalVariables)}
          rows={6}
          saved={savedFields.systemInstruction}
        />
        {savedFields.systemInstruction && (
          <p className="mt-1 text-sm text-green-600">Changes saved</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="introMessage"
            className="block text-sm font-medium text-gray-700"
          >
            Introduction Message
          </label>
        </div>
        <HighlightedTextarea
          id="introMessage"
          value={agent.introMessage}
          onChange={(value) => debouncedSave({ introMessage: value })}
          variables={Object.keys(globalVariables)}
          rows={3}
          saved={savedFields.introMessage}
        />
        {savedFields.introMessage && (
          <p className="mt-1 text-sm text-green-600">Changes saved</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Capabilities</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="webSearch" className="text-sm text-gray-600">
              Web Search
            </label>
            <Switch.Root
              id="webSearch"
              checked={agent.capabilities.webSearch}
              onCheckedChange={(checked) =>
                handleSwitchChange('webSearch', checked)
              }
              className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-blue-600"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="codeExecution" className="text-sm text-gray-600">
              Code Execution
            </label>
            <Switch.Root
              id="codeExecution"
              checked={agent.capabilities.codeExecution}
              onCheckedChange={(checked) =>
                handleSwitchChange('codeExecution', checked)
              }
              className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-blue-600"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="fileAccess" className="text-sm text-gray-600">
              File Access
            </label>
            <Switch.Root
              id="fileAccess"
              checked={agent.capabilities.fileAccess}
              onCheckedChange={(checked) =>
                handleSwitchChange('fileAccess', checked)
              }
              className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-blue-600"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete Agent
          </button>
        ) : (
          <div className="space-x-2">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
