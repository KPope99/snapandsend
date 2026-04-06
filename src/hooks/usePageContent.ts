import { useState, useEffect } from 'react';

export type Sections = Record<string, string>;

// Default text content for each editable page
export const PAGE_DEFAULTS: Record<string, { label: string; sections: Record<string, { label: string; default: string }> }> = {
  about: {
    label: 'About Us',
    sections: {
      hero_tagline:  { label: 'Hero Tagline', default: 'Connecting Communities to the People Who Fix Things' },
      hero_body:     { label: 'Hero Body', default: 'SnapAndSend is a community-first platform that puts the power of civic accountability directly in your pocket.' },
      who_we_are:    { label: 'Who We Are', default: 'We are Tech84 — a technology startup built on the belief that communities deserve better tools to communicate, collaborate, and create change. Founded by a team of engineers, civic advocates, and problem-solvers, we design software that bridges the gap between people who notice problems and the authorities and fixers who have the power to resolve them.\n\nSnapAndSend is our flagship product — a mobile-first incident reporting platform designed for everyday citizens to report infrastructure issues, environmental hazards, and community concerns quickly, simply, and effectively.' },
      the_problem:   { label: 'The Problem We Solve', default: 'Across cities and towns, critical issues go unreported — not because people don\'t care, but because reporting is too cumbersome. Phone calls go unanswered. Emails disappear. Nothing gets done.\n\nWe built SnapAndSend to remove that friction entirely. Three taps is all it takes to snap a photo, describe the issue, and get it in front of the right people — instantly.' },
      vision:        { label: 'Where We Are Going', default: 'We are an early-stage startup with a big vision. Today, SnapAndSend helps communities report and track local incidents. Tomorrow, we are building deeper integrations with local government systems, utility providers, and community organisations — creating a full-stack civic engagement layer that makes every neighbourhood smarter and more responsive.\n\nWe are actively seeking partnerships with local authorities, NGOs, urban planners, and impact investors who share our belief that technology can — and should — serve the public good.' },
    },
  },
  'how-it-works': {
    label: 'How It Works',
    sections: {
      hero_tagline:  { label: 'Hero Tagline', default: 'From Problem to Resolution in Three Steps' },
      hero_body:     { label: 'Hero Body', default: 'SnapAndSend is built to be used in under 60 seconds, with no account, no forms, and no friction.' },
      step_1:        { label: 'Step 1 – Snap', default: 'Open SnapAndSend and use your phone camera to photograph the issue — a pothole, broken streetlight, illegal dumping, flooding, or any community hazard. A clear photo ensures faster action from authorities.' },
      step_2:        { label: 'Step 2 – Send', default: 'Add a short description, select the incident category, and confirm your location. Your report is submitted instantly to the relevant authorities and registered Fixers in your area. No account needed.' },
      step_3:        { label: 'Step 3 – Solve', default: 'Once submitted, your report enters our tracking system. You can follow its status from Pending through Investigating to Resolved — giving you full visibility on the actions being taken.' },
      verification:  { label: 'Collective Verification', default: 'When multiple people in the same neighbourhood report the same issue independently, SnapAndSend automatically recognises the pattern and merges the reports into a single verified incident — amplifying community voice.\n\nEach additional submission adds weight to the incident, escalating its priority and increasing the likelihood of a swift response from authorities.' },
      privacy:       { label: 'Privacy & Anonymity', default: 'You do not need to create an account to submit a report. SnapAndSend assigns an anonymous device identity so you can track your own submissions without exposing your personal information to other users or authorities.\n\nCreating a profile is optional — it unlocks features like display names and persistent history across devices.' },
    },
  },
  collaborate: {
    label: 'Collaborate with Us',
    sections: {
      hero_tagline:  { label: 'Hero Tagline', default: 'Build Better Communities, Together' },
      hero_body:     { label: 'Hero Body', default: 'We are actively seeking partners who share our commitment to civic technology, community empowerment, and sustainable urban development.' },
      why_partner:   { label: 'Why Partner with SnapAndSend', default: 'SnapAndSend sits at the intersection of civic engagement and technology. As a growing platform with users actively reporting and tracking issues across communities, we offer partners a unique channel to engage citizens, demonstrate accountability, and drive measurable outcomes in public service delivery.\n\nWe are an early-stage startup with ambition, agility, and a clear social mission. Partnering with us now means shaping the direction of the platform and getting ahead of the curve on community-first technology.' },
    },
  },
  fixers: {
    label: 'Fixers',
    sections: {
      hero_tagline:    { label: 'Hero Tagline', default: 'The People Who Get Things Done' },
      hero_body:       { label: 'Hero Body', default: 'Fixers are the contractors, tradespeople, volunteers, and service providers who respond to community incidents and make things right.' },
      what_is_a_fixer: { label: 'What Is a Fixer', default: 'A Fixer is anyone with the skills, tools, or authority to resolve a community incident. This includes — but is not limited to — local contractors, electricians, plumbers, environmental cleanup crews, road repair teams, community volunteers, and local government maintenance units.\n\nWhen a report is submitted on SnapAndSend, relevant registered Fixers in the area are notified. Fixers can claim an incident, update its status, and log resolution evidence directly through the platform — creating a transparent, accountable feedback loop for the community.' },
    },
  },
  help: {
    label: 'Help Centre',
    sections: {
      hero_tagline: { label: 'Hero Tagline', default: 'How Can We Help?' },
      hero_body:    { label: 'Hero Body', default: 'Find answers to common questions about submitting reports, tracking incidents, and getting the most from SnapAndSend.' },
    },
  },
};

export function usePageContent(slug: string) {
  const [sections, setSections] = useState<Sections>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then(r => r.ok ? r.json() : { sections: {} })
      .then(data => setSections(data.sections || {}))
      .catch(() => setSections({}))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const pageDef = PAGE_DEFAULTS[slug];

  // t(key) — returns saved content or falls back to default
  function t(key: string): string {
    if (sections[key] !== undefined && sections[key].trim() !== '') return sections[key];
    return pageDef?.sections[key]?.default ?? '';
  }

  return { t, isLoading };
}
