import { useState, useEffect } from 'react';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { CategoryPicker } from './CategoryPicker';
import { ReportCategory } from '../../types';

interface ReportFormProps {
  onSubmit: (data: { title: string; description: string; category: ReportCategory }) => void;
  isLoading?: boolean;
  isAnalyzing?: boolean;
  initialValues?: {
    title?: string;
    description?: string;
    category?: ReportCategory;
  };
  customCategory?: {
    value: string;
    label: string;
  };
}

export function ReportForm({ onSubmit, isLoading, isAnalyzing, initialValues, customCategory }: ReportFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState<ReportCategory>(initialValues?.category || 'other');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Update form when AI suggestions arrive
  useEffect(() => {
    if (initialValues?.title) setTitle(initialValues.title);
    if (initialValues?.description) setDescription(initialValues.description);
    if (initialValues?.category) setCategory(initialValues.category);
  }, [initialValues?.title, initialValues?.description, initialValues?.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({ title: title.trim(), description: description.trim(), category });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* AI Analysis banner */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <svg className="animate-spin h-4 w-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-indigo-700">AI is analyzing your image...</p>
        </div>
      )}

      {!isAnalyzing && initialValues?.title && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm text-emerald-700">AI filled in the details — feel free to edit before submitting.</p>
        </div>
      )}

      <Input
        label="Title"
        placeholder="Brief title for the issue"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        maxLength={100}
      />

      <Textarea
        label="Description"
        placeholder="Describe the issue in detail..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        rows={4}
        maxLength={500}
      />

      <CategoryPicker
        value={category}
        onChange={setCategory}
        customCategory={customCategory}
      />

      <Button type="submit" className="w-full" isLoading={isLoading} disabled={isAnalyzing}>
        Submit Report
      </Button>
    </form>
  );
}
