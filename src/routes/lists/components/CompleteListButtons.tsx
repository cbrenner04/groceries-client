import React from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Refresh, Trash, Merge } from '../../../components/ActionButtons';
import type { IList } from '../../../typings';

interface ICompleteListButtonsProps {
  userId: string;
  list: IList;
  onListRefresh: (list: IList) => void;
  onListDeletion: (list: IList) => void;
  multiSelect: boolean;
  selectedLists: IList[];
  handleMerge: () => void;
  pending: boolean;
}

const CompleteListButtons: React.FC<ICompleteListButtonsProps> = (props) => {
  const userIsOwner = props.userId === props.list.owner_id;

  return (
    <ButtonGroup className="float-end">
      <Refresh
        handleClick={() => props.onListRefresh(props.list)}
        disabled={!userIsOwner || props.pending}
        classes={userIsOwner && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
        testID="complete-list-refresh"
      />
      {props.multiSelect && props.selectedLists.length > 1 && (
        <Merge handleClick={props.handleMerge} testID="complete-list-merge" disabled={props.pending} />
      )}
      <Trash
        handleClick={() => props.onListDeletion(props.list)}
        testID="complete-list-trash"
        disabled={props.pending}
      />
    </ButtonGroup>
  );
};

export default CompleteListButtons;
