// @vitest-environment jsdom
import MockAdapter from 'axios-mock-adapter'
import api from '../api'
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { test, expect, beforeEach } from 'vitest';
import { useTrip } from "../hooks/useTrip"

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

const tripDB = [ 
    { id: 1, name: "Paris Trip" },
    { id: 2, name: "Tokyo Trip" },
]

const testTrip = { name: "Shanghai Trip", conversation_id: 3, description:"" };

test('getTrips returns trips', async () => {
    mock.onGet('/trips/getTrips').reply(200, tripDB);

    const { result } = renderHook(() => useTrip(), {
        wrapper: createWrapper()
    });

    const trips = await result.current.getTrips();
    expect(trips[0].name).toBe("Paris Trip");
});

test('getTrip returns correct trip', async () => {
    mock.onGet('/trips/1').reply(200, { id: 1, name: "Paris Trip"});

    const { result } = renderHook(() => useTrip(), {
        wrapper: createWrapper()
    });

    const trip = await result.current.getTrip(1);

    expect(trip).toMatchObject({
        id: 1,
        name: "Paris Trip"
    });
});


test("create trip adds to db", async() => {
    mock.onPost("/trips/create").reply(200, testTrip);

    const { result } = renderHook(() => useTrip(), {
        wrapper: createWrapper()
    });

    await result.current.createTrip(testTrip.name, 
        testTrip.conversation_id, 
        testTrip.description);
    
    expect(mock.history.post[0].url).toBe('/trips/create');
    expect(JSON.parse(mock.history.post[0].data) ).toMatchObject(testTrip);
});

test("delete trip removes from db", async() => {
    mock.onDelete("/trips/1").reply(200, {detail:"Trip 1 successfully deleted"});

    const { result } = renderHook(() => useTrip(), {
        wrapper: createWrapper()
    });

    await result.current.deleteTrip(1);
    
    expect(mock.history.delete[0].url).toBe('/trips/1');
})

test('setTripDate updates trip dates', async () => {
  mock.onGet('/trips/1').reply(200, {
    id: 1,
    name: "Paris Trip",
    description: ""
  });

  mock.onPut('/trips/1').reply(200, {
    id: 1,
    name: "Paris Trip",
    description: "",
    start_date: "2026-03-01T00:00:00",
    end_date: "2026-03-10T00:00:00"
  });

  const { result } = renderHook(() => useTrip(), {
    wrapper: createWrapper()
  });

  const trip = await result.current.setTripDate(1, "2026-03-01T00:00:00", "2026-03-10T00:00:00");

  expect(JSON.parse(mock.history.put[0].data)).toMatchObject({
    name: "Paris Trip",
    start_date: "2026-03-01T00:00:00",
    end_date: "2026-03-10T00:00:00"
  });

  expect(trip.start_date).toBe("2026-03-01T00:00:00");
});