import React, { createContext } from 'react';
import actioncable from 'actioncable';
import PropTypes from 'prop-types';

const ActionCableContext = createContext();

const ActionCableContextProvider = ({ url, children }) => {
  const cable = actioncable.createConsumer(url);
  return <ActionCableContext.Provider value={{ cable }}>{children}</ActionCableContext.Provider>;
};

ActionCableContextProvider.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
};

const ActionCableContextConsumer = ({ channel, children, onReceived }) => {
  return (
    <ActionCableContext.Consumer>
      {({ cable }) => {
        let myCable = cable;
        myCable.subscriptions.create(
          { channel },
          {
            initialized() {
              console.log('INITIALIZED!!'); //eslint-disable-line
            },
            connected() {
              console.log('CONNECTED!!!!'); //eslint-disable-line
            },
            received(data) {
              onReceived(data);
            },
            disconnected(data) {
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

ActionCableContextConsumer.propTypes = {
  channel: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  onReceived: PropTypes.func.isRequired,
  user: PropTypes.shape({
    accessToken: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    client: PropTypes.string.isRequired,
  }).isRequired,
};

export { ActionCableContext, ActionCableContextProvider, ActionCableContextConsumer };
