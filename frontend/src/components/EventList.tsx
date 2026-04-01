import React, { useEffect, useMemo, useState } from "react";
import { useEvent } from "../context/EventContext";
import EventEdit from "./EventEdit";
import { Event } from "../types/types";


interface EventListProps {
	events?: Event[];
	tripId?: number;
	title?: string;
}

function formatEventDate(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatEventTime(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function EventList({ events = [], tripId, title = "Events" }: EventListProps) {
	const { getEventsByTrip, createEvent, updateEvent } = useEvent();
	const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [creating, setCreating] = useState(false);
	const [saving, setSaving] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

	useEffect(() => {
		const fetchTripEvents = async () => {
			if (!tripId || events.length > 0) return;

			setLoading(true);
			try {
				const data = await getEventsByTrip(tripId);
				setFetchedEvents(data || []);
			} catch (error) {
				console.error("Failed to fetch events:", error);
				setFetchedEvents([]);
			} finally {
				setLoading(false);
			}
		};

		fetchTripEvents();
	}, [tripId, events.length, getEventsByTrip]);

	const sourceEvents = events.length > 0 ? events : fetchedEvents;

	const orderedEvents = useMemo(() => {
		return [...sourceEvents].sort((a, b) => {
			const aTime = new Date(a.date).getTime();
			const bTime = new Date(b.date).getTime();
			return aTime - bTime;
		});
	}, [sourceEvents]);

	const handleCreateEvent = async (payload: {
		name: string;
		description: string | null;
		date: string;
		locationName: string;
		locationAddress: string | null;
	}) => {
		if (!tripId || !payload.name.trim() || !payload.date) return;

		setCreating(true);
		try {
			const created = await createEvent(
				payload.name,
				payload.description,
				tripId,
				new Date(payload.date).toISOString(),
				{
					name: payload.locationName || "",
					address: payload.locationAddress,
				}
			);

			if (events.length === 0) {
				setFetchedEvents((prev) => [...prev, created]);
			}

			setShowCreateModal(false);
		} catch (error) {
			console.error("Failed to create event:", error);
		} finally {
			setCreating(false);
		}
	};

	const openEditModal = (event: TripEvent) => {
		setSelectedEvent(event);
		setShowEditModal(true);
	};

	const handleSaveEvent = async (payload: {
		name: string;
		description: string | null;
		date: string;
		locationName: string;
		locationAddress: string | null;
	}) => {
		if (!selectedEvent || !payload.name.trim() || !payload.date) return;
		const effectiveTripId = tripId ?? selectedEvent.trip_id;
		if (!effectiveTripId) return;

		setSaving(true);
		try {
			const updated = await updateEvent(
				selectedEvent.id,
				payload.name,
				payload.description,
				effectiveTripId,
				new Date(payload.date).toISOString(),
				{
					name: payload.locationName || "",
					address: payload.locationAddress,
				}
			);

			if (events.length === 0) {
				setFetchedEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
			}

			setShowEditModal(false);
			setSelectedEvent(null);
		} catch (error) {
			console.error("Failed to update event:", error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="card">
			<EventEdit
				open={showCreateModal}
				event={{
					id: -1,
					name: "",
					description: "",
					date: new Date().toISOString(),
					location: { name: "", address: "" },
                    trip_id: tripId ?? -1
				}}
				saving={creating}
				title="Add Event"
				saveLabel="Add Event"
				onClose={() => !creating && setShowCreateModal(false)}
				onSave={handleCreateEvent}
			/>

			<EventEdit
				open={showEditModal}
				event={selectedEvent}
				saving={saving}
				onClose={() => setShowEditModal(false)}
				onSave={handleSaveEvent}
			/>

			<div className="card-header-row">
				<h3>{title}</h3>
				<button
					className="btn-primary"
					onClick={() => setShowCreateModal(true)}
					disabled={!tripId}
					style={{ padding: "0.25rem 0.65rem", borderRadius: "0.5rem", fontSize: "1rem" }}
				>
					+
				</button>
			</div>

			{loading ? (
				<p>Loading events...</p>
			) : orderedEvents.length === 0 ? (
				<p>No events yet.</p>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					{orderedEvents.map((event) => (
						<div
							key={event.id}
							onClick={() => openEditModal(event)}
							style={{
								border: "1px solid rgba(148, 163, 184, 0.3)",
								borderRadius: "0.75rem",
								padding: "0.75rem",
								background: "rgba(2, 6, 23, 0.55)",
								cursor: "pointer",
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
								<strong>{event.name}</strong>
								<span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
									{formatEventDate(event.date)} at {formatEventTime(event.date)}
								</span>
							</div>

							{event.description && (
								<p style={{ margin: "0.45rem 0 0", color: "#d1d5db" }}>{event.description}</p>
							)}

							{event.location?.name && (
								<p style={{ margin: "0.4rem 0 0", color: "#9ca3af", fontSize: "0.85rem" }}>
									Location: {event.location.name}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
