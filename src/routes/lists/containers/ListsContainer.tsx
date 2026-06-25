import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';
import { useNavigate } from 'react-router';

import axios from 'utils/api';
import { usePolling } from 'hooks';
import type { IList, IListItemConfiguration, TUserPermissions } from 'typings';

import { ListCard } from 'components/domain/ListCard';
import { MultiSelectBar, type IMultiSelectAction } from 'components/domain/MultiSelectBar';
import { CheckIcon, EditIcon, CompressIcon, RedoIcon, TrashIcon } from 'components/icons';
import { EmptyState } from 'components/domain/EmptyState';
import { BottomInputBar } from 'components/layout/BottomInputBar';
import { FilterChip, FilterChipGroup } from 'components/ui/FilterChip';
import { ConfirmDialog } from 'components/domain/ConfirmDialog';
import { BottomSheet } from 'components/ui/BottomSheet';
import Select from 'components/ui/Select';
import { Button } from 'components/ui/Button';
import {
  fetchLists,
  fetchListToEdit,
  sortLists,
  failure,
  type IFetchListsReturn,
  type IFetchListToEditReturn,
  pluralize,
} from '../utils';
import { listsDeduplicator } from 'utils/requestDeduplication';
import { listsCache } from 'utils/lightweightCache';
import { prefetchListsIdle } from 'utils/listPrefetch';
import MergeModal from '../components/MergeModal';
import EditListForm from './EditListForm';

type TStatusFilter = 'all' | 'pending' | 'active' | 'completed';

export interface IListsContainerProps {
  userId: string;
  pendingLists: IList[];
  completedLists: IList[];
  incompleteLists: IList[];
  currentUserPermissions: TUserPermissions;
  listItemConfigurations: IListItemConfiguration[];
  initialFilter?: TStatusFilter;
  initialEditListId?: string | null;
}

const MAX_PREFETCH_LISTS = 5;

const ListsContainer: React.FC<IListsContainerProps> = (props): React.JSX.Element => {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [incompleteLists, setIncompleteLists] = useState(props.incompleteLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [listItemConfigurations, setListItemConfigurations] = useState(props.listItemConfigurations);
  const [, setPending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TStatusFilter>(props.initialFilter ?? 'all');
  const [multiSelectActive, setMultiSelectActive] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());
  const [listsToDelete, setListsToDelete] = useState<IList[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listsToReject, setListsToReject] = useState<IList[]>([]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [listsToMerge, setListsToMerge] = useState<IList[]>([]);
  const [mergeName, setMergeName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(props.listItemConfigurations[0]?.id ?? '');
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingList, setEditingList] = useState<IFetchListToEditReturn | null>(null);
  const navigate = useNavigate();

  const openEditSheet = useCallback(
    async (listId: string): Promise<void> => {
      const data = await fetchListToEdit({ id: listId, navigate });
      if (data) {
        setEditingList(data);
        setEditSheetOpen(true);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (props.initialEditListId) {
      void openEditSheet(props.initialEditListId);
    }
  }, [props.initialEditListId, openEditSheet]);

  const closeEditSheet = (): void => {
    setEditSheetOpen(false);
    setEditingList(null);
  };

  const handleEditSaved = (): void => {
    void listsDeduplicator
      .execute('lists', () => fetchLists({ navigate }))
      .then((lists) => {
        if (!lists) {
          return;
        }
        const {
          pendingLists: updatedPending,
          completedLists: updatedCompleted,
          incompleteLists: updatedIncomplete,
          currentUserPermissions: updatedCurrentUserPermissions,
          listItemConfigurations: updatedListItemConfigurations,
        } = lists as IFetchListsReturn;
        setPendingLists(updatedPending);
        setCompletedLists(updatedCompleted);
        setIncompleteLists(updatedIncomplete);
        setCurrentUserPermissions(updatedCurrentUserPermissions);
        setListItemConfigurations(updatedListItemConfigurations);
      });
  };

  usePolling(
    async () => {
      try {
        const lists = await listsDeduplicator.execute('lists', () => fetchLists({ navigate }));
        /* istanbul ignore else */
        if (lists) {
          const {
            pendingLists: updatedPending,
            completedLists: updatedCompleted,
            incompleteLists: updatedIncomplete,
            currentUserPermissions: updatedCurrentUserPermissions,
            listItemConfigurations: updatedListItemConfigurations,
          } = lists as IFetchListsReturn;

          const pendingResult = listsCache.get('lists-pending', updatedPending);
          const completedResult = listsCache.get('lists-completed', updatedCompleted);
          const incompleteResult = listsCache.get('lists-incomplete', updatedIncomplete);
          const permissionsResult = listsCache.get('lists-permissions', updatedCurrentUserPermissions);
          const configurationsResult = listsCache.get('lists-configurations', updatedListItemConfigurations);

          if (pendingResult.hasChanged) {
            setPendingLists(updatedPending);
          }
          if (completedResult.hasChanged) {
            setCompletedLists(updatedCompleted);
          }
          if (incompleteResult.hasChanged) {
            setIncompleteLists(updatedIncomplete);
          }
          if (permissionsResult.hasChanged) {
            setCurrentUserPermissions(updatedCurrentUserPermissions);
          }
          if (configurationsResult.hasChanged) {
            setListItemConfigurations(updatedListItemConfigurations);
          }
        }
      } catch {
        const errorMessage = 'You may not be connected to the internet. Please check your connection.';
        showToast.error(`${errorMessage} Data may be incomplete and user actions may not persist.`);
      }
    },
    parseInt(import.meta.env.VITE_POLLING_INTERVAL ?? '10000', 10),
  );

  useEffect(() => {
    if (import.meta.env.VITE_PREFETCH_IDLE === 'false') {
      return;
    }

    const allVisibleLists = [...pendingLists, ...incompleteLists];
    const listIds = allVisibleLists
      .slice(0, MAX_PREFETCH_LISTS)
      .filter((list): list is IList & { id: string } => typeof list.id === 'string' && list.id.length > 0)
      .map((list) => list.id);

    if (listIds.length > 0) {
      void prefetchListsIdle(listIds);
    }
  }, [pendingLists, incompleteLists]);

  const resetMultiSelect = (): void => {
    setSelectedListIds(new Set());
    setMultiSelectActive(false);
  };

  const getSelectedLists = (): IList[] => {
    const allLists = [...pendingLists, ...incompleteLists, ...completedLists];
    return allLists.filter((list) => selectedListIds.has(list.id ?? ''));
  };

  const handleSelect = (listId: string): void => {
    setSelectedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const handleCreateList = (name: string): void => {
    setPending(true);
    const list = { name, list_item_configuration_id: selectedTemplateId };
    axios
      .post('/lists', { list })
      .then((response) => {
        const updatedCurrentUserPermissions = update(currentUserPermissions, {
          [response.data.id]: { $set: 'write' },
        });
        setCurrentUserPermissions(updatedCurrentUserPermissions);
        const updatedIncompleteLists = update(incompleteLists, { $push: [response.data] });
        setIncompleteLists(sortLists(updatedIncompleteLists));
        setPending(false);
        showToast.info('List successfully added.');
      })
      .catch((error) => {
        failure(error, navigate, setPending);
      });
  };

  const handleDelete = (listId: string): void => {
    const selected = getSelectedLists();
    const listsForDeletion = selected.length > 0 ? selected : findListById(listId);
    setListsToDelete(listsForDeletion);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (listToDelete?: IList[]): Promise<void> => {
    const listIds = listToDelete || listsToDelete;
    setShowDeleteConfirm(false);
    setPending(true);

    try {
      const requests = listIds.map(async (list) => {
        if (props.userId === list.owner_id) {
          await axios.delete(`/lists/${list.id}`);
        } else {
          await axios.patch(`/lists/${list.id}/users_lists/${list.users_list_id}`, {
            users_list: { has_accepted: false },
          });
        }
      });

      await Promise.all(requests);

      const deletedIds = listIds.map((l) => l.id);
      setIncompleteLists((prev) => sortLists(prev.filter((l) => !deletedIds.includes(l.id))));
      setCompletedLists((prev) => sortLists(prev.filter((l) => !deletedIds.includes(l.id))));
      setPendingLists((prev) => sortLists(prev.filter((l) => !deletedIds.includes(l.id))));

      resetMultiSelect();
      setListsToDelete([]);
      setPending(false);
      showToast.info(`${pluralize(listIds.length)} successfully deleted.`);
    } catch (error: unknown) {
      failure(error, navigate, setPending);
    }
  };

  const handleMerge = (): void => {
    const selected = getSelectedLists();
    const configId = selected[0]?.list_item_configuration_id;
    const filteredLists = selected.filter((l) => l.list_item_configuration_id === configId);
    setListsToMerge(filteredLists);
    setShowMergeModal(true);
  };

  const handleMergeConfirm = async (): Promise<void> => {
    setShowMergeModal(false);
    setPending(true);
    const listIds = listsToMerge.map((l) => l.id).join(',');
    try {
      const { data } = await axios.post('/lists/merge_lists', {
        merge_lists: { list_ids: listIds, new_list_name: mergeName },
      });
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      const updatedIncompleteLists = update(incompleteLists, { $push: [data] });
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      setIncompleteLists(sortLists(updatedIncompleteLists));
      resetMultiSelect();
      setListsToMerge([]);
      setMergeName('');
      setPending(false);
      showToast.info('Lists successfully merged.');
    } catch (err) {
      failure(err, navigate, setPending);
    }
  };

  const handleCompletion = (listId: string): void => {
    const selected = getSelectedLists();
    const listsToComplete = selected.length > 0 ? selected : findListById(listId);
    const ownedLists = listsToComplete.filter((l) => props.userId === l.owner_id && !l.completed);
    const ownedListIds = ownedLists.map((l) => l.id);
    const updateRequests = ownedLists.map((l) => axios.put(`/lists/${l.id}`, { list: { completed: true } }));

    setPending(true);
    Promise.all(updateRequests)
      .then(() => {
        const updatedIncompleteLists = incompleteLists.filter((l) => !ownedListIds.includes(l.id));
        setIncompleteLists(sortLists(updatedIncompleteLists));
        let updatedCompletedLists = completedLists;
        ownedLists.forEach((l) => {
          l.completed = true;
          updatedCompletedLists = update(updatedCompletedLists, { $push: [l] });
        });
        setCompletedLists(sortLists(updatedCompletedLists));
        resetMultiSelect();
        setPending(false);
        showToast.info(`${pluralize(ownedLists.length)} successfully completed.`);
      })
      .catch((error) => {
        failure(error, navigate, setPending);
      });
  };

  const handleRefresh = (listId: string): void => {
    const selected = getSelectedLists();
    const listsToRefresh = selected.length > 0 ? selected : findListById(listId);
    const ownedLists = listsToRefresh.filter((l) => props.userId === l.owner_id);
    ownedLists.forEach((l) => {
      l.refreshed = true;
    });
    const refreshRequests = ownedLists.map((l) => axios.post(`/lists/${l.id}/refresh_list`, {}));

    setPending(true);
    Promise.all(refreshRequests)
      .then((responses) => {
        let updatedCurrentUserPermissions = currentUserPermissions;
        let updatedIncompleteLists = incompleteLists;
        responses.forEach((response) => {
          updatedCurrentUserPermissions = update(updatedCurrentUserPermissions, {
            [response.data.id]: { $set: 'write' },
          });
          updatedIncompleteLists = update(updatedIncompleteLists, { $push: [response.data] });
        });
        setCurrentUserPermissions(updatedCurrentUserPermissions);
        setIncompleteLists(sortLists(updatedIncompleteLists));
        resetMultiSelect();
        setPending(false);
        showToast.info(`${pluralize(ownedLists.length)} successfully refreshed.`);
      })
      .catch((error) => {
        failure(error, navigate, setPending);
      });
  };

  const handleAccept = async (listId: string): Promise<void> => {
    const selected = getSelectedLists();
    const listsToAccept = selected.length > 0 ? selected : findListById(listId);
    const requests = listsToAccept.map((l) =>
      axios.patch(`/lists/${l.id}/users_lists/${l.users_list_id}`, { users_list: { has_accepted: true } }),
    );

    setPending(true);
    try {
      await Promise.all(requests);
      let updatedCompletedLists = completedLists;
      let updatedIncompleteLists = incompleteLists;
      let updatedPendingLists = pendingLists;
      const updatedPermissions = { ...currentUserPermissions };
      listsToAccept.forEach((l) => {
        // Update the list to mark it as accepted
        const acceptedList = { ...l, has_accepted: true };
        if (l.completed) {
          updatedCompletedLists = update(updatedCompletedLists, { $push: [acceptedList] });
        } else {
          updatedIncompleteLists = update(updatedIncompleteLists, { $push: [acceptedList] });
        }
        updatedPendingLists = updatedPendingLists.filter((ll) => ll.id !== l.id);
        // Update permissions so the list no longer renders as pending
        if (l.id) {
          updatedPermissions[l.id] = 'write';
        }
      });
      setCompletedLists(sortLists(updatedCompletedLists));
      setIncompleteLists(sortLists(updatedIncompleteLists));
      setPendingLists(updatedPendingLists);
      setCurrentUserPermissions(updatedPermissions);
      resetMultiSelect();
      setPending(false);
      showToast.info(`${pluralize(listsToAccept.length)} successfully accepted.`);
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const handleReject = (listId: string): void => {
    const selected = getSelectedLists();
    const listsForRejection = selected.length > 0 ? selected : findListById(listId);
    setListsToReject(listsForRejection);
    setShowRejectConfirm(true);
  };

  const handleClick = (listId: string): void => {
    navigate(`/lists/${listId}`);
  };

  const handleShare = (listId: string): void => {
    navigate(`/lists/${listId}/users_lists`);
  };

  const handleEdit = (listId: string): void => {
    void openEditSheet(listId);
  };

  const findListById = (listId: string): IList[] => {
    const allLists = [...pendingLists, ...incompleteLists, ...completedLists];
    const found = allLists.find((l) => l.id === listId);
    return found ? [found] : [];
  };

  const getFilteredLists = (): { pending: IList[]; active: IList[]; completed: IList[] } => {
    switch (statusFilter) {
      case 'pending':
        return { pending: pendingLists, active: [], completed: [] };
      case 'active':
        return { pending: [], active: incompleteLists, completed: [] };
      case 'completed':
        return { pending: [], active: [], completed: completedLists };
      default:
        return { pending: pendingLists, active: incompleteLists, completed: completedLists };
    }
  };

  const getEmptyStateContent = (): { title: string; description: string } | null => {
    const allListsEmpty = pendingLists.length === 0 && incompleteLists.length === 0 && completedLists.length === 0;

    switch (statusFilter) {
      case 'pending':
        if (pendingLists.length === 0) {
          return {
            title: 'No pending lists',
            description: 'When another user has shared a list with you you will accept it here.',
          };
        }
        return null;
      case 'active':
        if (incompleteLists.length === 0) {
          return {
            title: 'No active lists',
            description: 'Create a list or accept a shared list to get started.',
          };
        }
        return null;
      case 'completed':
        if (completedLists.length === 0) {
          return {
            title: 'No completed lists',
            description: 'Complete a list to see it here.',
          };
        }
        return null;
      default:
        if (allListsEmpty) {
          return {
            title: 'No lists yet',
            description: 'Create a list to get started or wait for someone to share one with you.',
          };
        }
        return null;
    }
  };

  const filtered = getFilteredLists();
  const hideBottomInputBar = showDeleteConfirm || showRejectConfirm || showMergeModal || editSheetOpen;
  const templateOptions = listItemConfigurations.map((config) => ({
    value: config.id,
    label: config.name,
  }));
  const selectedLists = getSelectedLists();
  const selectedCount = selectedListIds.size;
  const selectedList = selectedCount === 1 ? selectedLists[0] : null;
  const selectedListId = selectedList?.id ?? null;
  const canEditSelectedList = Boolean(selectedList?.owner_id && props.userId === selectedList.owner_id);

  const allSelectedIncomplete =
    selectedCount > 0 &&
    selectedLists.every((l) => !l.completed && l.has_accepted !== null && l.has_accepted !== undefined);
  const allSelectedCompleted = selectedCount > 0 && selectedLists.every((l) => !!l.completed);

  const getListMultiSelectActions = (): IMultiSelectAction[] => {
    const actions: IMultiSelectAction[] = [];
    if (allSelectedIncomplete) {
      actions.push({
        icon: <CheckIcon />,
        label: 'Complete',
        onClick: (): void => handleCompletion(''),
        variant: 'success',
        testId: 'multi-select-complete',
      });
    }
    if (allSelectedCompleted) {
      actions.push({
        icon: <RedoIcon />,
        label: 'Refresh',
        onClick: (): void => handleRefresh(''),
        variant: 'primary',
        testId: 'multi-select-refresh',
      });
    }
    if (selectedCount === 1 && canEditSelectedList && selectedListId) {
      actions.push({
        icon: <EditIcon />,
        label: 'Edit',
        onClick: (): void => handleEdit(selectedListId),
        variant: 'warning',
        testId: 'multi-select-edit',
      });
    }
    const configIdCounts = selectedLists.reduce<Record<string, number>>((acc, l) => {
      const id = l.list_item_configuration_id ?? '';
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {});
    const hasMergeablePair = Object.values(configIdCounts).some((count) => count >= 2);
    if (hasMergeablePair) {
      actions.push({
        icon: <CompressIcon />,
        label: 'Merge',
        onClick: handleMerge,
        testId: 'multi-select-merge',
      });
    }
    actions.push({
      icon: <TrashIcon />,
      label: 'Delete',
      onClick: (): void => handleDelete(''),
      variant: 'danger',
      testId: 'multi-select-delete',
    });
    return actions;
  };

  const renderListCard = (list: IList): React.JSX.Element => (
    <ListCard
      key={list.id}
      list={list}
      userId={props.userId}
      currentUserPermissions={currentUserPermissions}
      isMultiSelectActive={multiSelectActive}
      isSelected={selectedListIds.has(list.id ?? '')}
      onSelect={handleSelect}
      onComplete={handleCompletion}
      onShare={handleShare}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      onAccept={handleAccept}
      onReject={handleReject}
      onClick={handleClick}
      templateName={props.listItemConfigurations.find((c) => c.id === list.list_item_configuration_id)?.name}
    />
  );

  return (
    <div className="tw:pb-[calc(var(--spacing-input-bar-height)+var(--spacing-nav-height)+1rem)]">
      <div className="tw:flex tw:justify-between tw:items-center tw:mb-4">
        <h1
          className="tw:text-lg tw:font-semibold tw:text-[var(--color-text-primary)] tw:m-0"
          data-test-id="page-title"
        >
          {props.initialFilter === 'completed' ? 'Completed' : 'Lists'}
        </h1>
        <div className="tw:flex tw:items-center tw:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(): void => {
              if (multiSelectActive && selectedCount > 0) {
                setSelectedListIds(new Set());
              }
              setMultiSelectActive(!multiSelectActive);
            }}
          >
            {multiSelectActive ? 'Cancel' : 'Select Lists'}
          </Button>
        </div>
      </div>

      {props.initialFilter !== 'completed' && (
        <FilterChipGroup className="tw:mb-4">
          <FilterChip
            label="All"
            active={statusFilter === 'all'}
            onClick={(): void => setStatusFilter('all')}
            testId="filter-all"
          />
          <FilterChip
            label="Pending"
            active={statusFilter === 'pending'}
            onClick={(): void => setStatusFilter('pending')}
            testId="filter-pending"
          />
          <FilterChip
            label="Active"
            active={statusFilter === 'active'}
            onClick={(): void => setStatusFilter('active')}
            testId="filter-active"
          />
          <FilterChip
            label="Completed"
            active={statusFilter === 'completed'}
            onClick={(): void => setStatusFilter('completed')}
            testId="filter-completed"
          />
        </FilterChipGroup>
      )}

      {multiSelectActive && selectedCount > 0 && (
        <div className="tw:mb-4">
          <MultiSelectBar
            selectedCount={selectedCount}
            onClose={resetMultiSelect}
            actions={getListMultiSelectActions()}
          />
        </div>
      )}

      {filtered.pending.length > 0 && (
        <div
          className={
            'tw:mb-4 tw:p-3 tw:rounded-lg tw:border ' +
            'tw:border-[var(--color-warning)] tw:bg-[var(--color-warning)]/10'
          }
          data-test-id="pending-alert"
        >
          You have {filtered.pending.length} {filtered.pending.length === 1 ? 'list' : 'lists'} waiting for your
          response.
        </div>
      )}

      {((): React.JSX.Element => {
        const emptyStateContent = getEmptyStateContent();
        return emptyStateContent ? (
          <EmptyState
            title={emptyStateContent.title}
            description={emptyStateContent.description}
            testId="empty-state"
          />
        ) : (
          <div className="tw:flex tw:flex-col tw:gap-2">
            {filtered.pending.map(renderListCard)}
            {filtered.active.map(renderListCard)}
            {filtered.completed.map(renderListCard)}
            {statusFilter === 'completed' && filtered.completed.length > 0 && props.initialFilter !== 'completed' && (
              <button
                type="button"
                className="tw:text-sm tw:text-[var(--color-primary)] tw:cursor-pointer tw:mt-2"
                onClick={(): void => {
                  navigate('/completed_lists');
                }}
                data-test-id="view-all-completed-lists"
              >
                View all completed lists
              </button>
            )}
          </div>
        );
      })()}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={(): void => setShowDeleteConfirm(false)}
        onConfirm={(): void => {
          void handleDeleteConfirm();
        }}
        title="delete"
        body={
          <React.Fragment>
            <p>
              Are you sure you want to remove the following lists? Lists you own will be deleted completely. Lists you
              do not own will continue to exist for the owner, you will just be removed from the list of users.
            </p>
            <p>{listsToDelete.map((list) => list.name).join(', ')}</p>
          </React.Fragment>
        }
        confirmText="Yes, I'm sure."
        testId="delete-confirm-dialog"
      />
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={(): void => setShowRejectConfirm(false)}
        onConfirm={(): void => {
          setShowRejectConfirm(false);
          void handleDeleteConfirm(listsToReject);
        }}
        title="reject"
        body={
          <React.Fragment>
            <p>Are you sure you want to reject the following lists?</p>
            <p>{listsToReject.map((list) => list.name).join(', ')}</p>
          </React.Fragment>
        }
        confirmText="Yes, I'm sure."
        testId="reject-confirm-dialog"
      />
      <MergeModal
        showModal={showMergeModal}
        clearModal={(): void => setShowMergeModal(false)}
        listNames={listsToMerge.map((l) => l.name).join('", "')}
        mergeName={mergeName}
        handleMergeNameChange={
          ((event: ChangeEvent<HTMLInputElement>) =>
            setMergeName(event.target.value)) as React.ChangeEventHandler<HTMLInputElement>
        }
        handleMergeConfirm={(): void => {
          void handleMergeConfirm();
        }}
        selectedLists={selectedLists}
      />

      <BottomSheet
        isOpen={editSheetOpen && editingList !== null}
        onClose={closeEditSheet}
        title="Edit List"
        testId="edit-list-sheet"
      >
        {editingList && (
          <EditListForm
            listId={editingList.listId}
            name={editingList.name}
            completed={editingList.completed}
            refreshed={editingList.refreshed}
            archivedAt={editingList.archivedAt}
            listItemConfigurationId={editingList.list_item_configuration_id}
            onClose={closeEditSheet}
            onSaved={handleEditSaved}
          />
        )}
      </BottomSheet>

      <BottomInputBar
        placeholder="Create a new list..."
        onSubmit={handleCreateList}
        submitLabel="Create"
        hidden={hideBottomInputBar || props.initialFilter === 'completed'}
        expandedContent={
          <Select
            label="Template"
            options={templateOptions}
            value={selectedTemplateId}
            onChange={(e: ChangeEvent<HTMLSelectElement>): void => setSelectedTemplateId(e.target.value)}
            id="list_item_configuration_id"
            testId="list_item_configuration_id"
          />
        }
        initialExpanded={false}
        allowEnterSubmitWhenExpanded
      />
    </div>
  );
};

export default ListsContainer;
