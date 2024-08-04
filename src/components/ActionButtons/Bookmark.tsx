import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

export interface IBookmarkProps {
  handleClick: MouseEventHandler;
  read: boolean;
  testID: string;
}

const Bookmark: React.FC<IBookmarkProps> = (props): React.JSX.Element => (
  <Button variant="link" onClick={props.handleClick} className="p-0 me-3" data-test-id={props.testID}>
    <i className={`${props.read ? 'fas' : 'far'} fa-bookmark fa-2x text-secondary`} />
  </Button>
);

export default Bookmark;
