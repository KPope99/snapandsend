import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Footer } from '../components/common/Footer';
import { usePageContent } from '../hooks/usePageContent';

const HOME_ICON = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Do I need an account to submit a report?',
    a: 'No. You can submit an incident report without creating an account. SnapAndSend assigns an anonymous device identity that allows you to track your own submissions. Creating an account is optional and unlocks a persistent history across devices.',
  },
  {
    q: 'What types of incidents can I report?',
    a: 'You can report any community infrastructure or environmental issue — including potholes and damaged roads, broken streetlights, illegal dumping, flooding, water leaks, vandalism, fallen trees, and other public hazards that require attention from authorities or service providers.',
  },
  {
    q: 'What happens after I submit a report?',
    a: 'Your report is immediately logged and visible to relevant authorities and registered Fixers in your area. It enters a status lifecycle: Pending → Verified → Investigating → Resolved. You can track its progress at any time under My Incidents.',
  },
  {
    q: 'Why was my report merged with another?',
    a: 'If your report matches an existing unresolved incident within 200 metres of the same category, SnapAndSend automatically merges it as a verification. This strengthens the existing report and signals to authorities that multiple community members have independently confirmed the issue — increasing the urgency for action.',
  },
  {
    q: 'How does SnapAndSend know which authorities to notify?',
    a: 'Reports are routed based on category and location to registered partner organisations and Fixers operating in that area. As our partner network grows, routing becomes more precise. If no registered partner covers your area yet, your report is still logged and visible to our admin team.',
  },
  {
    q: 'Can I submit a report without a photo?',
    a: 'A photo is required for every submission. This ensures reports are concrete, verifiable, and actionable. A clear photo of the issue significantly increases the likelihood of a prompt response.',
  },
  {
    q: 'How do I track my submitted reports?',
    a: "Tap My Incidents on the home screen to view all reports submitted from your device. Each report shows its current status, submission date, and any updates from the authority or Fixer assigned to it.",
  },
  {
    q: 'What does "Verified" status mean?',
    a: 'A report is marked Verified when at least two community members have independently submitted the same issue from the same location. Verified reports carry more weight and are prioritised in the response queue.',
  },
  {
    q: 'Is my personal information shared with authorities?',
    a: 'No personal information is shared without your consent. Anonymous reports contain only the incident description, category, location, and photos. If you create an account, your profile details remain private unless you choose to share them.',
  },
  {
    q: 'How do I become a Fixer?',
    a: 'Fixer registration is coming soon. If you are a tradesperson, contractor, or community service provider interested in receiving incident leads in your area, contact us at fixers@tech84.io.',
  },
  {
    q: 'I submitted a report but it is not showing in My Incidents. What should I do?',
    a: 'My Incidents displays reports submitted from your current device. If you submitted from a different device or cleared your browser data, those reports will not appear. If you believe there is a technical issue, please contact support@tech84.io with the approximate time of submission.',
  },
  {
    q: 'How do I report a problem with the app?',
    a: 'Please email support@tech84.io with a description of the issue, the device and browser you are using, and any screenshots if available. Our team will respond within 2 business days.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
      >
        <span className="text-sm font-semibold text-gray-800 leading-snug">{q}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-emerald-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export function HelpCentrePage() {
  const { t } = usePageContent('help');
  return (
    <div className="flex flex-col h-full">
      <nav className="bg-emerald-600 text-white px-4 py-3">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl font-black tracking-wider metallic-white">SnapAndSend</h1>
        </div>
      </nav>

      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={HOME_ICON} />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Help Centre</h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">

        <div className="bg-emerald-600 text-white px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-2">Support</p>
          <h2 className="text-2xl font-black leading-snug mb-3">{t('hero_tagline')}</h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-sm mx-auto">{t('hero_body')}</p>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

          {/* Quick Links */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'How It Works', to: '/how-it-works', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'About Us', to: '/about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'Become a Fixer', to: '/fixers', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
                { label: 'Collaborate', to: '/collaborate', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
              ].map(({ label, to, icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm text-center hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Still Need Help?</h3>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              {[
                { label: 'General Support', email: 'support@tech84.io' },
                { label: 'Partnerships', email: 'partnerships@tech84.io' },
                { label: 'Fixer Registration', email: 'fixers@tech84.io' },
              ].map(({ label, email }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-emerald-600">{email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">We aim to respond to all enquiries within 2 business days.</p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
