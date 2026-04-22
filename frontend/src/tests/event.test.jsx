// @vitest-environment jsdom
import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { test, expect, beforeEach } from 'vitest';
import { useEvent } from "../hooks/useEvent"

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

let mock;

beforeEach(() => {
  mock = new MockAdapter(api);
});

const eventsDB = [
    {id: 1, user_id: 1, title: "Eiffel Tower", description:"", trip_id: 1, start: "2026-05-06T10:00:00Z", end: "2026-05-06T12:00:00Z", location:{name: "Paris", address: "France"}},
    {id: 2, user_id: 1, title: "Parisian Coffee House", description:"", trip_id: 1, start: "2026-05-07T14:00:00Z", end: "2026-05-07T15:00:00Z", location:{name: "Paris", address: "France"}},
    {id: 3, user_id: 1, title: "Mount Fuji", description:"", trip_id: 2, start: "2026-05-06T08:00:00Z", end: "2026-05-06T09:00:00Z", location:{name: "Tokyo", address: "Japan"}},
]

test("getEventsByDate gets correct events", async ()=>{
    mock.onGet("/events/by-date/2026-05-06T00:00:00.000Z").reply(200, [eventsDB[0], eventsDB[2]]);

    const { result } = renderHook(() => useEvent(), {
        wrapper: createWrapper()
    });

    const events = await result.current.getEventsByDate("2026-05-06T00:00:00.000Z");
    expect(events[0].title).toBe("Eiffel Tower");
    expect(events[1].title).toBe("Mount Fuji");
})

test("getEventById gets correct event", async ()=>{
    mock.onGet("/events/by-id/1").reply(200, eventsDB[0]);

    const { result } = renderHook(() => useEvent(), {
        wrapper: createWrapper()
    });

    const event = await result.current.getEventById(1);
    expect(event.title).toBe("Eiffel Tower");
})

test("getEventsByTrip gets correct events", async ()=>{
    mock.onGet("/events/by-trip/1").reply(200, [eventsDB[0], eventsDB[1]]);

    const { result } = renderHook(() => useEvent(), {
        wrapper: createWrapper()
    });

    const events = await result.current.getEventsByTrip(1);
    expect(events[0].title).toBe("Eiffel Tower");
    expect(events[1].title).toBe("Parisian Coffee House");
})

test("delete event revomes from db", async()=>{
    mock.onDelete("/events/1").reply(200, {detail: "Event successfully deleted", event:eventsDB[0]})

    const { result } = renderHook(() => useEvent(), {
        wrapper: createWrapper()
    });
    await result.current.deleteEvent(1);

    expect(mock.history.delete[0].url).toBe("/events/1");
});

test("update event edits entries", async()=>{
    let e = {...eventsDB[0]};
    e.description = "brand new description"
    mock.onGet("/events/by-id/1").reply(200, e);
    mock.onPut("/events/1").reply(200, e)

    const { result } = renderHook(() => useEvent(), {
        wrapper: createWrapper()
    });
    let res = await result.current.updateEvent(1, { description: "brand new description" });

    expect(mock.history.put[0].url).toBe("/events/1");
    expect(res.description).toBe("brand new description");
});

test("create event adds to db", async()=>{
    mock.onPost("/events/create").reply(200, eventsDB[0])

    const { result } = renderHook(() => useEvent(), {
        wrapper: createWrapper()
    });
    await result.current.createEvent({
        title: "Eiffel Tower",
        description: "",
        trip_id: 1,
        start: "2026-05-06T10:00:00Z",
        end: "2026-05-06T12:00:00Z",
        location: {name: "Paris", address: "France"}
    });
    
    expect(mock.history.post[0].url).toBe("/events/create");
    const requestData = JSON.parse(mock.history.post[0].data);
    expect(requestData.title).toBe("Eiffel Tower");
    expect(requestData.trip_id).toBe(1);
});