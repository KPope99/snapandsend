import { Link } from 'react-router-dom';
import { Footer } from '../components/common/Footer';

const HOME_ICON = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';

export function HowItWorksPage() {
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
        <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">

        <div className="bg-emerald-600 text-white px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-2">Simple by Design</p>
          <h2 className="text-2xl font-black leading-snug mb-3">From Problem to Resolution in Three Steps</h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-sm mx-auto">
            SnapAndSend is built to be used in under 60 seconds, with no account, no forms, and no friction.
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

          {/* Core Steps */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-5">The Three-Step Process</h3>
            <div className="space-y-5">
              {[
                {
                  step: '1',
                  colour: 'sky',
                  title: 'Snap',
                  subtitle: 'Take a Photo of the Problem',
                  body: 'Open SnapAndSend and use your phone camera to photograph the issue — a pothole, broken streetlight, illegal dumping, flooding, or any community hazard. A clear photo ensures faster action from authorities.',
                },
                {
                  step: '2',
                  colour: 'emerald',
                  title: 'Send',
                  subtitle: 'Submit Your Report',
                  body: 'Add a short description, select the incident category, and confirm your location. Your report is submitted instantly to the relevant authorities and registered Fixers in your area. No account needed.',
                },
                {
                  step: '3',
                  colour: 'amber',
                  title: 'Solve',
                  subtitle: 'Track Progress to Resolution',
                  body: 'Once submitted, your report enters our tracking system. You can follow its status from Pending through Investigating to Resolved — giving you full visibility on the actions being taken.',
                },
              ].map(({ step, colour, title, subtitle, body }) => (
                <div key={step} className="flex gap-4 bg-white rounded-2xl shadow-sm p-5">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${colour}-100 flex items-center justify-center`}>
                    <span className={`text-sm font-bold text-${colour}-700`}>{step}</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{title}</p>
                    <p className="text-sm font-semibold text-gray-600 mb-1">{subtitle}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Smart Deduplication */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Collective Verification</h3>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                When multiple people in the same neighbourhood report the same issue independently, SnapAndSend automatically recognises the pattern and merges the reports into a single verified incident — amplifying community voice.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Each additional submission adds weight to the incident, escalating its priority and increasing the likelihood of a swift response from authorities.
              </p>
            </div>
          </section>

          {/* Status Lifecycle */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Incident Status Lifecycle</h3>
            <div className="space-y-3">
              {[
                { label: 'Pending', desc: 'Your report has been received and is awaiting review.' },
                { label: 'Verified', desc: 'Multiple community members have independently confirmed the issue.' },
                { label: 'Investigating', desc: 'An authority or Fixer has picked up the report and is on-site or conducting a review.' },
                { label: 'Resolved', desc: 'The issue has been addressed. Resolution notes and evidence are visible on the report.' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <span className="flex-shrink-0 mt-0.5 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Privacy & Anonymity</h3>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                You do not need to create an account to submit a report. SnapAndSend assigns an anonymous device identity so you can track your own submissions without exposing your personal information to other users or authorities.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Creating a profile is optional — it unlocks features like display names and persistent history across devices.
              </p>
            </div>
          </section>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-6 text-center">
            <p className="text-sm font-semibold text-emerald-800 mb-1">Ready to report an issue?</p>
            <p className="text-xs text-emerald-600 mb-4">It takes less than 60 seconds.</p>
            <Link
              to="/report"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
            >
              Report an Incident
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
