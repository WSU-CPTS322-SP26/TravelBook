import React, { useState } from "react";
import { Message } from "../types/types";


export default function PollBox({ poll, onVote }: { poll: Message; onVote: (option: string) => void }) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    
    const handleVote = (option: string) => {
        setSelectedOption(option);
        onVote(option);
    };

    // Calculate total votes
    const totalVotes = poll.meta_data && Object.values(poll.meta_data.options).reduce((sum, votes: any) => sum + votes.length, 0) || 0;
    
    console.log("Rendering PollBox with message:", poll);
    return (
        <div className="poll-box">
            <div className="poll-question">{poll.content}</div>
            <div className="poll-options">
                {poll.meta_data && Object.entries(poll.meta_data.options).map(([option, userIds]: [string, any]) => {
                    const voteCount = userIds.length;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isSelected = selectedOption === option;
                    
                    return (
                        <label key={option} className={`poll-option ${isSelected ? 'selected' : ''}`}>
                            <div className="poll-option-input">
                                <input
                                    type="radio"
                                    name={`poll-${poll.id}`}
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => handleVote(option)}
                                />
                            </div>
                            <div className="poll-option-content">
                                <div className="poll-option-text">{option}</div>
                                <div className="poll-option-bar">
                                    <div className="poll-option-progress" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="poll-option-stats">{voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)</div>
                            </div>
                        </label>
                    );
                })}
            </div>
            <div className="poll-footer">Total votes: {totalVotes}</div>
        </div>
    )
}