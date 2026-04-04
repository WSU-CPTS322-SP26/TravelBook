// @vitest-environment jsdom
import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { renderHook, waitFor } from '@testing-library/react';
import { test, expect } from 'vitest';
import { useFriend } from "../context/FriendContext"
import FriendProvider from '../context/FriendProvider'

const mock = new MockAdapter(api);

const testFriends = [{userId:1, username:"Bob"}]

test("get friends updates friends list", async()=>{
    mock.onGet("friends/getFriends").reply(200, testFriends);

    const { result } = renderHook(() => useFriend(), {
        wrapper: FriendProvider
    });

    await result.current.getFriends();

    await waitFor(()=>{
        expect(result.current.friends).toMatchObject(testFriends);
    })

});

test("get username returns correct name", async()=>{
    mock.onGet("friends/getUsername/1").reply(200, testFriends[0].username);

    const { result } = renderHook(() => useFriend(), {
        wrapper: FriendProvider
    });

    let un = await result.current.getUsername(1);

    expect(un).toBe(testFriends[0].username);
});

test("add friend accesses route", async()=>{
    mock.onPost("/friends/addFriend/1").reply(200, {}); // it doesnt return anything

    const { result } = renderHook(() => useFriend(), {
        wrapper: FriendProvider
    });
    await result.current.addFriend(1);
    expect(mock.history.post[0].url).toBe("/friends/addFriend/1");

});

test("remove friend accesses route", async()=>{
    mock.onPost("/friends/removeFriend/1").reply(200, {}); // it doesnt return anything

    const { result } = renderHook(() => useFriend(), {
        wrapper: FriendProvider
    });
    await result.current.removeFriend(1);
    waitFor(()=>{
        expect(mock.history.post[0].url).toBe("/friends/removeFriend/1");
    })

});
