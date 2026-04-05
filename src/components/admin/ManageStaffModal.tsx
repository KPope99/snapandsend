import { useState, useEffect } from 'react';
import { useStaffAuth, StaffMember, STAFF_CATEGORIES } from '../../context/StaffAuthContext';

interface ManageStaffModalProps {
  onClose: () => void;
}

export function ManageStaffModal({ onClose }: ManageStaffModalProps) {
  const { createStaff, listStaff, deleteStaff } = useStaffAuth();

  const [members, setMembers] = useState<StaffMember[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');

  // Create form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const nonAdminCategories = STAFF_CATEGORIES.filter(c => c.value !== 'all');

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setIsLoadingList(true);
    try {
      const data = await listStaff();
      setMembers(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingList(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!category) { setFormError('Please select a department'); return; }

    setIsCreating(true);
    const result = await createStaff(name.trim(), email.trim(), password, category);
    setIsCreating(false);

    if (!result.success) {
      setFormError(result.error || 'Failed to create staff member');
      return;
    }

    setName(''); setEmail(''); setPassword(''); setCategory('');
    setView('list');
    loadMembers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member? They will no longer be able to log in.')) return;
    setDeletingId(id);
    await deleteStaff(id);
    setDeletingId(null);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const getCategoryLabel = (value: string) =>
    STAFF_CATEGORIES.find(c => c.value === value)?.label || value;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Staff</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switch */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setView('list')}
            className={`py-3 text-sm font-medium border-b-2 mr-6 transition-colors ${
              view === 'list' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Staff Members
          </button>
          <button
            onClick={() => setView('create')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              view === 'create' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Add New Staff
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            isLoadingList ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No staff members yet.</p>
            ) : (
              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-gray-600">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                          {member.isAdmin && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-900 text-white rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        <p className="text-xs text-gray-400">{getCategoryLabel(member.category)}</p>
                      </div>
                    </div>
                    {!member.isAdmin && (
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="ml-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                        title="Remove staff member"
                      >
                        {deletingId === member.id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g. John Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="staff@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-gray-400">Share this with the staff member so they can log in.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                  required
                >
                  <option value="">Select department</option>
                  {nonAdminCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">Staff will only see incidents for their department.</p>
              </div>

              {formError && (
                <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">{formError}</div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gray-900 text-white py-2.5 text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : 'Create Staff Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
