import React, { MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface BookmarkProps {
  handleClick: MouseEventHandler;
  read: boolean;
  testID: string;
}

const Bookmark: React.FC<BookmarkProps> = ({ handleClick, read, testID }) => (
  <Button variant="link" onClick={handleClick} className="p-0 me-3" data-test-id={testID}>
    <i className={`${read ? 'fas' : 'far'} fa-bookmark fa-2x text-secondary`} />
  </Button>
);

export default Bookmark;
