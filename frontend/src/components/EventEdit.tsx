import React, { useEffect, useState } from "react";
import { Event } from "../types/types";

interface EventEditProps {
	open: boolean;
	event: Event | null;
	saving: boolean;
	title?: string;
	saveLabel?: string;
	onClose: () => void;
	onSave: (payload: {
		name: string;
		description: string | null;
		date: string;
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
	onClose,
	onSave,
}: EventEditProps) {
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editDateTime, setEditDateTime] = useState("");
	const [editLocationName, setEditLocationName] = useState("");
	const [editLocationAddress, setEditLocationAddress] = useState("");

	useEffect(() => {
		if (!event) return;
		setEditName(event.name || "");
		setEditDescription(event.description || "");
		setEditDateTime(toDateTimeLocalValue(event.date));
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
					<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
						<input
							className="text-input"
							placeholder="Event name"
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
						/>
						<textarea
							className="text-input"
							placeholder="Description (optional)"
							rows={3}
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
						/>
						<input
							type="datetime-local"
							className="text-input"
							value={editDateTime}
							onChange={(e) => setEditDateTime(e.target.value)}
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
								name: editName.trim(),
								description: editDescription.trim() || null,
								date: editDateTime,
								locationName: editLocationName.trim(),
								locationAddress: editLocationAddress.trim() || null,
							})
						}
						disabled={saving || !editName.trim() || !editDateTime}
					>
						{saving ? "Saving..." : saveLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
