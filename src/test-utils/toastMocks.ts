import { toast } from 'react-toastify';

// Type-safe access to the mocked toast instance
export const mockedToast = toast as jest.MockedFunction<typeof toast> & {
  success: jest.MockedFunction<typeof toast.success>;
  error: jest.MockedFunction<typeof toast.error>;
  info: jest.MockedFunction<typeof toast.info>;
  warning: jest.MockedFunction<typeof toast.warning>;
  dismiss: jest.MockedFunction<typeof toast.dismiss>;
};

// Helper function to reset all toast mocks
export const resetToastMocks = (): void => {
  mockedToast.mockReset();
  mockedToast.success.mockReset();
  mockedToast.error.mockReset();
  mockedToast.info.mockReset();
  mockedToast.warning.mockReset();
  mockedToast.dismiss.mockReset();
};

// Helper function to clear all toast mocks
export const clearToastMocks = (): void => {
  mockedToast.mockClear();
  mockedToast.success.mockClear();
  mockedToast.error.mockClear();
  mockedToast.info.mockClear();
  mockedToast.warning.mockClear();
  mockedToast.dismiss.mockClear();
};
