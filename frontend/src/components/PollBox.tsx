import React, { useState } from "react";
import { Message } from "../types/types";


export default function PollBox({ poll, onVote }: { poll: Message; onVote: (option: string) => void }) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    
    const handleVote = (option: string) => {
        setSelectedOption(option);
        onVote(option);
    };
    
    console.log("Rendering PollBox with message:", poll);
    return (
        <div className="chat-bubble-poll">
            <p>{poll.content}</p>
            {poll.meta_data && Object.entries(poll.meta_data.options).map(([option, userIds]) => (
                <label key={option} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
                    <input
                        type="radio"
                        name={`poll-${poll.id}`}
                        value={option}
                        checked={selectedOption === option}
                        onChange={() => handleVote(option)}
                    />
                    <span>{option} ({userIds.length} voted)</span>
                </label>
            ))}
        </div>
    )
}