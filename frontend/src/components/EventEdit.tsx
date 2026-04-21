import React, { useEffect, useState } from "react";
import { Event, Trip } from "../types/types";

interface EventEditProps {
	open: boolean;
	event: Event | null;
	saving: boolean;
	title?: string;
	saveLabel?: string;
	trips?: Trip[];
	selectedTripId?: number | null;
	onTripChange?: (tripId: number | null) => void;
	onClose: () => void;
	onSave: (payload: {
		title: string;
		description: string | null;
		start: string;
		end: string;
		locationName: string;
		locationAddress: string | null;
	}) => void;
}

function toDateTimeLocalValue(dateStr: string) {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const offsetMs = date.getTimezoneOffset() * 60000;
	return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function EventEdit({
	open,
	event,
	saving,
	title = "Event Details",
	saveLabel = "Save Changes",
	trips = [],
	selectedTripId,
	onTripChange,
	onClose,
	onSave,
}: EventEditProps) {
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editStartDateTime, setEditStartDateTime] = useState("");
	const [editEndDateTime, setEditEndDateTime] = useState("");
	const [editLocationName, setEditLocationName] = useState("");
	const [editLocationAddress, setEditLocationAddress] = useState("");
	const isCreating = event?.id === -1;

	useEffect(() => {
		if (!event) return;
		setEditTitle(event.title || "");
		setEditDescription(event.description || "");
		setEditStartDateTime(toDateTimeLocalValue(event.start));
		setEditEndDateTime(toDateTimeLocalValue(event.end));
		setEditLocationName(event.location?.name || "");
		setEditLocationAddress(event.location?.address || "");
	}, [event]);

	if (!open || !event) return null;

	return (
		<div className="modal-overlay" onClick={() => !saving && onClose()}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>{title}</h2>
					<button className="modal-close" onClick={() => !saving && onClose()}>
						×
					</button>
				</div>
				<div className="modal-body">
					<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>					{isCreating && trips.length > 0 && (
						<>
							<label style={{ fontSize: "0.875rem", fontWeight: "500" }}>Trip</label>
							<select
								className="text-input"
								value={selectedTripId || ""}
								onChange={(e) => onTripChange?.(e.target.value ? Number(e.target.value) : null)}
							>
								<option value="">Select a trip...</option>
								{trips.map((trip) => (
									<option key={trip.id} value={trip.id}>
									{trip.name}
									</option>
								))}
							</select>
						</>
					)}						<input
							className="text-input"
							placeholder="Event title"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
						/>
						<textarea
							className="text-input"
							placeholder="Description (optional)"
							rows={3}
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
						/>
						<label style={{ fontSize: "0.875rem", fontWeight: "500" }}>Start Time</label>
						<input
							type="datetime-local"
							className="text-input"
							value={editStartDateTime}
							onChange={(e) => setEditStartDateTime(e.target.value)}
						/>
						<label style={{ fontSize: "0.875rem", fontWeight: "500" }}>End Time</label>
						<input
							type="datetime-local"
							className="text-input"
							value={editEndDateTime}
							onChange={(e) => setEditEndDateTime(e.target.value)}
						/>
						<input
							className="text-input"
							placeholder="Location name (optional)"
							value={editLocationName}
							onChange={(e) => setEditLocationName(e.target.value)}
						/>
						<input
							className="text-input"
							placeholder="Location address (optional)"
							value={editLocationAddress}
							onChange={(e) => setEditLocationAddress(e.target.value)}
						/>
					</div>
				</div>
				<div className="modal-footer">
					<button className="btn-secondary" onClick={onClose} disabled={saving}>
						Cancel
					</button>
					<button
						className="btn-primary"
						onClick={() =>
							onSave({
								title: editTitle.trim(),
								description: editDescription.trim() || null,
								start: editStartDateTime,
								end: editEndDateTime,
								locationName: editLocationName.trim(),
								locationAddress: editLocationAddress.trim() || null,
							})
						}
						disabled={saving || !editTitle.trim() || !editStartDateTime || !editEndDateTime}
					>
						{saving ? "Saving..." : saveLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
