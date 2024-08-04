import React, { type ReactElement, type ReactNode } from 'react';
import { Button } from 'react-bootstrap';

import type { IList } from 'typings';

export interface IListsProps {
  title: ReactElement;
  multiSelect: boolean;
  selectedLists: IList[];
  setSelectedLists: (lists: IList[]) => void;
  setMultiSelect: (select: boolean) => void;
  children: ReactNode[];
}

const Lists: React.FC<IListsProps> = (props): React.JSX.Element => {
  return (
    <div className="mb-4">
      <div className="clearfix">
        <div className="mx-auto float-start">{props.title}</div>
        <Button
          variant="link"
          className="mx-auto float-end"
          onClick={(): void => {
            if (props.multiSelect && props.selectedLists.length > 0) {
              props.setSelectedLists([]);
            }
            props.setMultiSelect(!props.multiSelect);
          }}
        >
          {props.multiSelect ? 'Hide' : ''} Select
        </Button>
      </div>
      {props.children}
    </div>
  );
};

export default Lists;
