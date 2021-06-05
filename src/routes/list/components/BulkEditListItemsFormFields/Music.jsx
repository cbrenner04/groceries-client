import React from 'react';
import PropTypes from 'prop-types';

import { CheckboxField, TextField } from '../../../../components/FormFields';

const Music = ({ artist, clearArtist, handleClearArtist, album, clearAlbum, handleClearAlbum, handleInput }) => (
  <>
    <TextField
      name="artist"
      label="Artist"
      value={artist}
      handleChange={handleInput}
      placeholder="Sir Mix-a-Lot"
      disabled={clearArtist}
      child={
        <CheckboxField
          name="clearArtist"
          label="Clear artist"
          handleChange={handleClearArtist}
          value={clearArtist}
          classes="ms-1 mt-1"
        />
      }
    />
    <TextField
      name="album"
      label="Album"
      value={album}
      handleChange={handleInput}
      placeholder="Mack Daddy"
      disabled={clearAlbum}
      child={
        <CheckboxField
          name="clearAlbum"
          label="Clear album"
          handleChange={handleClearAlbum}
          value={clearAlbum}
          classes="ms-1 mt-1"
        />
      }
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
