import React, { useState } from 'react';

import type {
  EUserPermissions,
  IListItem,
  IListItemField,
  IListItemFieldConfiguration,
  TUserPermissions,
} from 'typings';
import { ListItemRow } from 'components/domain/ListItemRow';
import { Badge } from 'components/ui/Badge';

export interface ICompletedItemsSectionProps {
  completedItems: IListItem[];
  permissions: EUserPermissions;
  permissionsDict?: TUserPermissions;
  selectedItems: IListItem[];
  pending: boolean;
  listItemFieldConfigurations: IListItemFieldConfiguration[];
  completeMultiSelect: boolean;
  setSelectedItems: (items: IListItem[]) => void;
  setCompleteMultiSelect: (value: boolean) => void;
  handleItemSelect: (item: IListItem) => void;
  handleItemComplete: (item: IListItem) => Promise<void>;
  handleItemEdit: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => Promise<void>;
  completedExpanded?: boolean;
  setCompletedExpanded?: (value: boolean) => void;
}

const CompletedItemsSection: React.FC<ICompletedItemsSectionProps> = (props): React.JSX.Element => {
  const [localExpanded, setLocalExpanded] = useState(props.completedExpanded ?? false);
  const expanded = props.setCompletedExpanded !== undefined ? props.completedExpanded : localExpanded;

  const handleToggle = (): void => {
    if (props.setCompletedExpanded) {
      props.setCompletedExpanded(!expanded);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  if (props.completedItems.length === 0) {
    return <React.Fragment />;
  }

  return (
    <div className="tw:mt-4 tw:mb-4">
      <button
        type="button"
        className="tw:flex tw:items-center tw:gap-2 tw:w-full tw:mb-2 tw:group tw:cursor-pointer"
        data-test-class="completed-header"
        onClick={handleToggle}
        aria-expanded={expanded}
      >
        <span
          className={
            'tw:text-sm tw:font-semibold tw:uppercase tw:tracking-wide ' +
            'tw:text-[var(--color-text-secondary)] tw:whitespace-nowrap'
          }
        >
          Completed
        </span>
        <Badge>{props.completedItems.length}</Badge>
        <div className="tw:flex-1 tw:h-px tw:bg-[var(--color-border)]" />
        <span
          className={
            'tw:text-[var(--color-text-tertiary)] tw:text-xs tw:transition-transform tw:duration-200' +
            (expanded ? '' : ' tw:-rotate-90')
          }
          aria-hidden
        >
          ▼
        </span>
      </button>
      {expanded && (
        <div className="tw:flex tw:flex-col tw:gap-2">
          {props.completedItems.map((item: IListItem) => {
            const findItem = (itemId: string): IListItem =>
              props.completedItems.find((i) => i.id === itemId) as IListItem;

            return (
              <ListItemRow
                key={item.id}
                item={item}
                listId={item.list_id}
                fields={(item.fields ?? []) as IListItemField[]}
                fieldConfigurations={props.listItemFieldConfigurations}
                isMultiSelectActive={props.completeMultiSelect}
                isSelected={props.selectedItems.some((selected) => selected.id === item.id)}
                onSelect={(itemId) => props.handleItemSelect(findItem(itemId))}
                onComplete={(itemId) => props.handleItemComplete(findItem(itemId))}
                onRefresh={(itemId) => props.handleItemRefresh(findItem(itemId))}
                onEdit={(itemId) => props.handleItemEdit(findItem(itemId))}
                onDelete={(itemId) => props.handleItemDelete(findItem(itemId))}
                permissions={props.permissionsDict ?? {}}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(CompletedItemsSection);
