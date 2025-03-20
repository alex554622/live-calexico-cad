
import { useData } from '@/context/data';
import { useAuth } from '@/context/AuthContext';

export const useTimeClockUtils = () => {
  const { user } = useAuth();
  const { officers } = useData();
  
  // Find matching officer for the current user
  const findOfficerIdForUser = () => {
    if (!user) return undefined;
    
    // In a real app, you would have a proper way to link users to officers
    // This is a simplified example using either matching names or emails
    const matchingOfficer = officers.find(officer => 
      (user.name && officer.name.includes(user.name)) ||
      (officer.contactInfo?.email && officer.contactInfo.email === user.username)
    );
    
    return matchingOfficer?.id;
  };
  
  return {
    findOfficerIdForUser
  };
};
