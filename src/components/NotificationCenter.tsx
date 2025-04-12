import React, { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState([]);
  const { data: user } = useUser();

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${user.userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      {notifications.map((notification: any) => (
        <div 
          key={notification._id}
          className="bg-[#1E1E1E] p-4 rounded-lg mb-2 shadow-lg"
        >
          <div className="font-bold mb-1">{notification.type}</div>
          <div className="text-sm">{notification.message}</div>
          {notification.status === 'unread' && (
            <button
              onClick={() => markAsRead(notification._id)}
              className="text-xs text-[#8B5CF6] mt-2"
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}; 