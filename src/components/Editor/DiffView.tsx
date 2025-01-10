import React from 'react';
import { diffLines, Change } from 'diff';
import { ChangeProposal } from '../../types/changeProposal';

interface DiffViewProps {
  originalContent: string;
  newContent: string;
  pendingProposals?: ChangeProposal[];
}

export function DiffView({
  originalContent,
  newContent,
  pendingProposals = [],
}: DiffViewProps) {
  const diff = diffLines(originalContent, newContent);
  const lines = originalContent.split('\n');

  // Create a map of line numbers to proposals
  const proposalsByLine = new Map<number, ChangeProposal>();
  pendingProposals.forEach((proposal) => {
    if (proposal.location?.startLine) {
      for (
        let i = proposal.location.startLine;
        i <= (proposal.location.endLine || proposal.location.startLine);
        i++
      ) {
        proposalsByLine.set(i, proposal);
      }
    }
  });

  let currentLine = 1;

  return (
    <div className="overflow-x-auto rounded-md bg-white p-2 font-mono text-sm">
      {diff.map((part, index) => {
        const lineCount = part.value.split('\n').length - 1;
        const proposal = proposalsByLine.get(currentLine);

        const element = (
          <div
            key={index}
            className={`whitespace-pre-wrap ${
              part.added
                ? 'bg-green-50 text-green-700'
                : part.removed
                  ? 'bg-red-50 text-red-700'
                  : proposal
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'text-gray-700'
            }`}
          >
            <span className="select-none pr-2 text-gray-400">
              {part.added ? '+' : part.removed ? '-' : ' '}
            </span>
            {proposal ? (
              <>
                <span className="line-through">{part.value}</span>
                <div className="bg-yellow-100 px-2 py-1">
                  <div className="text-xs text-yellow-600">
                    Suggested change:
                  </div>
                  {proposal.proposedText}
                </div>
              </>
            ) : (
              part.value
            )}
          </div>
        );

        if (!part.removed) {
          currentLine += lineCount;
        }

        return element;
      })}
    </div>
  );
}
