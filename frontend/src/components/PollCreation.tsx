import React from 'react';
import { Message, MessageType } from '../types/types';

export default function PollCreation( { onCreate }: { onCreate: (poll: Message) => void }) {
    const [question, setQuestion] = React.useState('');
    const [options, setOptions] = React.useState(['', '']);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    }

    const addOption = () => {
        setOptions([...options, '']);
    }

    const handleSubmit = () => {
        if (!question.trim() || options.some(opt => !opt.trim())) {
            alert('Please fill in the question and all options.');
            return;
        }
        const pollMessage: Message = {
            id: Date.now(), // temporary ID, backend will assign real ID
            content: question,
            type: MessageType.POLL,
            meta_data: {
                options: Object.fromEntries(options.map(opt => [opt, [] as number[]]))
            } as Record<string, any>,
            sender_user_id: 0, // will be set by backend
            receiver_user_id: null,
            conversation_id: null,
            timestamp: new Date().toISOString()
        };
        onCreate(pollMessage);
        setQuestion('');
        setOptions(['', '']);
    }

    return (
        <div className="poll-creation">
            <input 
                type="text" 
                placeholder="Poll question" 
                value={question} 
                onChange={e => setQuestion(e.target.value)} 
            />
            {options.map((opt, idx) => (
                <input 
                    key={idx} 
                    type="text" 
                    placeholder={`Option ${idx + 1}`} 
                    value={opt} 
                    onChange={e => handleOptionChange(idx, e.target.value)} 
                />
            ))}
            <button onClick={addOption}>Add Option</button>
            <button onClick={handleSubmit}>Create Poll</button>
        </div>
    )
}