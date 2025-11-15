import React from 'react';
import { Course } from '../types';
import Button from './common/Button';
import { ChevronLeftIcon } from './common/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CourseReaderProps {
  course: Course;
  onBack: () => void;
}

const CourseReader: React.FC<CourseReaderProps> = ({ course, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button onClick={onBack} variant="secondary" leftIcon={<ChevronLeftIcon className="h-4 w-4" />}>
          Back to Courses
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 md:p-12">
        <header className="border-b dark:border-slate-700 pb-6 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white">{course.title}</h1>
          <p className="mt-2 text-md text-slate-500 dark:text-slate-400">
            By {course.author} &bull; Published on {new Date(course.creationDate).toLocaleDateString()}
          </p>
        </header>
        
        <article className="prose prose-lg max-w-none prose-h1:text-brand-dark prose-h2:text-slate-800 prose-a:text-brand-blue dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {course.content}
          </ReactMarkdown>
        </article>
      </div>
      
      <div className="mt-8 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-brand-dark dark:text-slate-200">Project Credit:</h3>
        <div className="mt-4 h-48 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
               <p className="my-4 text-lg border-t-blue-600 py-4 px-2 border-t-1 font-medium"> <span className="text-red-700 dark:text-white font-semibold">Project by</span> Ibidun Moses Segun. <span className="text-red-700 dark:text-white font-semibold">Matric number:</span> NOU  251992667.</p>
        </div>
      </div>
    </div>
  );
};

export default CourseReader;