import React from 'react';
import { BookIcon, ShoppingBagIcon, MusicIcon, FileIcon, ListIcon } from '../../../components/icons';
import EListType from '../../../typings/EListType';

const listIcon = (listType: EListType): React.ReactElement => {
  const iconProps = { className: 'text-secondary me-3' };
  switch (listType) {
    case EListType.BOOK_LIST:
      return React.createElement(BookIcon, iconProps);
    case EListType.GROCERY_LIST:
      return React.createElement(ShoppingBagIcon, iconProps);
    case EListType.MUSIC_LIST:
      return React.createElement(MusicIcon, iconProps);
    case EListType.SIMPLE_LIST:
      return React.createElement(FileIcon, iconProps);
    case EListType.TO_DO_LIST:
      return React.createElement(ListIcon, iconProps);
  }
};

export default listIcon;
