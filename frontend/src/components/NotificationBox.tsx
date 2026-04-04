import React from "react";

export default function NotificationBox({ title, message }: { title: string; message: string }) {
    return (
        <div className="notification-box">
            <strong>{title}</strong>
            <p>{message}</p>
        </div>
    )
}