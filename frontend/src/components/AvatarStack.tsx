import React, {useState, useEffect} from 'react';
import { MessageProvider } from '../context/MessageProvider';
import { useFriend } from '../context/FriendContext';

export default function AvatarStack({userIds}: {userIds: number[]}) {
    const [userList, setUserList] = useState<string[]>([]);
    const {getUsername} = useFriend();

    useEffect(() => {
        const fetchUsernames = async () => {
            const usernames = await Promise.all(
                userIds.map((id) => getUsername(id))
            );
            setUserList(usernames);
        };
        fetchUsernames();
    }, [userIds]);
    return (
    <div className="avatar-stack">
          {userList.map((username, index) => (
            <div key={index} className="avatar-circle">
              {username.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
    )
}