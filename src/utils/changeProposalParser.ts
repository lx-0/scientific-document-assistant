import { ChangeProposal, ParsedMessage } from '../types/changeProposal';

export function parseChangeProposals(content: string): ParsedMessage {
  const proposals: ChangeProposal[] = [];
  let cleanContent = content;

  // Regular expression to match change proposals
  const proposalRegex =
    /<CHANGE-PROPOSAL[^>]*reason="([^"]*)"[^>]*>\s*<ORIGINAL[^>]*line="([^"]*)"[^>]*>([\s\S]*?)<\/ORIGINAL>\s*<PROPOSED>([\s\S]*?)<\/PROPOSED>\s*<\/CHANGE-PROPOSAL>/g;

  // Find all change proposals in the content
  let match;
  while ((match = proposalRegex.exec(content)) !== null) {
    const [fullMatch, reason, lineRange, originalText, proposedText] = match;

    // Parse line numbers safely
    const lineNumbers = lineRange.split('-').map(Number);
    if (lineNumbers.some(isNaN) || lineNumbers.length === 0) {
      console.warn('Invalid line numbers in proposal:', lineRange);
      continue;
    }

    const startLine = lineNumbers[0];
    const endLine = lineNumbers[1] || startLine;

    // Create proposal with required fields
    const proposal: ChangeProposal = {
      id: `proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      reason: reason.trim(),
      originalText: originalText.trim(),
      proposedText: proposedText.trim(),
      status: 'pending',
      location: {
        startLine,
        endLine,
        start: match.index,
        end: match.index + fullMatch.length,
      },
    };

    proposals.push(proposal);

    // Remove the proposal from the clean content
    cleanContent = cleanContent.replace(fullMatch, '');
  }

  return {
    content: cleanContent.trim(),
    proposals,
  };
}
