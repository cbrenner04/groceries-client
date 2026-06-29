import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

interface IBottomInputBarFormContextValue {
  addFormModalOpen: boolean;
  setAddFormModalOpen: (open: boolean) => void;
}

const BottomInputBarFormContext = createContext<IBottomInputBarFormContextValue | undefined>(undefined);

export function BottomInputBarFormProvider(props: { children: ReactNode }): React.JSX.Element {
  const { children } = props;
  const [addFormModalOpen, setAddFormModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setAddFormModalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return (): void => {
      setAddFormModalOpen(false);
    };
  }, []);

  return (
    <BottomInputBarFormContext.Provider value={{ addFormModalOpen, setAddFormModalOpen }}>
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
