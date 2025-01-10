import React, { useCallback, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { debounce } from '../../utils/debounce';

interface HighlightedTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  rows?: number;
  saved?: boolean;
}

export function HighlightedTextarea({
  id,
  value,
  onChange,
  variables,
  rows = 3,
  saved = false,
}: HighlightedTextareaProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useCallback(
    debounce((newValue: string) => {
      onChange(newValue);
    }, 300),
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedOnChange(val);
  };

  const insertVariable = (variable: string) => {
    const newValue = localValue + `{{${variable}}}`;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="mt-1 flex gap-2">
      <textarea
        id={id}
        value={localValue}
        onChange={handleChange}
        rows={rows}
        className={clsx(
          'flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1',
          saved
            ? 'border-green-500 focus:border-green-600 focus:ring-green-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        )}
      />
      <Select.Root
        onValueChange={(value) => {
          if (value) {
            insertVariable(value);
          }
        }}
      >
        <Select.Trigger className="h-fit whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50">
          <div className="flex items-center gap-1">
            <Select.Value placeholder="Insert variable..." />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Select.Icon>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-md">
            <Select.Viewport className="p-1">
              {variables.map((variable) => (
                <Select.Item
                  key={variable}
                  value={variable}
                  className={clsx(
                    'relative flex select-none items-center rounded-md px-6 py-2 text-sm outline-none',
                    'data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-600',
                    'cursor-pointer',
                  )}
                >
                  <Select.ItemText>{variable}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
