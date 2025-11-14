export enum UserRole {
  Lecturer = 'Lecturer',
  Learner = 'Learner',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: string;
  title: string;
  author: string; // author's email or name
  authorId: string; // author's user ID
  creationDate: string;
  content: string;
}

export type AppView = 'auth' | 'dashboard' | 'editor' | 'reader' | 'welcome';