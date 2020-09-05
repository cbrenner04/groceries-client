import { createContext } from 'react';

const ActionCableContext = createContext({ cable: null, setCableContext: () => undefined });

export { ActionCableContext };
