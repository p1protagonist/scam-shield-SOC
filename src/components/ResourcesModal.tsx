import React, { useState } from 'react';
import {
  BookOpen,
  X,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Bot,
  PhoneCall,
  Lock,
  FileText,
  LifeBuoy,
} from 'lucide-react';

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'types' | 'redflags' | 'bestpractices' | 'orgs'>('types');

  if (!isOpen) return null;

  const scamTypes = [
    {
      title: 'IRS & Law Enforcement Impersonation',
      severity: 'Critical Threat',
      description:
        'Scammers pose as IRS agents, federal marshals, or sheriff deputies claiming you owe unpaid back taxes or have an active arrest warrant. They demand immediate payment via retail gift cards, prepaid debit cards, or cryptocurrency.',
      redFlag: 'Government agencies never call demanding immediate gift card payments or threatening same-day arrest.',
    },
    {
      title: 'Banking Wire Fraud & 2FA Harvesting',
      severity: 'Critical Threat',
      description:
        'Fraudsters spoof your bank’s caller ID and claim an unauthorized international wire is in progress. They urge you to read back the 6-digit one-time passcode (OTP) "to freeze the transfer", which actually authorizes the theft.',
      redFlag: 'Legitimate banks never request OTP verification codes over an inbound phone call.',
    },
    {
      title: 'AI Voice Cloning & Virtual Kidnapping',
      severity: 'Emerging High Threat',
      description:
        'Using as little as 3 seconds of audio scraped from social media or video recordings, generative neural vocoders clone the exact voice of a child or grandchild, claiming an urgent car crash, arrest, or emergency requiring cash bail.',
      redFlag: 'Robotic micro-cadence or pitch uniformity, refusal to answer family-specific security questions.',
    },
    {
      title: 'Remote Access Tech Support Scams',
      severity: 'High Threat',
      description:
        'Callers claim your Windows computer is infected with Trojan malware ("Zeus") and guide you to install remote desktop tools (AnyDesk, TeamViewer) to clean your drive, which they use to access bank portals.',
      redFlag: 'Microsoft and Apple never make unsolicited outbound phone calls regarding virus infections.',
    },
    {
      title: 'Utility Disconnection Extortion',
      severity: 'Medium Threat',
      description:
        'Scammers target businesses or homeowners claiming power or water will be cut off within 30 minutes unless an immediate reload card or wire payment is sent to a fake collection desk.',
      redFlag: 'Utility companies provide written advance notice by mail before service interruptions.',
    },
  ];

  const redFlags = [
    {
      title: 'Artificial Emergency Deadlines',
      desc: 'Creating intense panic ("Marshals in 30 minutes", "Account frozen forever") to override rational thinking.',
    },
    {
      title: 'Unorthodox Payment Methods',
      desc: 'Demands for Target/Apple gift cards, Bitcoin ATM deposits, wire transfers, or courier cash pick-up.',
    },
    {
      title: 'Refusal to Allow Callbacks',
      desc: 'Aggressive insistence that you cannot hang up the phone or consult a family member or attorney.',
    },
    {
      title: 'Spoofed Caller ID Numbers',
      desc: 'Using VoIP software to disguise inbound numbers as official local government agencies or banks.',
    },
    {
      title: 'Robotic Vocal Cadence & Uniform Pitch',
      desc: 'AI synthetic voices lack natural human micro-pitch flutter and exhibit unnaturally static zero-crossing distributions.',
    },
  ];

  const bestPractices = [
    {
      title: 'Establish a Family Duress Safeword',
      desc: 'Agree on a secret passphrase with family members to immediately verify legitimate identity during distress calls.',
    },
    {
      title: 'Hang Up and Call the Verified Number',
      desc: 'Never trust incoming caller ID. Hang up immediately and dial the official number printed on the back of your card.',
    },
    {
      title: 'Never Share One-Time Passcodes (OTPs)',
      desc: 'Treat two-factor authentication codes like ATM PINs. No bank agent will ever ask you to read them aloud.',
    },
    {
      title: 'Enable Carrier STIR/SHAKEN Caller ID Authentication',
      desc: 'Activate carrier-level anti-spam filters to block unauthenticated spoofed VoIP calls before they ring.',
    },
    {
      title: 'Slow Down Any Financial Request',
      desc: 'Fraudsters rely on adrenaline. Pausing for even 5 minutes to verify facts stops over 90% of phone scams.',
    },
  ];

  const organizations = [
    {
      name: 'Federal Trade Commission (FTC)',
      role: 'U.S. Consumer Protection & Scam Reporting',
      url: 'https://reportfraud.ftc.gov/',
      actionText: 'Report Scam to FTC',
    },
    {
      name: 'Cybersecurity and Infrastructure Security Agency (CISA)',
      role: 'National Cyber Defense & Threat Advisories',
      url: 'https://www.cisa.gov/resources-tools/resources',
      actionText: 'Visit CISA Resources',
    },
    {
      name: 'FBI Internet Crime Complaint Center (IC3)',
      role: 'Federal Cyber Fraud & Wire Scam Prosecution',
      url: 'https://www.ic3.gov/',
      actionText: 'File IC3 Complaint',
    },
    {
      name: 'Anti-Phishing Working Group (APWG)',
      role: 'Global Cybercrime Industry Coalition',
      url: 'https://apwg.org/',
      actionText: 'View APWG Reports',
    },
    {
      name: 'Truecaller Scam Research Lab',
      role: 'Global Telephony Threat & Robocall Intelligence',
      url: 'https://www.truecaller.com/blog',
      actionText: 'Explore Truecaller Insights',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#141418] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4500]/20 border border-[#FF4500]/30 flex items-center justify-center text-[#FF4500]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Scam Defense Knowledge Base & Threat Directory
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Verified cybersecurity guidelines & telephone fraud countermeasures
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2 bg-black/20 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveCategory('types')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'types'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Common Scam Call Types
          </button>
          <button
            onClick={() => setActiveCategory('redflags')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'redflags'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Universal Red Flags
          </button>
          <button
            onClick={() => setActiveCategory('bestpractices')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'bestpractices'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Defense Best Practices
          </button>
          <button
            onClick={() => setActiveCategory('orgs')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'orgs'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Reputable Cybersecurity Orgs
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeCategory === 'types' && (
            <div className="space-y-3">
              {scamTypes.map((st, i) => (
                <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span>{st.title}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono font-bold">
                      {st.severity}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{st.description}</p>
                  <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] text-red-200 font-mono">
                    <span className="font-bold text-red-300">RED FLAG SIGNAL: </span>
                    {st.redFlag}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'redflags' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {redFlags.map((rf, i) => (
                <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{rf.title}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{rf.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'bestpractices' && (
            <div className="space-y-3">
              {bestPractices.map((bp, i) => (
                <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{bp.title}</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{bp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'orgs' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400 mb-2">
                If you suspect you have been targeted by a financial scam or extortion attempt, report the incident immediately to these verified national bodies:
              </p>
              {organizations.map((org, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{org.name}</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{org.role}</p>
                  </div>

                  <a
                    href={org.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{org.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/50 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>ScamShield SOC Education Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs transition-colors"
          >
            Close Knowledge Base
          </button>
        </div>
      </div>
    </div>
  );
};
