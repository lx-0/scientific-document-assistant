// Previous imports remain the same...

export function NewAgentForm({ onSubmit }: NewAgentFormProps) {
  // Previous state and handlers remain the same...

  const highlightVariables = (text: string) => {
    return text.replace(/{{(.*?)}}/g, '<strong>{{$1}}</strong>');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Previous form fields remain the same... */}

      <div>
        <label
          htmlFor="new-systemInstruction"
          className="block text-sm font-medium text-gray-700"
        >
          System Instruction
        </label>
        <div className="relative">
          <textarea
            id="new-systemInstruction"
            name="systemInstruction"
            value={formData.systemInstruction}
            onChange={handleChange}
            rows={6}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-1 ${
              errors.systemInstruction
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          <div
            className="absolute inset-0 pointer-events-none px-3 py-2 text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: highlightVariables(formData.systemInstruction),
            }}
          />
          <div className="absolute right-2 top-2 z-10">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  insertVariable('systemInstruction', e.target.value);
                  e.target.value = '';
                }
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm"
              value=""
            >
              <option value="">Insert variable...</option>
              {Object.keys(globalVariables).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.systemInstruction && (
          <p className="mt-1 text-sm text-red-600">
            {errors.systemInstruction}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="new-introMessage"
          className="block text-sm font-medium text-gray-700"
        >
          Introduction Message
        </label>
        <div className="relative">
          <textarea
            id="new-introMessage"
            name="introMessage"
            value={formData.introMessage}
            onChange={handleChange}
            rows={3}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-1 ${
              errors.introMessage
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          <div
            className="absolute inset-0 pointer-events-none px-3 py-2 text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: highlightVariables(formData.introMessage),
            }}
          />
          <div className="absolute right-2 top-2 z-10">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  insertVariable('introMessage', e.target.value);
                  e.target.value = '';
                }
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm"
              value=""
            >
              <option value="">Insert variable...</option>
              {Object.keys(globalVariables).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.introMessage && (
          <p className="mt-1 text-sm text-red-600">{errors.introMessage}</p>
        )}
      </div>

      {/* Rest of the form remains the same... */}
    </form>
  );
}
