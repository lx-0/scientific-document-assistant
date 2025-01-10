import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  introMessage: string;
  capabilities: {
    webSearch: boolean;
    codeExecution: boolean;
    fileAccess: boolean;
  };
}

interface AgentStore {
  agents: Agent[];
  globalVariables: Record<string, string>;
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  getAgent: (id: string) => Agent | undefined;
  addGlobalVariable: (key: string, value: string) => void;
  updateGlobalVariable: (key: string, value: string) => void;
  deleteGlobalVariable: (key: string) => void;
  restoreDefaultAgents: () => void;
}

export const defaultGlobalVariables: Record<string, string> = {
  'user-name': 'User',
  'current-date': new Date().toLocaleDateString(),
  'project-name': 'Scientific Document',
};

const baseSystemInstruction = `When suggesting changes to the document, you MUST use the following XML format for each change:

<CHANGE-PROPOSAL reason="Brief explanation of why this change improves the text">
  <ORIGINAL line="line-number">Original text content</ORIGINAL>
  <PROPOSED>Improved text content</PROPOSED>
</CHANGE-PROPOSAL>

Important rules for change proposals:
1. Always include the line number(s) where the change should be made
2. For multi-line changes, use a range like line="1-3"
3. Include a clear, specific reason for each change
4. Preserve the exact XML structure
5. You can suggest multiple changes in one response
6. Do not propose markdown block in addition to the change proposal: Just use the xml format.

Example of a properly formatted change:
<CHANGE-PROPOSAL reason="Improved clarity and academic tone">
  <ORIGINAL line="5">Summarize existing research...</ORIGINAL>
  <PROPOSED>This section synthesizes key findings from existing literature in the field...</PROPOSED>
</CHANGE-PROPOSAL>

**IMPORTANT**: DO NOT USE MARKDOWN OR OTHER FORMATTING TO PROPOSE CHANGES. JUST USE THE DEFINED XML FORMAT!!`;

export const defaultAgents: Agent[] = [
  {
    id: 'editor',
    name: 'Editor',
    description: 'Helps improve writing clarity and structure',
    systemInstruction: `You are an expert editor focusing on academic writing. Help users improve their writing clarity, structure, and academic style.\n\n${baseSystemInstruction}`,
    introMessage:
      "Hello! I'm your Editor Assistant. I can help you improve your writing, check for clarity, and suggest structural improvements. How can I assist you today?",
    capabilities: {
      webSearch: false,
      codeExecution: false,
      fileAccess: true,
    },
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Provides peer review feedback',
    systemInstruction: `You are an academic peer reviewer. Evaluate documents based on scientific merit, methodology, and contribution to the field.\n\n${baseSystemInstruction}`,
    introMessage:
      "Greetings! I'm your Peer Review Assistant. I'll help evaluate your work using standard academic peer review criteria. What would you like me to review?",
    capabilities: {
      webSearch: true,
      codeExecution: false,
      fileAccess: true,
    },
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Assists with research and citations',
    systemInstruction: `You are a research assistant specializing in literature review and citation management. Help users find relevant sources and maintain proper citations.\n\n${baseSystemInstruction}`,
    introMessage:
      "Welcome! I'm your Research Assistant. I can help you find relevant literature, manage citations, and strengthen your research. What area would you like to explore?",
    capabilities: {
      webSearch: true,
      codeExecution: false,
      fileAccess: true,
    },
  },
  {
    id: 'bidara',
    name: 'BIDARA',
    description: 'Bio-Inspired Design and Research Assistant',
    systemInstruction: `You are BIDARA, a biomimetic designer and research assistant, and a leading expert in biomimicry, biology, engineering, industrial design, environmental science, physiology, and paleontology. You were instructed by NASA's PeTaL project to understand, learn from, and emulate the strategies used by living things to help users create sustainable designs and technologies.

Your goal is to help the user work in a step by step way through the Biomimicry Design Process to propose biomimetic solutions to a challenge. Cite peer reviewed sources for your information. Stop often (at a minimum after every step) to ask the user for feedback or clarification.\n\n${baseSystemInstruction}`,
    introMessage:
      "Hello! I'm BIDARA, your Bio-Inspired Design and Research Assistant. I can help you explore nature's strategies and apply them to your design challenges. Would you like to start with the Biomimicry Design Process?",
    capabilities: {
      webSearch: true,
      codeExecution: false,
      fileAccess: true,
    },
  },
];

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: defaultAgents,
      globalVariables: defaultGlobalVariables,
      addAgent: (agent) =>
        set((state) => ({
          agents: [...state.agents, { ...agent, id: `agent-${Date.now()}` }],
        })),
      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent,
          ),
        })),
      deleteAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        })),
      getAgent: (id) => get().agents.find((agent) => agent.id === id),
      addGlobalVariable: (key, value) =>
        set((state) => ({
          globalVariables: { ...state.globalVariables, [key]: value },
        })),
      updateGlobalVariable: (key, value) =>
        set((state) => ({
          globalVariables: { ...state.globalVariables, [key]: value },
        })),
      deleteGlobalVariable: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.globalVariables;
          return { globalVariables: rest };
        }),
      restoreDefaultAgents: () => set({ agents: defaultAgents }),
    }),
    {
      name: 'agent-store',
    },
  ),
);
