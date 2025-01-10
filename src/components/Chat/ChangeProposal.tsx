import React from 'react';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { ChangeProposal } from '../../types/changeProposal';

interface ChangeProposalViewProps {
  proposal: ChangeProposal;
  onAccept: () => void;
  onReject: () => void;
}

export function ChangeProposalView({
  proposal,
  onAccept,
  onReject,
}: ChangeProposalViewProps) {
  if (proposal.status !== 'pending') {
    return (
      <div
        className={clsx(
          'mt-2 rounded-lg p-4',
          proposal.status === 'accepted'
            ? 'bg-green-50 border border-green-100'
            : 'bg-red-50 border border-red-100',
        )}
      >
        <div
          className={clsx(
            'text-sm font-medium',
            proposal.status === 'accepted' ? 'text-green-800' : 'text-red-800',
          )}
        >
          Change {proposal.status}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-4">
      <div className="mb-2 text-sm font-medium text-blue-800">
        Suggested Change
        {proposal.location?.startLine && (
          <span className="ml-2 text-blue-600">
            {proposal.location.startLine === proposal.location.endLine
              ? `Line ${proposal.location.startLine}`
              : `Lines ${proposal.location.startLine}-${proposal.location.endLine}`}
          </span>
        )}
      </div>
      {proposal.reason && (
        <div className="mb-3 text-sm text-blue-600">
          Reason: {proposal.reason}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onReject}
          className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <X className="h-4 w-4" />
          Reject
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
      </div>
    </div>
  );
}
