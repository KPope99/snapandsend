import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Top Nav */}
      <nav className="bg-emerald-600 text-white px-4 py-3">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl font-black tracking-wider metallic-white">
            SnapAndSend
          </h1>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">About Us</h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">

        {/* Hero */}
        <div className="bg-emerald-600 text-white px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-2">Our Mission</p>
          <h2 className="text-2xl font-black leading-snug mb-3">
            Connecting Communities to the People Who Fix Things
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-sm mx-auto">
            SnapAndSend is a community-first platform that puts the power of civic accountability directly in your pocket.
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

          {/* Who We Are */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Who We Are</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We are <span className="font-semibold text-gray-800">Tech84</span> — a technology startup built on the belief that communities deserve better tools to communicate, collaborate, and create change. Founded by a team of engineers, civic advocates, and problem-solvers, we design software that bridges the gap between people who notice problems and the authorities and fixers who have the power to resolve them.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              SnapAndSend is our flagship product — a mobile-first incident reporting platform designed for everyday citizens to report infrastructure issues, environmental hazards, and community concerns quickly, simply, and effectively.
            </p>
          </section>

          {/* The Problem We Solve */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">The Problem We Solve</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Across cities and towns, critical issues go unreported — not because people don't care, but because reporting is too cumbersome. Phone calls go unanswered. Emails disappear. Nothing gets done.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We built SnapAndSend to remove that friction entirely. Three taps is all it takes to snap a photo, describe the issue, and get it in front of the right people — instantly.
            </p>
          </section>

          {/* Our Values */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">What We Stand For</h3>
            <div className="space-y-4">
              {[
                {
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                  title: 'Community First',
                  body: 'Every decision we make starts with one question: does this make life better for the communities we serve? We are not a data company — we are a community platform.',
                },
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  title: 'Accountability',
                  body: 'We believe public spaces belong to the public. Authorities and fixers on our platform commit to transparency — every report receives a response trail visible to the reporter.',
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Speed & Simplicity',
                  body: 'Technology should not be a barrier. SnapAndSend is designed to work on any smartphone, with minimal steps and no account required to submit a report.',
                },
                {
                  icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
                  title: 'Collective Intelligence',
                  body: 'When multiple community members report the same issue independently, our platform recognises the pattern and elevates the priority — turning individual voices into a verified collective signal.',
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

          {/* Where We're Going */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Where We Are Going</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We are an early-stage startup with a big vision. Today, SnapAndSend helps communities report and track local incidents. Tomorrow, we are building deeper integrations with local government systems, utility providers, and community organisations — creating a full-stack civic engagement layer that makes every neighbourhood smarter and more responsive.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We are actively seeking partnerships with local authorities, NGOs, urban planners, and impact investors who share our belief that technology can — and should — serve the public good.
            </p>
          </section>

          {/* CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-6 text-center">
            <p className="text-sm font-semibold text-emerald-800 mb-1">Ready to make a difference?</p>
            <p className="text-xs text-emerald-600 mb-4">Join thousands of community members already using SnapAndSend.</p>
            <Link
              to="/report"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
            >
              Report an Incident
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white px-4 py-4 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Tech84. All rights reserved.</p>
      </footer>
    </div>
  );
}
