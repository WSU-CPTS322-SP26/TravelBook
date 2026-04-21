import React, { useEffect, useMemo, useState } from "react";
import { useEvent } from "../hooks/useEvent";
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
	const eventsQuery = tripId ? getEventsByTrip(tripId) : { data: events, isLoading: false };
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [creating, setCreating] = useState(false);
	const [saving, setSaving] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

	const sourceEvents = events.length > 0 ? events : (eventsQuery.data || []);
	const isLoading = eventsQuery.isLoading;

	const orderedEvents = useMemo(() => {
		return [...sourceEvents].sort((a, b) => {
			const aTime = new Date(a.start).getTime();
			const bTime = new Date(b.start).getTime();
			return aTime - bTime;
		});
	}, [sourceEvents]);

	const handleCreateEvent = async (payload: {
		title: string;
		description: string | null;
		start: string;
		end: string;
		locationName: string;
		locationAddress: string | null;
	}) => {
		if (!tripId || !payload.title.trim() || !payload.start) return;

		setCreating(true);
		try {
			await createEvent({
				title: payload.title,
				description: payload.description,
				trip_id: tripId,
				start: payload.start,
				end: payload.end,
				location: {
					name: payload.locationName || "",
					address: payload.locationAddress,
				}
			});

			setShowCreateModal(false);
		} catch (error) {
			console.error("Failed to create event:", error);
		} finally {
			setCreating(false);
		}
	};

	const openEditModal = (event: Event) => {
		setSelectedEvent(event);
		setShowEditModal(true);
	};

	const handleSaveEvent = async (payload: {
		title: string;
		description: string | null;
		start: string;
		end: string;
		locationName: string;
		locationAddress: string | null;
	}) => {
		if (!selectedEvent?.id || !payload.title.trim() || !payload.start) return;

		setSaving(true);
		try {
			await updateEvent(selectedEvent.id, {
				title: payload.title,
				description: payload.description,
				start: payload.start,
				end: payload.end,
				location: {
					name: payload.locationName || "",
					address: payload.locationAddress,
				}
			});

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
					user_id: 0,
					title: "",
					description: "",
					start: new Date().toISOString(),
					end: new Date().toISOString(),
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

		{isLoading ? (
			<p>Loading events...</p>
		) : orderedEvents.length === 0 ? (
			<p>No events yet.</p>
		) : (
			<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
				{orderedEvents.map((event) => (
					<div
						key={event.id}
						style={{
							border: "1px solid rgba(148, 163, 184, 0.3)",
							borderRadius: "0.75rem",
							padding: "0.75rem",
							background: "rgba(2, 6, 23, 0.55)",
							cursor: "pointer",
						}}
					>
						<div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
						<strong>{event.title}</strong>
						<span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
							{formatEventDate(event.start)} at {formatEventTime(event.start)}
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
