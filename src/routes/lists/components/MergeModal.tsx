import React, { type ChangeEventHandler, type MouseEventHandler } from 'react';

import { BottomSheet } from 'components/ui/BottomSheet';
import { Button } from 'components/ui/Button';
import Input from 'components/ui/Input';
import type { IList } from 'typings';

export interface IMergeModalProps {
  showModal: boolean;
  clearModal: () => void;
  listNames: string;
  mergeName: string;
  handleMergeConfirm: MouseEventHandler;
  handleMergeNameChange: ChangeEventHandler;
  selectedLists?: IList[];
}

const MergeModal: React.FC<IMergeModalProps> = (props): React.JSX.Element => {
  const selectedLists = props.selectedLists ?? [];
  const configurationIds = [...new Set(selectedLists.map((list) => list.list_item_configuration_id))];
  const hasMultipleConfigurations = configurationIds.length > 1;

  // Find the configuration that appears most frequently - that's the primary one to merge
  let primaryConfigurationId: string | undefined;
  if (configurationIds.length > 0) {
    const configurationCounts = configurationIds.map((configId) => ({
      configId,
      count: selectedLists.filter((list) => list.list_item_configuration_id === configId).length,
    }));
    primaryConfigurationId = configurationCounts.reduce((max, curr) => (curr.count > max.count ? curr : max)).configId;
  }

  const listsOfPrimaryConfiguration = primaryConfigurationId
    ? selectedLists.filter((list) => list.list_item_configuration_id === primaryConfigurationId)
    : [];
  const excludedLists = primaryConfigurationId
    ? selectedLists.filter((list) => list.list_item_configuration_id !== primaryConfigurationId)
    : [];

  return (
    <BottomSheet
      isOpen={props.showModal}
      onClose={props.clearModal}
      title={`Merge "${props.listNames}"`}
      testId="bottom-sheet"
    >
      {hasMultipleConfigurations && (
        <div
          className={
            'tw:mb-3 tw:rounded-lg tw:border tw:border-[var(--color-warning)] ' +
            'tw:bg-[var(--color-warning)]/10 tw:p-3'
          }
          data-test-id="merge-warning"
        >
          <strong>Note:</strong> Only lists of the same type can be merged. Some lists will be excluded.
        </div>
      )}

      {hasMultipleConfigurations && excludedLists.length > 0 && (
        <div
          className={
            'tw:mb-3 tw:rounded-lg tw:border tw:border-[var(--color-primary)] ' +
            'tw:bg-[var(--color-primary)]/10 tw:p-3'
          }
          data-test-id="merge-breakdown"
        >
          <strong>Lists to be merged ({listsOfPrimaryConfiguration.length}):</strong>
          <ul className="tw:mb-0 tw:mt-2 tw:pl-5 tw:list-disc">
            {listsOfPrimaryConfiguration.map((list) => (
              <li key={list.id}>{list.name}</li>
            ))}
          </ul>
          <strong className="tw:mt-2 tw:block">Lists excluded ({excludedLists.length}):</strong>
          <ul className="tw:mb-0 tw:mt-2 tw:pl-5 tw:list-disc">
            {excludedLists.map((list) => (
              <li key={list.id}>{list.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="tw:mb-4">
        <Input
          name="mergeName"
          id="mergeName"
          label="Name for the merged list"
          value={props.mergeName}
          onChange={props.handleMergeNameChange}
          placeholder="My super cool list"
        />
      </div>

      <div className="tw:flex tw:justify-end tw:gap-2">
        <Button variant="ghost" onClick={props.clearModal} data-test-id="clear-merge">
          Close
        </Button>
        <Button
          variant="primary"
          onClick={props.handleMergeConfirm}
          data-test-id="confirm-merge"
          disabled={!props.mergeName}
        >
          Merge lists
        </Button>
      </div>
    </BottomSheet>
  );
};

export default MergeModal;
