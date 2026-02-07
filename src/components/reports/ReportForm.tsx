import { useState, useEffect } from 'react';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { CategoryPicker } from './CategoryPicker';
import { ReportCategory } from '../../types';

interface ReportFormProps {
  onSubmit: (data: { title: string; description: string; category: ReportCategory }) => void;
  isLoading?: boolean;
  initialValues?: {
    title?: string;
    description?: string;
    category?: ReportCategory;
  };
}

export function ReportForm({ onSubmit, isLoading, initialValues }: ReportFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState<ReportCategory>(initialValues?.category || 'other');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Update form when initial values change
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
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Submit Report
      </Button>
    </form>
  );
}
