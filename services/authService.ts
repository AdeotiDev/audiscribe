import { User, UserRole } from '../types';

const USERS_KEY = 'audiscribe_users';
const SESSION_KEY = 'audiscribe_session';

// Helper to get users from localStorage
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signUp = (email: string, password: string, role: UserRole): User => {
  const users = getUsers();
  const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // In a real app, you would hash the password
  const newUser: User = {
    id: Date.now().toString(),
    email,
    role,
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  // Automatically log in the user after sign up
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));

  return newUser;
};

export const login = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // In a real app, you would verify the password hash
  if (!user) {
    throw new Error('Invalid email or password.');
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(SESSION_KEY);
  return userJson ? JSON.parse(userJson) : null;
};