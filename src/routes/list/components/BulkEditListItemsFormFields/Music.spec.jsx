import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Music from './Music';

describe('Music', () => {
  const props = {
    artist: 'foo',
    clearArtist: false,
    handleClearArtist: jest.fn(),
    handleInput: jest.fn(),
    album: 'bar',
    clearAlbum: false,
    handleClearAlbum: jest.fn(),
  };

  it('renders artist input enabled when clearArtist is false', () => {
    props.clearArtist = false;
    const { container, getByLabelText } = render(<Music {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Artist')).toBeEnabled();
  });

  it('renders artist input disabled when clearArtist is true', () => {
    props.clearArtist = true;
    const { container, getByLabelText } = render(<Music {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Artist')).toBeDisabled();
  });

  it('renders album input enabled when clearAlbum is false', () => {
    props.clearAlbum = false;
    const { container, getByLabelText } = render(<Music {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Album')).toBeEnabled();
  });

  it('renders album input disabled when clearAlbum is true', () => {
    props.clearAlbum = true;
    const { container, getByLabelText } = render(<Music {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Album')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    props.clearArtist = false;
    const { getByLabelText, getAllByRole } = render(<Music {...props} />);

    fireEvent.change(getByLabelText('Artist'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(props.handleClearArtist).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Album'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getAllByRole('checkbox')[1]);

    expect(props.handleClearAlbum).toHaveBeenCalled();
  });
});
