// @vitest-environment jsdom
import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { renderHook, waitFor } from '@testing-library/react';
import { test, expect } from 'vitest';
import { useEvent } from "../context/EventContext"
import EventProvider from '../context/EventProvider'

const mock = new MockAdapter(api);

const eventsDB = [
    {eventId: 1, name: "Eiffel Tower", description:"", tripId: 1, date: "05/06/26", location:{lat:90, lng:90}},
    {eventId: 2, name: "Parisian Coffee House", description:"", tripId: 1, date: "05/07/26", location:{lat:90, lng:90}},
    {eventId: 3, name: "Mount Fuji", description:"", tripId: 2, date: "05/06/26", location:{lat:90, lng:90}},
]

test("getEventsByDate gets correct events", async ()=>{
    mock.onGet("/events/by-date/05/06/26").reply(200, [eventsDB[0], eventsDB[2]]);

    const { result } = renderHook(() => useEvent(), {
        wrapper: EventProvider
    });

    const events = await result.current.getEventsByDate("05/06/26");
    expect(events[0].name).toBe("Eiffel Tower");
    expect(events[1].name).toBe("Mount Fuji");
})

test("getEventById gets correct event", async ()=>{
    mock.onGet("/events/by-id/1").reply(200, eventsDB[0]);

    const { result } = renderHook(() => useEvent(), {
        wrapper: EventProvider
    });

    const event = await result.current.getEventById(1);
    expect(event.name).toBe("Eiffel Tower");
})

test("getEventsByTrip gets correct events", async ()=>{
    mock.onGet("/events/by-trip/1").reply(200, [eventsDB[0], eventsDB[1]]);

    const { result } = renderHook(() => useEvent(), {
        wrapper: EventProvider
    });

    const events = await result.current.getEventsByTrip(1);
    expect(events[0].name).toBe("Eiffel Tower");
    expect(events[1].name).toBe("Parisian Coffee House");
})

test("delete event revomes from db", async()=>{
    mock.onDelete("/events/1").reply(200, {detail: "Event successfully deleted", event:eventsDB[0]})

    const { result } = renderHook(() => useEvent(), {
        wrapper: EventProvider
    });
    await result.current.deleteEvent(1);

    expect(mock.history.delete[0].url).toBe("/events/1");
});

test("update event edits entries", async()=>{
    let e = eventsDB[0];
    e.description = "brand new description"
    mock.onPut("/events/1").reply(200, e)

    const { result } = renderHook(() => useEvent(), {
        wrapper: EventProvider
    });
    let res = await result.current.updateEvent(e.eventId, e.name, e.description, e.tripId, e.date, e.location);

    expect(mock.history.put[0].url).toBe("/events/1");
    expect(res).toMatchObject(e);
});

test("create event adds to db", async()=>{
    mock.onPost("/events/create").reply(200, eventsDB[0])

    const { result } = renderHook(() => useEvent(), {
        wrapper: EventProvider
    });
    await result.current.createEvent("Eiffel Tower", "", 1, "05/06/26", {lat:90, lng:90})
    expect(mock.history.post[0].url).toBe("/events/create");
    expect(JSON.parse(mock.history.post[0].data) ).toMatchObject({name: "Eiffel Tower", description:"", trip_id: 1, date: "05/06/26", location:{lat:90, lng:90}})
});