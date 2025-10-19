import { startTransition } from 'react';
import { batchStateUpdates, safeStateUpdate, batchPollingUpdates } from './batchUpdates';

// Mock startTransition
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  startTransition: jest.fn(),
}));

describe('batchUpdates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('batchStateUpdates', () => {
    it('calls startTransition with all updates', () => {
      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const update1 = jest.fn();
      const update2 = jest.fn();
      const updates = [update1, update2];

      batchStateUpdates(updates);

      expect(mockStartTransition).toHaveBeenCalledTimes(1);
      const transitionCallback = mockStartTransition.mock.calls[0][0];
      transitionCallback();
      expect(update1).toHaveBeenCalledTimes(1);
      expect(update2).toHaveBeenCalledTimes(1);
    });

    it('handles errors in individual updates gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        // Mock implementation
      });

      const update1 = jest.fn(() => {
        throw new Error('Update failed');
      });
      const update2 = jest.fn();
      const updates = [update1, update2];

      batchStateUpdates(updates);

      const transitionCallback = mockStartTransition.mock.calls[0][0];
      transitionCallback();

      expect(update1).toHaveBeenCalledTimes(1);
      expect(update2).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('State update error:', expect.any(Error));

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('safeStateUpdate', () => {
    it('calls startTransition with the state update', () => {
      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const setState = jest.fn();
      const value = 'test value';

      safeStateUpdate(setState, value);

      expect(mockStartTransition).toHaveBeenCalledTimes(1);
      const transitionCallback = mockStartTransition.mock.calls[0][0];
      transitionCallback();
      expect(setState).toHaveBeenCalledWith(value);
    });

    it('handles errors in state update gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        // Mock implementation
      });

      const setState = jest.fn(() => {
        throw new Error('State update failed');
      });
      const value = 'test value';

      safeStateUpdate(setState, value);

      const transitionCallback = mockStartTransition.mock.calls[0][0];
      transitionCallback();

      expect(setState).toHaveBeenCalledWith(value);
      expect(consoleSpy).toHaveBeenCalledWith('State update failed:', expect.any(Error));

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('handles function-based state updates', () => {
      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const setState = jest.fn();
      const updaterFn = jest.fn((prev: string) => prev + ' updated');

      safeStateUpdate(setState, updaterFn);

      const transitionCallback = mockStartTransition.mock.calls[0][0];
      transitionCallback();
      expect(setState).toHaveBeenCalledWith(updaterFn);
    });
  });

  describe('batchPollingUpdates', () => {
    it('filters and executes only updates that should update', () => {
      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const setState1 = jest.fn();
      const setState2 = jest.fn();
      const setState3 = jest.fn();

      const updates = [
        { setState: setState1, newValue: 'value1', shouldUpdate: true },
        { setState: setState2, newValue: 'value2', shouldUpdate: false },
        { setState: setState3, newValue: 'value3', shouldUpdate: true },
      ];

      batchPollingUpdates(updates);

      expect(mockStartTransition).toHaveBeenCalledTimes(1);
      const transitionCallback = mockStartTransition.mock.calls[0][0];
      transitionCallback();

      expect(setState1).toHaveBeenCalledWith('value1');
      expect(setState2).not.toHaveBeenCalled();
      expect(setState3).toHaveBeenCalledWith('value3');
    });

    it('does not call startTransition when no updates should be applied', () => {
      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;
      const setState = jest.fn();

      const updates = [{ setState, newValue: 'value1', shouldUpdate: false }];

      batchPollingUpdates(updates);

      expect(mockStartTransition).not.toHaveBeenCalled();
      expect(setState).not.toHaveBeenCalled();
    });

    it('handles empty updates array', () => {
      const mockStartTransition = startTransition as jest.MockedFunction<typeof startTransition>;

      batchPollingUpdates([]);

      expect(mockStartTransition).not.toHaveBeenCalled();
    });
  });
});
