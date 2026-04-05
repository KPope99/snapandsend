import { useMemo, useState } from 'react';
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
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [userCustomCategories, setUserCustomCategories] = useState<CategoryInfo[]>([]);

  const categories = useMemo(() => {
    const result: CategoryInfo[] = [...BASE_CATEGORIES];

    // Add AI-suggested category if not already in base
    if (customCategory && !BASE_CATEGORIES.find(c => c.value === customCategory.value)) {
      const otherIndex = result.findIndex(c => c.value === 'other');
      const newCat: CategoryInfo = {
        value: customCategory.value,
        label: customCategory.label,
        icon: generateCategoryIcon(customCategory.value),
        isCustom: true,
      };
      otherIndex >= 0 ? result.splice(otherIndex, 0, newCat) : result.push(newCat);
    }

    // Add user-defined custom categories
    userCustomCategories.forEach(cat => {
      if (!result.find(c => c.value === cat.value)) {
        const otherIndex = result.findIndex(c => c.value === 'other');
        otherIndex >= 0 ? result.splice(otherIndex, 0, cat) : result.push(cat);
      }
    });

    return result;
  }, [customCategory, userCustomCategories]);

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;

    const categoryValue = trimmed.toLowerCase().replace(/\s+/g, '-');
    const categoryLabel = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    const newCat: CategoryInfo = {
      value: categoryValue,
      label: categoryLabel,
      icon: generateCategoryIcon(categoryValue),
      isCustom: true,
    };

    setUserCustomCategories(prev => [...prev, newCat]);
    onChange(categoryValue);
    setNewCategoryInput('');
    setShowAddInput(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Category</label>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
              value === cat.value
                ? 'border-emerald-500 bg-emerald-50'
                : cat.isCustom
                  ? 'border-purple-200 bg-purple-50 hover:border-purple-300'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className={`text-xs mt-1 text-center leading-tight ${cat.isCustom ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
              {cat.label}
            </span>
            {cat.isCustom && (
              <span className="text-[10px] text-purple-500">AI</span>
            )}
          </button>
        ))}

        {/* Add custom category button */}
        <button
          type="button"
          onClick={() => setShowAddInput(true)}
          className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
        >
          <span className="text-2xl">➕</span>
          <span className="text-xs mt-1 text-gray-500">Add New</span>
        </button>
      </div>

      {/* Inline add category input */}
      {showAddInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
            placeholder="e.g. Fire, Flooding, Assault..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowAddInput(false); setNewCategoryInput(''); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
