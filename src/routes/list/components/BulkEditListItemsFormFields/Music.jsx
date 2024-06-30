import React from 'react';
import PropTypes from 'prop-types';

import { TextField } from '../../../../components/FormFields';

const Music = ({ artist, clearArtist, handleClearArtist, album, clearAlbum, handleClearAlbum, handleInput }) => (
  <>
    <TextField
      name="artist"
      label="Artist"
      value={artist}
      handleChange={handleInput}
      placeholder="Sir Mix-a-Lot"
      disabled={clearArtist}
      showClear={true}
      handleClear={handleClearArtist}
      clear={clearArtist}
    />
    <TextField
      name="album"
      label="Album"
      value={album}
      handleChange={handleInput}
      placeholder="Mack Daddy"
      disabled={clearAlbum}
      showClear={true}
      handleClear={handleClearAlbum}
      clear={clearAlbum}
    />
  </>
);

Music.propTypes = {
  artist: PropTypes.string.isRequired,
  clearArtist: PropTypes.bool.isRequired,
  handleClearArtist: PropTypes.func.isRequired,
  album: PropTypes.string.isRequired,
  clearAlbum: PropTypes.bool.isRequired,
  handleClearAlbum: PropTypes.func.isRequired,
  handleInput: PropTypes.func.isRequired,
};

export default Music;
