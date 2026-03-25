import React from "react";
import { Message } from "../types/types";


export default function PollBox({ poll, onVote }: { poll: Message; onVote: (option: string) => void }) {
    return (
        <div className="chat-bubble-poll">
            <p>{poll.content}</p>
            {Object.keys(poll.metadata.options).map(option => (
                <button key={option} onClick={() => onVote(option)}>
                    {option} ({poll.metadata.options[option].length} votes)
                </button>
            ))}
        </div>
    )
}