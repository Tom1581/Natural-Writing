import { useState, useEffect } from 'react';

export interface PresenceUser {
  userId: string;
  name: string;
  status: 'idle' | 'writing' | 'optimizing';
  manuscriptId?: string;
  color: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export const usePresence = (userId: string, orgId: string) => {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    // Detect local device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad/i.test(navigator.userAgent);
    const currentDeviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

    // Simulating WebSocket real-time presence cloud with device telemetry
    const mockUsers: PresenceUser[] = [
      { userId: 'u1', name: 'Zhiyuan', status: 'writing', color: '#3b82f6', manuscriptId: 'm1', deviceType: 'desktop' },
      { userId: 'u2', name: 'Thomas', status: 'optimizing', color: '#10b981', manuscriptId: 'm2', deviceType: 'mobile' },
      { userId: 'u3', name: 'Sarah', status: 'idle', color: '#8b5cf6', deviceType: 'tablet' }
    ];

    setUsers(mockUsers.filter(u => u.userId !== userId));

    const interval = setInterval(() => {
       // Simulate dynamic changes and device switching
       setUsers(prev => prev.map(u => ({
          ...u,
          status: Math.random() > 0.7 ? 'writing' : (Math.random() > 0.8 ? 'optimizing' : 'idle')
       })));
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, orgId]);

  return { users };
};
