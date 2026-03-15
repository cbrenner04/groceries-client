import type { Mock as VitestMock, Mocked as VitestMocked, MockedFunction as VitestMockedFunction } from 'vitest';

declare global {
  // Re-export vitest mock types globally so they can be used without import
  type Mock = VitestMock;
  type Mocked<T> = VitestMocked<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MockedFunction<T extends (...args: any[]) => any> = VitestMockedFunction<T>;
}

export {};
