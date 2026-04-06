import { Link } from 'react-router-dom';
import { Footer } from '../components/common/Footer';
import { usePageContent } from '../hooks/usePageContent';

const HOME_ICON = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((p, i) => (
        <p key={i} className={`text-sm text-gray-600 leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>{p}</p>
      ))}
    </>
  );
}

export function FixersPage() {
  const { t } = usePageContent('fixers');
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
        <h2 className="text-xl font-bold text-gray-900">Fixers</h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">

        <div className="bg-emerald-600 text-white px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-2">Community Problem-Solvers</p>
          <h2 className="text-2xl font-black leading-snug mb-3">{t('hero_tagline')}</h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-sm mx-auto">{t('hero_body')}</p>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

          {/* What is a Fixer */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">What Is a Fixer?</h3>
            <Paragraphs text={t('what_is_a_fixer')} />
          </section>

          {/* Why Become a Fixer */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Why Become a Fixer?</h3>
            <div className="space-y-4">
              {[
                {
                  icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
                  title: 'Receive Targeted Job Leads',
                  body: 'Get notified of verified incidents in your service area that match your trade or skill set — removing the need to prospect for work and connecting you directly to community need.',
                },
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  title: 'Build a Verified Track Record',
                  body: 'Every incident you resolve is logged on the platform with timestamps, resolution notes, and optional photo evidence. Your public profile builds credibility over time — visible to the community and to partner organisations.',
                },
                {
                  icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
                  title: 'Serve Your Community',
                  body: "There's deep value in being the person who shows up. Fixers are visible contributors to neighbourhood improvement — recognised by residents and local authorities alike.",
                },
                {
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'Access Paid Opportunities',
                  body: 'As our partner network grows, funded incidents — raised by councils, NGOs, or utility providers — will be routed directly to qualified registered Fixers through the platform.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who Can Be a Fixer */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Who Can Register as a Fixer?</h3>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              {[
                'Independent tradespeople — plumbers, electricians, builders, landscapers',
                'Environmental and waste management contractors',
                'Road maintenance and civil engineering crews',
                'Community-based organisations and volunteer groups',
                'Local government maintenance and works departments',
                'Utility service teams (water, electricity, telecoms)',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works for Fixers */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works for Fixers</h3>
            <div className="space-y-3">
              {[
                { n: '1', t: 'Register', d: 'Sign up as a Fixer, specifying your trade categories and service areas.' },
                { n: '2', t: 'Get Notified', d: 'Receive alerts when verified incidents matching your profile are raised nearby.' },
                { n: '3', t: 'Claim & Respond', d: 'Accept the job, update the status to Investigating, and head to the site.' },
                { n: '4', t: 'Resolve & Log', d: 'Mark the incident as resolved, add resolution notes, and optionally upload a completion photo.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t}</p>
                    <p className="text-sm text-gray-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-6 text-center">
            <p className="text-sm font-semibold text-emerald-800 mb-1">Ready to become a Fixer?</p>
            <p className="text-xs text-emerald-600 mb-1">Fixer registration is coming soon.</p>
            <p className="text-xs font-medium text-emerald-700 mb-4">fixers@tech84.io</p>
            <Link
              to="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
