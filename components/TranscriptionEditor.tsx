import React, { useState, useRef, useEffect } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { enhanceTextWithAI, transcribeAudioFile } from '../services/geminiService';
import Button from './common/Button';
import Loader from './common/Loader';
import { MicIcon, StopIcon, UploadIcon, WandIcon } from './common/icons';
import { Course } from '../types';

interface TranscriptionEditorProps {
  courseToEdit?: Course | null;
  onSave: (courseData: { id: string | null; content: string; title: string }) => void;
  onCancel: () => void;
}

const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({ courseToEdit, onSave, onCancel }) => {
  // FIX: Destructure `setError` from `useSpeechToText` to make it available for handling file upload errors.
  const { isListening, transcript, error, startListening, stopListening, setFullTranscript, setError } = useSpeechToText();
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setFullTranscript(courseToEdit.content);
      // If content was already enhanced, show that, otherwise show original
      setEnhancedContent(courseToEdit.content);
    }
  }, [courseToEdit, setFullTranscript]);
  
  const isBusy = isListening || isUploading || isEnhancing;

  const handleEnhance = async () => {
    if (!transcript) return;
    setIsEnhancing(true);
    try {
      const result = await enhanceTextWithAI(transcript);
      setEnhancedContent(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset UI state for new transcription
    setFullTranscript('');
    setEnhancedContent('');
    setError(null);
    setIsUploading(true);

    try {
      const transcription = await transcribeAudioFile(file);
      setFullTranscript(transcription);
    } catch (err: any)
{
      setError(err.message || 'An unknown error occurred during upload.');
    } finally {
      setIsUploading(false);
      // Reset file input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveCourse = () => {
    onSave({
      id: courseToEdit?.id || null,
      content: enhancedContent || transcript,
      title: title || 'Untitled Course'
    });
  };

  const renderRecordButton = () => {
    const busyForRecord = isUploading || isEnhancing;
    if (isListening) {
      return (
        <Button onClick={stopListening} variant="danger" leftIcon={<StopIcon />}>
          Stop
        </Button>
      );
    }

    if (error && transcript) {
       return (
        <Button onClick={() => startListening({ continueTranscript: true })} leftIcon={<MicIcon />} disabled={busyForRecord}>
          Continue Recording
        </Button>
      );
    }

    return (
      <Button onClick={() => startListening()} leftIcon={<MicIcon />} disabled={busyForRecord}>
        Record
      </Button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-brand-dark dark:text-white">{courseToEdit ? 'Edit Lecture' : 'New Lecture'}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isBusy}>Cancel</Button>
          <Button onClick={handleSaveCourse} disabled={!transcript || isBusy} className="bg-red-700 text-white px-4">Save Course</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <label htmlFor="course-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Course Title</label>
        <input
          type="text"
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Introduction to Quantum Physics"
          className="mt-1 block w-full rounded-md border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white shadow-sm p-4 focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          disabled={isBusy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Transcription */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Transcript</h2>
            <div className="flex items-center gap-2">
              {renderRecordButton()}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} leftIcon={<UploadIcon />} disabled={isBusy}>
                {isUploading ? 'Transcribing...' : 'Upload'}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="relative flex-grow">
             {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10 rounded-md">
                <Loader text="Transcribing audio..." />
              </div>
            )}
            <textarea
              value={transcript}
              onChange={(e) => setFullTranscript(e.target.value)}
              placeholder={isListening ? "Listening..." : "Start recording, upload an audio file, or paste text here..."}
              className="w-full h-full p-3 border border-slate-300 rounded-md focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              rows={15}
              disabled={isBusy}
            />
          </div>
        </div>

        {/* Right Side: AI Enhancement */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">AI Enhanced Course</h2>
            <Button onClick={handleEnhance} disabled={!transcript || isBusy} leftIcon={<WandIcon />}>
              Enhance with AI
            </Button>
          </div>
          <div className="relative flex-grow w-full border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700/50 overflow-y-auto">
            {isEnhancing && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10 rounded-md">
                <Loader text="Enhancing text..." />
              </div>
            )}
            <textarea
                value={enhancedContent}
                onChange={(e) => setEnhancedContent(e.target.value)}
                placeholder="Your AI-enhanced course content will appear here. You can also edit it directly."
                className="w-full h-full p-3 bg-transparent rounded-md focus:ring-brand-blue focus:border-brand-blue resize-none font-sans text-sm dark:text-slate-200"
                rows={15}
                disabled={isBusy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionEditor;