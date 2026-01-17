import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { BookmarkIcon } from '../icons';

export interface IBookmarkProps {
  handleClick: MouseEventHandler;
  read: boolean;
  testID: string;
}

const Bookmark: React.FC<IBookmarkProps> = (props): React.JSX.Element => (
  <Button variant="link" onClick={props.handleClick} className="p-0 me-3" data-test-id={props.testID}>
    <BookmarkIcon
      solid={props.read}
      size="2x"
      className="text-secondary"
      data-test-id={`${props.read ? 'read' : 'unread'}-bookmark-icon`}
    />
  </Button>
);

export default Bookmark;
