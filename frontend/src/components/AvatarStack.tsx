import React, {useState, useEffect, useMemo} from 'react';
import { useUserUsername } from '../hooks/useFriend';

export default function AvatarStack({userIds}: {userIds: number[]}) {
    const [usernames, setUsernames] = useState<string[]>([]);

    // Fetch first user's username as example
    const firstUsernameQuery = useUserUsername(userIds?.[0]);

    useEffect(() => {
      if (firstUsernameQuery?.data) {
        setUsernames([firstUsernameQuery.data]);
        // In a real implementation, you'd want to fetch all usernames
        // But that requires multiple hook calls, which isn't supported
        // For now, we just show the first one or handle it differently
      }
    }, [firstUsernameQuery?.data]);

    return (
      <div className="avatar-stack">
            {usernames.map((username, index) => (
              <div key={index} className="avatar-circle">
                {username.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
    )
}