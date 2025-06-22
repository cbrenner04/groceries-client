import axios from 'utils/api';

// Type-safe access to the mocked axios instance
export const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper function to reset all axios mocks
export const resetAxiosMocks = (): void => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.put.mockReset();
  mockedAxios.delete.mockReset();
  mockedAxios.patch.mockReset();
};

// Helper function to clear all axios mocks
export const clearAxiosMocks = (): void => {
  mockedAxios.get.mockClear();
  mockedAxios.post.mockClear();
  mockedAxios.put.mockClear();
  mockedAxios.delete.mockClear();
  mockedAxios.patch.mockClear();
};
