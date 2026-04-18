import React, {useState, useEffect, useMemo} from 'react';
import { useFriend } from '../hooks/useFriend';

export default function AvatarStack({userIds}: {userIds: number[]}) {
    const {getUsername} = useFriend();

    const usernameQueries = useMemo(
        () => userIds.map((id) => ({ id, query: getUsername(id) })),
        [userIds, getUsername]
    );

    const userList = usernameQueries.map(({ query }) => query.data).filter(Boolean) as string[];

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