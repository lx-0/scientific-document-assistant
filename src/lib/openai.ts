import OpenAI from 'openai';
import { Agent } from '../stores/agentStore';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v1',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationOptions {
  agent: Agent;
  maxRetries?: number;
  debug?: boolean;
  documentContent?: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public type?: string,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const MAX_CONTEXT_LENGTH = 4096;
const RETRY_DELAYS = [1000, 2000, 4000];

export class ConversationManager {
  private context: ChatMessage[] = [];
  private agent: Agent;
  private maxRetries: number;
  private debug: boolean;
  private isProcessing: boolean = false;
  private documentContent?: string;

  constructor({
    agent,
    maxRetries = 3,
    debug = false,
    documentContent,
  }: ConversationOptions) {
    this.agent = agent;
    this.maxRetries = maxRetries;
    this.debug = debug;
    this.documentContent = documentContent;

    // Initialize context with system instruction only
    this.context = [
      {
        role: 'system',
        content: agent.systemInstruction,
      },
    ];

    this.logDebug('Conversation initialized', { agent: agent.name });
  }

  private logDebug(message: string, data?: any) {
    if (this.debug) {
      console.log(`[ConversationManager] ${message}`, data);
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public updateDocumentContent(content: string) {
    const previousContent = this.documentContent;
    this.documentContent = content;
    this.logDebug('Document content updated', {
      previousContent,
      newContent: content,
    });
  }

  private async makeRequest(
    messages: ChatMessage[],
    retryCount = 0,
  ): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        this.logDebug(
          `Retrying request (${retryCount + 1}/${this.maxRetries})`,
        );
        await this.sleep(RETRY_DELAYS[retryCount]);
        return this.makeRequest(messages, retryCount + 1);
      }

      throw new APIError(error.message, error.status, error.code, error.type);
    }
  }

  private shouldRetry(error: any): boolean {
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.status);
  }

  public async sendMessage(content: string): Promise<string> {
    this.logDebug('Sending message', content);
    if (this.isProcessing) {
      throw new Error('A message is already being processed');
    }

    try {
      this.isProcessing = true;
      this.logDebug('Processing message', { content });

      // Add current document state before user message
      if (this.documentContent) {
        this.logDebug('Adding document content to context', {
          context: this.documentContent,
        });
        this.context.push({
          role: 'system',
          content: `Current document content:\n\`\`\`markdown\n${this.documentContent}\n\`\`\``,
        });
      }

      // Add user message
      this.context.push({ role: 'user', content });

      // Ensure context doesn't exceed token limit
      this.truncateContext();

      // Get response
      const response = await this.makeRequest(this.context);

      this.logDebug('Response received', { response });

      // Add response to context
      this.context.push({ role: 'assistant', content: response });

      // Remove the document content message as it will be updated in next message
      if (this.documentContent) {
        this.context = this.context.filter(
          (msg) =>
            !(
              msg.role === 'system' &&
              msg.content.startsWith('Current document content:')
            ),
        );
      }

      return response;
    } finally {
      this.isProcessing = false;
    }
  }

  private truncateContext() {
    // Keep system message and last 10 messages
    if (this.context.length > 11) {
      const systemMessage = this.context[0];
      const recentMessages = this.context.slice(-10);
      this.context = [systemMessage, ...recentMessages];
    }
  }
}
