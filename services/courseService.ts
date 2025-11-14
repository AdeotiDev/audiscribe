import { Course } from '../types';
import * as authService from './authService';

const COURSES_KEY = 'audiscribe_courses';

// Helper to get courses from localStorage
export const getCourses = (): Course[] => {
  const coursesJson = localStorage.getItem(COURSES_KEY);
  return coursesJson ? JSON.parse(coursesJson) : [];
};

// Helper to save courses to localStorage
const saveCourses = (courses: Course[]) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

export const saveCourse = (courseData: { id: string | null, title: string, content: string }, authorId: string) => {
  const courses = getCourses();
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    throw new Error("User must be logged in to save a course.");
  }

  if (courseData.id) {
    // Update existing course
    const updatedCourses = courses.map(course =>
      course.id === courseData.id
        ? { ...course, title: courseData.title, content: courseData.content }
        : course
    );
    saveCourses(updatedCourses);
  } else {
    // Add new course
    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseData.title,
      author: currentUser.email,
      authorId,
      creationDate: new Date().toISOString(),
      content: courseData.content,
    };
    saveCourses([...courses, newCourse]);
  }
};