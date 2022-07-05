import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Music from './Music';

function setup(suppliedProps = {}) {
  const user = userEvent.setup();
  const defaultProps = {
    artist: 'foo',
    clearArtist: false,
    handleClearArtist: jest.fn(),
    handleInput: jest.fn(),
    album: 'bar',
    clearAlbum: false,
    handleClearAlbum: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findByLabelText, findAllByRole } = render(<Music {...props} />);

  return { container, findByLabelText, findAllByRole, props, user };
}

describe('Music', () => {
  it('renders artist input enabled when clearArtist is false', async () => {
    const { container, findByLabelText } = setup({ clearArtist: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Artist')).toBeEnabled();
  });

  it('renders artist input disabled when clearArtist is true', async () => {
    const { container, findByLabelText } = setup({ clearArtist: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Artist')).toBeDisabled();
  });

  it('renders album input enabled when clearAlbum is false', async () => {
    const { container, findByLabelText } = setup({ clearArtist: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Album')).toBeEnabled();
  });

  it('renders album input disabled when clearAlbum is true', async () => {
    const { container, findByLabelText } = setup({ clearAlbum: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Album')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    const { findByLabelText, findAllByRole, props, user } = setup({ clearArtist: false });

    await user.type(await findByLabelText('Artist'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[0]);

    expect(props.handleClearArtist).toHaveBeenCalled();

    await user.type(await findByLabelText('Album'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click((await findAllByRole('checkbox'))[1]);

    expect(props.handleClearAlbum).toHaveBeenCalled();
  });
});
