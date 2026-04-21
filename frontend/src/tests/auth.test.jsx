// @vitest-environment jsdom
import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { test, expect, beforeEach } from 'vitest';
import { useAuth } from '../hooks/useAuth'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const testUser = { id: 1, email: "alice@gmail.com", username: "alice", name: "Alice" };

let mock;

beforeEach(() => {
  mock = new MockAdapter(api);
  localStorage.clear();
});

test('login sets token in localStorage', async () => {
  mock.onPost('/auth/token').reply(200, {
    access_token: "12345678"
  });
  mock.onGet('/auth/me').reply(200, testUser);

  const { result } = renderHook(() => useAuth(), {
    wrapper: createWrapper()
  });

  await result.current.login("alice", "password");

  await waitFor(() => {
    expect(localStorage.getItem("token")).toBe("12345678");
  });
});

test('login sets user', async () => {
  mock.onPost('/auth/token').reply(200, {
    access_token: "12345678"
  });
  mock.onGet('/auth/me').reply(200, testUser);

  const { result } = renderHook(() => useAuth(), {
    wrapper: createWrapper()
  });

  await result.current.login("alice", "password");

  await waitFor(() => {
    expect(result.current.user).toMatchObject(testUser);
  });
});

test('register sets token and user', async () => {
  mock.onPost('/auth/register').reply(200, {});
  mock.onPost('/auth/token').reply(200, {
    access_token: "12345678"
  });
  mock.onGet('/auth/me').reply(200, testUser);

  const { result } = renderHook(() => useAuth(), {
    wrapper: createWrapper()
  });

  await result.current.register("Alice", "alice", "alice@gmail.com", "password");

  await waitFor(() => {
    expect(result.current.user).toMatchObject(testUser);
    expect(localStorage.getItem("token")).toBe("12345678");
  });
});

test('logout clears user and token', async () => {
  mock.onPost('/auth/token').reply(200, {
    access_token: "12345678"
  });
  mock.onGet('/auth/me').reply(200, testUser);

  const { result } = renderHook(() => useAuth(), {
    wrapper: createWrapper()
  });

  await result.current.login("alice", "password");

  await waitFor(() => {
    expect(result.current.user).toBeDefined();
  });

  await result.current.logout();

  await waitFor(() => {
    expect(result.current.user).toBeUndefined();
    expect(localStorage.getItem("token")).toBeNull();
  });
});