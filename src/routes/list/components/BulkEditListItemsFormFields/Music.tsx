import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, TextField } from 'components/FormFields';

export interface IMusicProps {
  artist: string;
  clearArtist: boolean;
  handleClearArtist: ChangeEventHandler;
  album: string;
  clearAlbum: boolean;
  handleClearAlbum: ChangeEventHandler;
  handleInput: ChangeEventHandler;
}

const Music: React.FC<IMusicProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <TextField
      name="artist"
      label="Artist"
      value={props.artist}
      handleChange={props.handleInput}
      placeholder="Sir Mix-a-Lot"
      disabled={props.clearArtist}
      child={
        <CheckboxField
          name="clearArtist"
          label="Clear artist"
          handleChange={props.handleClearArtist}
          value={props.clearArtist}
          classes="ms-1 mt-1"
        />
      }
    />
    <TextField
      name="album"
      label="Album"
      value={props.album}
      handleChange={props.handleInput}
      placeholder="Mack Daddy"
      disabled={props.clearAlbum}
      child={
        <CheckboxField
          name="clearAlbum"
          label="Clear album"
          handleChange={props.handleClearAlbum}
          value={props.clearAlbum}
          classes="ms-1 mt-1"
        />
      }
    />
  </React.Fragment>
);

export default Music;
