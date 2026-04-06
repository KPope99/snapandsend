import { Link } from 'react-router-dom';

const HOME_ICON = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';

export function CollaboratePage() {
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
        <h2 className="text-xl font-bold text-gray-900">Collaborate with Us</h2>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">

        <div className="bg-emerald-600 text-white px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-2">Partnerships</p>
          <h2 className="text-2xl font-black leading-snug mb-3">Build Better Communities, Together</h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-sm mx-auto">
            We are actively seeking partners who share our commitment to civic technology, community empowerment, and sustainable urban development.
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

          {/* Why Partner */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why Partner with SnapAndSend?</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              SnapAndSend sits at the intersection of civic engagement and technology. As a growing platform with users actively reporting and tracking issues across communities, we offer partners a unique channel to engage citizens, demonstrate accountability, and drive measurable outcomes in public service delivery.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We are an early-stage startup with ambition, agility, and a clear social mission. Partnering with us now means shaping the direction of the platform and getting ahead of the curve on community-first technology.
            </p>
          </section>

          {/* Who We're Looking For */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Who We Work With</h3>
            <div className="space-y-4">
              {[
                {
                  icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                  title: 'Local & State Government',
                  body: 'We integrate directly with government service desks and public works departments, providing a real-time digital intake channel for citizen-reported issues — reducing call centre load and improving response times.',
                },
                {
                  icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
                  title: 'NGOs & Civil Society Organisations',
                  body: 'If your mission includes community development, environmental monitoring, or public health, SnapAndSend can serve as your on-the-ground data collection and incident management layer.',
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Utility & Infrastructure Providers',
                  body: 'Water, electricity, road, and telecoms providers can receive structured incident reports directly from affected communities — with geo-tagged photos, location data, and category tagging already included.',
                },
                {
                  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                  title: 'Academic & Research Institutions',
                  body: 'Our anonymised, geo-tagged incident data is a rich resource for urban researchers, public policy analysts, and smart city initiatives. We welcome structured data partnerships with ethical oversight.',
                },
                {
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
                  title: 'Impact Investors & Accelerators',
                  body: 'We are actively seeking seed and pre-Series A funding from investors aligned with civic tech, social impact, and emerging market growth. We are building infrastructure that scales across cities and countries.',
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

          {/* What We Offer */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">What We Offer Partners</h3>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              {[
                'Dedicated API access for real-time incident data ingestion',
                'Webhook notifications for new and updated reports in your area',
                'Custom category tagging aligned to your service domain',
                'White-label options for government and large-scale NGO deployments',
                'Co-branding opportunities and joint community campaigns',
                'Direct input into our product roadmap as a strategic partner',
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

          {/* CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-6 text-center">
            <p className="text-sm font-semibold text-emerald-800 mb-1">Interested in partnering?</p>
            <p className="text-xs text-emerald-600 mb-1">Reach out to our partnerships team.</p>
            <p className="text-xs font-medium text-emerald-700 mb-4">partnerships@tech84.io</p>
            <Link
              to="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>

      <footer className="bg-gray-800 text-white px-4 py-4 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Tech84. All rights reserved.</p>
      </footer>
    </div>
  );
}
