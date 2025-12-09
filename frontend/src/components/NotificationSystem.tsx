import React, { useEffect } from 'react';
import './NotificationSystem.css';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
}

interface NotificationSystemProps {
    notifications: Notification[];
    onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
    useEffect(() => {
        notifications.forEach(notification => {
            if (notification.duration) {
                const timer = setTimeout(() => {
                    onRemove(notification.id);
                }, notification.duration);
                return () => clearTimeout(timer);
            }
        });
    }, [ notifications, onRemove ]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="notification-system">
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="notification-icon">
                        {getIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                    </div>
                    <button
                        className="notification-close"
                        onClick={() => onRemove(notification.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
