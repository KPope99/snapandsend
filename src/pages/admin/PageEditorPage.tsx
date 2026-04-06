import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { PAGE_DEFAULTS, Sections } from '../../hooks/usePageContent';

function getToken(): string | null {
  return localStorage.getItem('staff_jwt');
}

async function fetchPageContent(slug: string): Promise<Sections> {
  const res = await fetch(`/api/pages/${slug}`);
  const data = await res.json();
  return data.sections || {};
}

async function savePageContent(slug: string, sections: Sections): Promise<void> {
  const token = getToken();
  const res = await fetch(`/api/pages/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sections }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Save failed');
  }
}

export function PageEditorPage() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useStaffAuth();

  const [selectedSlug, setSelectedSlug] = useState('about');
  const [draft, setDraft] = useState<Sections>({});
  const [saved, setSaved] = useState<Sections>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Guard
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('/admin/login');
  }, [isAuthenticated, isAdmin, navigate]);

  const load = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const sections = await fetchPageContent(slug);
      setSaved(sections);
      // Initialise draft: fill saved values, leave blanks as empty string
      const pageDef = PAGE_DEFAULTS[slug];
      const initialDraft: Sections = {};
      Object.keys(pageDef?.sections || {}).forEach(key => {
        initialDraft[key] = sections[key] ?? '';
      });
      setDraft(initialDraft);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(selectedSlug); }, [selectedSlug, load]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Only save non-empty fields; empty means "use default"
      const toSave: Sections = {};
      Object.entries(draft).forEach(([k, v]) => {
        if (v.trim() !== '') toSave[k] = v.trim();
      });
      await savePageContent(selectedSlug, toSave);
      setSaved(toSave);
      setToast({ type: 'success', msg: 'Page content saved successfully.' });
    } catch (e) {
      setToast({ type: 'error', msg: e instanceof Error ? e.message : 'Save failed' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleReset = () => {
    const pageDef = PAGE_DEFAULTS[selectedSlug];
    const resetDraft: Sections = {};
    Object.keys(pageDef?.sections || {}).forEach(key => {
      resetDraft[key] = saved[key] ?? '';
    });
    setDraft(resetDraft);
  };

  const pageDef = PAGE_DEFAULTS[selectedSlug];
  const isDirty = JSON.stringify(draft) !== JSON.stringify(
    Object.fromEntries(Object.keys(pageDef?.sections || {}).map(k => [k, saved[k] ?? '']))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Page Content Editor</h1>
              <p className="text-xs text-gray-500">Edit public-facing page content</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* Page Selector */}
        <nav className="w-48 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Pages</p>
          <ul className="space-y-1">
            {Object.entries(PAGE_DEFAULTS).map(([slug, def]) => (
              <li key={slug}>
                <button
                  onClick={() => setSelectedSlug(slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSlug === slug
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {def.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Editor Panel */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="w-8 h-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{pageDef?.label}</h2>
                {isDirty && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Discard changes
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Leave a field blank to use the default content. Changes go live immediately after saving.
              </p>

              {pageDef && Object.entries(pageDef.sections).map(([key, meta]) => (
                <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    {meta.label}
                  </label>
                  <p className="text-xs text-gray-400 mb-2 italic">
                    Default: {meta.default.slice(0, 80)}{meta.default.length > 80 ? '…' : ''}
                  </p>
                  <textarea
                    rows={meta.default.includes('\n') ? 6 : 3}
                    value={draft[key] ?? ''}
                    onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Leave blank to use default…`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                {isDirty && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Discard
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
