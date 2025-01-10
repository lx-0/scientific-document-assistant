export interface Location {
  startLine: number;
  endLine?: number;
  start: number;
  end: number;
}

export interface ChangeProposal {
  id: string;
  reason: string;
  originalText: string;
  proposedText: string;
  location?: Location;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ParsedMessage {
  content: string;
  proposals: ChangeProposal[];
}
