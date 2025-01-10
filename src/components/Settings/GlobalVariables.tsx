import React from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useAgentStore } from '../../stores/agentStore';
import { debounce } from '../../utils/debounce';

export function GlobalVariables() {
  const {
    globalVariables,
    addGlobalVariable,
    updateGlobalVariable,
    deleteGlobalVariable,
  } = useAgentStore();
  const [newVariable, setNewVariable] = React.useState({ key: '', value: '' });
  const [savedFields, setSavedFields] = React.useState<Record<string, boolean>>(
    {},
  );

  const debouncedUpdate = React.useMemo(
    () =>
      debounce((key: string, value: string) => {
        updateGlobalVariable(key, value);
        setSavedFields((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setSavedFields((prev) => ({ ...prev, [key]: false }));
        }, 2000);
      }, 500),
    [updateGlobalVariable],
  );

  const handleAddVariable = () => {
    if (!newVariable.key.trim() || !newVariable.value.trim()) return;
    addGlobalVariable(newVariable.key, newVariable.value);
    setNewVariable({ key: '', value: '' });
  };

  const handleUpdateVariable = (key: string, value: string) => {
    debouncedUpdate(key, value);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Global Variables</h2>
        <p className="mt-1 text-sm text-gray-500">
          These variables can be used across all agents using the {'{{'}
          <span className="font-mono">variable-name</span>
          {'}'} syntax.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Variable name"
            value={newVariable.key}
            onChange={(e) =>
              setNewVariable((prev) => ({ ...prev, key: e.target.value }))
            }
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Value"
            value={newVariable.value}
            onChange={(e) =>
              setNewVariable((prev) => ({ ...prev, value: e.target.value }))
            }
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddVariable}
            disabled={!newVariable.key.trim() || !newVariable.value.trim()}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(globalVariables).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  {'{{'}
                  {key}
                  {'}}'}
                </div>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateVariable(key, e.target.value)}
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors duration-200 ${
                    savedFields[key]
                      ? 'border-green-500 focus:border-green-600 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {savedFields[key] && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Saved</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => deleteGlobalVariable(key)}
                className="mt-7 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
