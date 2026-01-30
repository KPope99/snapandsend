import { CATEGORIES, ReportCategory } from '../../types';

interface CategoryPickerProps {
  value: ReportCategory;
  onChange: (category: ReportCategory) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Category</label>
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
              value === category.value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="text-xs mt-1 text-gray-600">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
