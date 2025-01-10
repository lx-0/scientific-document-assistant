import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, RotateCcw } from 'lucide-react';
import { useAgentStore, Agent } from '../../stores/agentStore';
import { AgentForm } from './AgentForm';
import { NewAgentForm } from './NewAgentForm';
import { GlobalVariables } from './GlobalVariables';
import { useToast } from '../../hooks/useToast';

export function AgentSettings() {
  const [selectedTab, setSelectedTab] = React.useState('agents');
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);
  const [isNewAgentDialogOpen, setIsNewAgentDialogOpen] = React.useState(false);
  const [confirmRestore, setConfirmRestore] = React.useState(false);
  const { agents, addAgent, updateAgent, deleteAgent, restoreDefaultAgents } =
    useAgentStore();
  const { toast } = useToast();

  const currentAgent = React.useMemo(
    () => agents.find((a) => a.id === selectedAgent),
    [agents, selectedAgent],
  );

  const handleCreateAgent = (agent: Omit<Agent, 'id'>) => {
    addAgent(agent);
    setIsNewAgentDialogOpen(false);
    toast({
      title: 'Agent created',
      description: `${agent.name} has been created successfully.`,
      variant: 'success',
    });
  };

  const handleSaveAgent = (id: string, updates: Partial<Agent>) => {
    updateAgent(id, updates);
  };

  const handleDeleteAgent = (id: string) => {
    deleteAgent(id);
    setSelectedAgent(null);
    toast({
      title: 'Agent deleted',
      description: 'The agent has been deleted successfully.',
      variant: 'success',
    });
  };

  const handleRestoreDefaults = () => {
    if (confirmRestore) {
      restoreDefaultAgents();
      setSelectedAgent(null);
      setConfirmRestore(false);
      toast({
        title: 'Defaults restored',
        description:
          'All agents have been restored to their default configuration.',
        variant: 'success',
      });
    } else {
      setConfirmRestore(true);
    }
  };

  React.useEffect(() => {
    setConfirmRestore(false);
  }, [selectedTab]);

  React.useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgent(agents[0].id);
    }
  }, [agents, selectedAgent]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
      </div>

      <Tabs.Root
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="flex-1"
      >
        <Tabs.List className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <Tabs.Trigger
              value="agents"
              className="border-b-2 px-1 py-4 text-sm font-medium data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Agents
            </Tabs.Trigger>
            <Tabs.Trigger
              value="variables"
              className="border-b-2 px-1 py-4 text-sm font-medium data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              Global Variables
            </Tabs.Trigger>
          </div>
        </Tabs.List>

        <Tabs.Content value="agents" className="flex-1 outline-none">
          <div className="grid h-[calc(100vh-12rem)] grid-cols-[300px_1fr]">
            <div className="border-r border-gray-200">
              <div className="flex flex-col gap-2 p-4">
                <button
                  onClick={() => setIsNewAgentDialogOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  New Agent
                </button>
                <button
                  onClick={handleRestoreDefaults}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    confirmRestore
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  {confirmRestore ? 'Confirm Restore' : 'Restore Defaults'}
                </button>
              </div>
              <div className="space-y-1 p-4">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm ${
                      selectedAgent === agent.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {agent.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-4">
              {currentAgent && (
                <AgentForm
                  key={currentAgent.id}
                  agent={currentAgent}
                  onSave={(updates) =>
                    handleSaveAgent(currentAgent.id, updates)
                  }
                  onDelete={() => handleDeleteAgent(currentAgent.id)}
                />
              )}
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content
          value="variables"
          className="flex-1 overflow-y-auto outline-none"
        >
          <div className="p-6">
            <GlobalVariables />
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root
        open={isNewAgentDialogOpen}
        onOpenChange={setIsNewAgentDialogOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold">
              Create New Agent
            </Dialog.Title>
            <NewAgentForm onSubmit={handleCreateAgent} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
