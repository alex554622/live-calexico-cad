
import { User } from '@/types';
import { addNotification } from '../notifications';
import { mockUsers } from '../mockData';

// Simulating server-side data store
let users: User[] = [...mockUsers];
let currentUser: User | null = null;

export const login = (username: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check for our administrator account
      if (username === 'alexvalla' && password === '!345660312') {
        const user = users[0];
        currentUser = user;
        resolve(user);
      } else {
        // Check for other users created through the settings page
        const user = users.find(u => 
          u.username === username && 
          (u as any).password === password
        );
        
        if (user) {
          currentUser = user;
          resolve(user);
        } else {
          resolve(null);
        }
      }
    }, 800);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      resolve();
    }, 500);
  });
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentUser);
    }, 300);
  });
};

export const updateUser = (id: string, updates: Partial<User & { password?: string }>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        const { password, ...userUpdates } = updates;
        
        users[userIndex] = {
          ...users[userIndex],
          ...userUpdates,
        };
        
        if (password) {
          (users[userIndex] as any).password = password;
        }
        
        if (currentUser && currentUser.id === id) {
          currentUser = { ...users[userIndex] };
        }
        
        addNotification({
          title: 'User Updated',
          message: `${users[userIndex].name}'s information has been updated`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'user',
            id
          }
        });
        
        resolve(users[userIndex]);
      } else {
        throw new Error('User not found');
      }
    }, 500);
  });
};

export const createUser = (userData: { 
  username: string; 
  name: string; 
  role: 'admin' | 'dispatcher' | 'supervisor' | 'officer';
  password: string;
}): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        id: String(users.length + 1),
        username: userData.username,
        name: userData.name,
        role: userData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1E40AF&color=fff`,
        permissions: getDefaultPermissionsForRole(userData.role)
      };
      
      (newUser as any).password = userData.password;
      
      users = [...users, newUser];
      
      addNotification({
        title: 'New User Created',
        message: `${newUser.name} has been added as ${newUser.role}`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        relatedTo: {
          type: 'user',
          id: newUser.id
        }
      });
      
      resolve(newUser);
    }, 500);
  });
};

export const deleteUser = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currentUser && currentUser.id === id) {
        reject(new Error('Cannot delete the currently logged in user'));
        return;
      }

      const userToDelete = users.find(u => u.id === id);
      if (userToDelete && userToDelete.username === 'alexvalla') {
        reject(new Error('The administrator account cannot be deleted'));
        return;
      }

      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        const deletedUser = users[userIndex];
        users = users.filter(u => u.id !== id);
        
        addNotification({
          title: 'User Deleted',
          message: `${deletedUser.name} has been removed from the system`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'user',
            id
          }
        });
        
        resolve();
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
};

export const getAllUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...users]);
    }, 300);
  });
};

export const resetUserPassword = (id: string, newPassword: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        (users[userIndex] as any).password = newPassword;
        
        addNotification({
          title: 'Password Reset',
          message: `${users[userIndex].name}'s password has been reset`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'user',
            id
          }
        });
        
        resolve();
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
};

// Helper function to set default permissions based on role
const getDefaultPermissionsForRole = (role: 'admin' | 'dispatcher' | 'supervisor' | 'officer') => {
  switch (role) {
    case 'admin':
      return {
        createIncident: true,
        editIncident: true,
        assignOfficer: true,
        createUser: true,
        editUser: true,
        editOfficer: true,
        createOfficer: true,
        viewOfficerDetails: true,
        assignIncidentToOfficer: true
      };
    case 'supervisor':
      return {
        createIncident: true,
        editIncident: true,
        assignOfficer: true,
        editOfficer: true,
        createOfficer: true,
        viewOfficerDetails: true,
        assignIncidentToOfficer: true
      };
    case 'dispatcher':
      return {
        createIncident: true,
        editIncident: true,
        assignOfficer: true,
        viewOfficerDetails: true,
        assignIncidentToOfficer: true
      };
    case 'officer':
      return {
        createIncident: true,
        viewOfficerDetails: true
      };
    default:
      return {};
  }
};
