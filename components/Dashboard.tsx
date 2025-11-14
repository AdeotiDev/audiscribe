import React from 'react';
import { UserRole, Course, User } from '../types';
import Button from './common/Button';
import { BookOpenIcon, PencilIcon } from './common/icons';

interface DashboardProps {
  currentUser: User;
  courses: Course[];
  onStartNewLecture: () => void;
  onViewCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, courses, onStartNewLecture, onViewCourse, onEditCourse }) => {
  const isLecturer = currentUser.role === UserRole.Lecturer;
  
  const displayedCourses = isLecturer
    ? courses.filter(course => course.authorId === currentUser.id)
    : courses;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-dark dark:text-white">My Courses</h1>
        {isLecturer && (
          <Button onClick={onStartNewLecture} className="px-8 py-3 text-lg bg-red-700 text-white">
            Start New Lecture
          </Button>
        )}
      </div>

      {displayedCourses.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow">
          <BookOpenIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
            {isLecturer ? 'No Courses Created Yet' : 'No Courses Available'}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isLecturer ? 'Start a new lecture to create your first course.' : 'Courses created by lecturers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map(course => (
            <div 
              key={course.id} 
              className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2 truncate cursor-pointer" onClick={() => onViewCourse(course)}>{course.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  By {course.author}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Created on {new Date(course.creationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span 
                  className="text-brand-blue font-semibold text-sm cursor-pointer"
                  onClick={() => onViewCourse(course)}
                >
                  View Course &rarr;
                </span>
                {isLecturer && course.authorId === currentUser.id && (
                  <Button 
                    variant="secondary"
                    onClick={() => onEditCourse(course)}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;