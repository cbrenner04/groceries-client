import React, { createContext } from 'react';
import actioncable from 'actioncable';
import PropTypes from 'prop-types';

const ActionCableContext = createContext({ cable: null });

const ActionCableProvider = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  let wsUrl = process.env.REACT_APP_WS_BASE;
  if (storedUser) {
    const { 'access-token': accessToken, client, uid } = storedUser;
    wsUrl = `${process.env.REACT_APP_WS_BASE}/?access-token=${accessToken}&uid=${uid}&client=${client}`;
  }
  const cable = actioncable.createConsumer(wsUrl);
  return <ActionCableContext.Provider value={{ cable }}>{children}</ActionCableContext.Provider>;
};

ActionCableProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

const ActionCableConsumer = ({ channel, children, onReceived }) => {
  return (
    <ActionCableContext.Consumer>
      {({ cable }) => {
        cable.subscriptions.create(
          { channel },
          {
            initialized() {
              console.log('INITIALIZED!!'); //eslint-disable-line
            },
            connected() {
              console.log('CONNECTED!!!!'); //eslint-disable-line
            },
            received(data) {
              console.log('RECEIVED!!'); //eslint-disable-line
              onReceived(data);
            },
            disconnected() {
              console.log('DISCONNECTED!!!!'); //eslint-disable-line
            },
            rejected() {
              console.log('REJECTED!!!!'); //eslint-disable-line
            },
          },
        );
        return children;
      }}
    </ActionCableContext.Consumer>
  );
};

ActionCableConsumer.propTypes = {
  channel: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  onReceived: PropTypes.func.isRequired,
};

export { ActionCableContext, ActionCableProvider, ActionCableConsumer };
