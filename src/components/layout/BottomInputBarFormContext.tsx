import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface IBottomInputBarFormContextValue {
  expandedFormOpen: boolean;
  setExpandedFormOpen: (open: boolean) => void;
}

const BottomInputBarFormContext = createContext<IBottomInputBarFormContextValue | undefined>(undefined);

export function BottomInputBarFormProvider(props: { children: ReactNode }): React.JSX.Element {
  const { children } = props;
  const [expandedFormOpen, setExpandedFormOpen] = useState(false);

  return (
    <BottomInputBarFormContext.Provider value={{ expandedFormOpen, setExpandedFormOpen }}>
      {children}
    </BottomInputBarFormContext.Provider>
  );
}

export function useBottomInputBarFormContext(): IBottomInputBarFormContextValue {
  const context = useContext(BottomInputBarFormContext);
  if (!context) {
    throw new Error('useBottomInputBarFormContext must be used within BottomInputBarFormProvider');
  }
  return context;
}

export function useSetExpandedFormOpen(): ((open: boolean) => void) | undefined {
  return useContext(BottomInputBarFormContext)?.setExpandedFormOpen;
}
