import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import type { IV2ListItem } from 'typings';

export interface IMultiSelectMenuProps {
  isMultiSelect: boolean;
  setCopy: (bool: boolean) => void;
  setMove: (bool: boolean) => void;
  selectedItems: IV2ListItem[];
  setSelectedItems: (items: IV2ListItem[]) => void;
  setMultiSelect: (bool: boolean) => void;
}

const MultiSelectMenu: React.FC<IMultiSelectMenuProps> = (props): React.JSX.Element => {
  return (
    <div className="clearfix">
      {props.isMultiSelect && (
        <ButtonGroup aria-label="copy or move items">
          <Button variant="link" onClick={(): void => props.setCopy(true)}>
            Copy to list
          </Button>
          <Button variant="link" onClick={(): void => props.setMove(true)}>
            Move to list
          </Button>
        </ButtonGroup>
      )}
      <Button
        variant="link"
        className="mx-auto float-end"
        onClick={(): void => {
          if (props.isMultiSelect && props.selectedItems.length > 0) {
            props.setSelectedItems([]);
          }
          props.setMultiSelect(!props.isMultiSelect);
        }}
      >
        {props.isMultiSelect ? 'Hide' : ''} Select
      </Button>
    </div>
  );
};

export default MultiSelectMenu;
