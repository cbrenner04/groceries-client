import type { Mocked, MockedFunction } from "vitest";

declare global {
  namespace jest {
    type Mock<T = any> = Mocked<T>;
    type Mocked<T> = Mocked<T>;
    type MockedFunction<T extends (...args: any[]) => any> = MockedFunction<T>;
  }
}

export {};
