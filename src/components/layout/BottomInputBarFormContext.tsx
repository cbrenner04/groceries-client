import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface IBottomInputBarFormContextValue {
  expandedFormOpen: boolean;
  setExpandedFormOpen: (open: boolean) => void;
}

const BottomInputBarFormContext = createContext<IBottomInputBarFormContextValue | undefined>(undefined);

interface IBottomInputBarFormProviderProps {
  children: ReactNode;
}

export function BottomInputBarFormProvider(props: IBottomInputBarFormProviderProps): React.JSX.Element {
  const { children } = props;
  const [expandedFormOpen, setExpandedFormOpen] = useState(false);
  const value = useMemo(
    (): IBottomInputBarFormContextValue => ({ expandedFormOpen, setExpandedFormOpen }),
    [expandedFormOpen],
  );

  return <BottomInputBarFormContext.Provider value={value}>{children}</BottomInputBarFormContext.Provider>;
}

export function useBottomInputBarFormContext(): IBottomInputBarFormContextValue {
  const context = useContext(BottomInputBarFormContext);
  if (!context) {
    throw new Error('useBottomInputBarFormContext must be used within BottomInputBarFormProvider');
  }
  return context;
}

export { BottomInputBarFormContext };
