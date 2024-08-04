import React from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Complete, EditLink, Merge, Share, Trash } from 'components/ActionButtons';
import type { IList } from 'typings';

export interface IIncompleteListButtonsProps {
  userId: string;
  list: IList;
  onListCompletion: (list: IList) => void;
  onListDeletion: (list: IList) => void;
  currentUserPermissions: string;
  multiSelect: boolean;
  handleMerge: () => void;
  selectedLists: IList[];
  pending: boolean;
}

const IncompleteListButtons: React.FC<IIncompleteListButtonsProps> = (props): React.JSX.Element => {
  const userIsOwner = props.userId === props.list.owner_id;
  const multipleListsSelected = props.multiSelect && props.selectedLists.length > 1;
  const userCanShare = props.currentUserPermissions === 'write';

  return (
    <ButtonGroup className="float-end">
      <Complete
        handleClick={(): void => props.onListCompletion(props.list)}
        disabled={!userIsOwner || props.pending}
        classes={userIsOwner && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
        testID="incomplete-list-complete"
      />
      {!multipleListsSelected && (
        <Share
          to={`${props.list.id}/users_lists`}
          disabled={!userCanShare || props.pending}
          classes={userCanShare && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
          testID="incomplete-list-share"
        />
      )}
      {multipleListsSelected && (
        <Merge handleClick={props.handleMerge} testID="incomplete-list-merge" disabled={props.pending} />
      )}
      {!multipleListsSelected && (
        <EditLink
          to={`${props.list.id}/edit`}
          disabled={!userIsOwner || props.pending}
          classes={userIsOwner && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
          testID="incomplete-list-edit"
        />
      )}
      <Trash
        handleClick={(): void => props.onListDeletion(props.list)}
        testID="incomplete-list-trash"
        disabled={props.pending}
      />
    </ButtonGroup>
  );
};

export default IncompleteListButtons;
