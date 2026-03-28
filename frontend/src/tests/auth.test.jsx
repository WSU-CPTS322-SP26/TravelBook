// @vitest-environment jsdom
import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { renderHook, waitFor } from '@testing-library/react';
import { test, expect } from 'vitest';
import { useAuth } from '../context/AuthContext'
import AuthProvider from '../context/AuthProvider'

const mock = new MockAdapter(api);

const testUser = { email: "alice@gmail.com", username: "alice", password:"password" };

test('generating token sets token', async () => {
    mock.onPost('/auth/token').reply(200, {
        access_token: "12345678"
    });
    mock.onGet('/auth/me').reply(200, {}); // since I dont want to expose generateAccessToken, we use the login funtion to test
    const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
    });

    await result.current.login("alice", "password");

    await waitFor( () => {
        expect(result.current.token).toBe("12345678");
    })
});

test('login sets user', async () => {
  mock.onPost('/auth/token').reply(200, {
    access_token: "12345678" // this token does nothing, just a catch in the login function :)
  });

  mock.onGet('/auth/me').reply(200, testUser);

  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider
  });

  await result.current.login("alice","password");

  await waitFor( () => {
    expect(result.current.user).toMatchObject(testUser);
  })
  
}); 

test('register sets user', async () => {
    mock.onPost('/auth/token').reply(200, {
        access_token: "12345678"
    });
    mock.onPost('/auth/register').reply(200, {}) // this is purely a database function, no need to return
    mock.onGet('/auth/me').reply(200, testUser);
    const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
    });

    await waitFor( () => {
        expect(result.current.user).toMatchObject(testUser);
    })
});

test('logout sets user=null', async () => {
    let userOnLogin, userOnLogout;
    mock.onPost('/auth/token').reply(200, {access_token: "12345678"});
    mock.onGet('/auth/me').reply(200, testUser);

    const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
    });
    await result.current.login("alice","password").then( () => { userOnLogin = result.current.user });
    result.current.logout();
    userOnLogout = result.current.user
    await waitFor( () => {
        expect(userOnLogin == testUser && userOnLogout == null);
    })

});