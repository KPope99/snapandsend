import { useMemo } from 'react';
import { BASE_CATEGORIES, CategoryInfo, ReportCategory, generateCategoryIcon } from '../../types';

interface CategoryPickerProps {
  value: ReportCategory;
  onChange: (category: ReportCategory) => void;
  customCategory?: {
    value: string;
    label: string;
  };
}

export function CategoryPicker({ value, onChange, customCategory }: CategoryPickerProps) {
  // Build the list of categories to display
  const categories = useMemo(() => {
    const result: CategoryInfo[] = [...BASE_CATEGORIES];

    // Add custom category from AI if it doesn't exist in base categories
    if (customCategory && !BASE_CATEGORIES.find(c => c.value === customCategory.value)) {
      // Insert before 'other' category
      const otherIndex = result.findIndex(c => c.value === 'other');
      const newCategory: CategoryInfo = {
        value: customCategory.value,
        label: customCategory.label,
        icon: generateCategoryIcon(customCategory.value),
        isCustom: true
      };

      if (otherIndex >= 0) {
        result.splice(otherIndex, 0, newCategory);
      } else {
        result.push(newCategory);
      }
    }

    return result;
  }, [customCategory]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Category</label>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
              value === category.value
                ? 'border-emerald-500 bg-emerald-50'
                : category.isCustom
                  ? 'border-purple-200 bg-purple-50 hover:border-purple-300'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className={`text-xs mt-1 ${category.isCustom ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
              {category.label}
            </span>
            {category.isCustom && (
              <span className="text-[10px] text-purple-500">AI</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
