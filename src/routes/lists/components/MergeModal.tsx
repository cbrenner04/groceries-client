import React, { type ChangeEventHandler, type MouseEventHandler, useEffect } from 'react';

import { Button } from 'components/ui/Button';
import { TextField } from 'components/FormFields';
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

const MergeModal: React.FC<IMergeModalProps> = (props): React.JSX.Element | null => {
  const selectedLists = props.selectedLists ?? [];
  const configurationIds = [...new Set(selectedLists.map((list) => list.list_item_configuration_id))];
  const hasMultipleConfigurations = configurationIds.length > 1;
  const primaryConfigurationId = configurationIds[0];
  const listsOfPrimaryConfiguration = selectedLists.filter(
    (list) => list.list_item_configuration_id === primaryConfigurationId,
  );
  const excludedLists = selectedLists.filter((list) => list.list_item_configuration_id !== primaryConfigurationId);

  useEffect(() => {
    if (!props.showModal) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        props.clearModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, [props.showModal, props.clearModal]);

  if (!props.showModal) {
    return null;
  }

  return (
    <>
      <div className="tw:fixed tw:inset-0 tw:z-[1050] tw:bg-black/50" onClick={props.clearModal} />
      <div
        className="tw:fixed tw:inset-0 tw:z-[1055] tw:flex tw:items-center tw:justify-center tw:p-4"
        role="dialog"
        aria-modal="true"
        onClick={props.clearModal}
      >
        <div
          className={'tw:bg-[var(--color-surface)] tw:rounded-lg tw:shadow-xl tw:w-full tw:max-w-lg tw:border-0'}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3"
            style={{ borderBottom: '1px solid #e5e7eb' }}
          >
            <h5 className="tw:text-lg tw:font-medium tw:m-0">Merge {`"${props.listNames}"`}</h5>
            <button
              type="button"
              className={
                'tw:text-[var(--color-text-tertiary)] tw:hover:text-[var(--color-text-primary)] ' +
                'tw:text-xl tw:leading-none tw:p-1'
              }
              aria-label="Close"
              onClick={props.clearModal}
            >
              &times;
            </button>
          </div>
          <div className="tw:px-4 tw:py-3">
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

            <div>
              <TextField
                name="mergeName"
                label="Name for the merged list"
                value={props.mergeName}
                handleChange={props.handleMergeNameChange}
                placeholder="My super cool list"
              />
            </div>
          </div>
          <div className="tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:py-3" style={{ borderTop: '1px solid #e5e7eb' }}>
            <Button variant="secondary" onClick={props.clearModal} data-test-id={'clear-merge'}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={props.handleMergeConfirm}
              data-test-id={'confirm-merge'}
              disabled={!props.mergeName}
            >
              Merge lists
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MergeModal;
