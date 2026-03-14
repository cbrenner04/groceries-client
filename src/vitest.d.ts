import type { Mocked as ViMocked, MockedFunction as ViMockedFunction } from 'vitest';

declare global {
  namespace jest {
    type Mock<T = unknown> = ViMocked<T>;
    type Mocked<T> = ViMocked<T>;
    type MockedFunction<T extends (...args: never[]) => unknown> = ViMockedFunction<T>;
  }
}

export {};
