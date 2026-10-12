export interface ScamExplanation {
  tag: string;
  category: string;
  callerIdentity: string;
  whyExplaining: string;
  psychologicalTactic: string;
  recommendedAction: string;
  shouldCutCallImmediately: boolean;
}

/**
 * Maps raw packet intent, preset IDs, or keywords into crystal-clear Apple-style human explanations.
 */
export function getScamExplanation(
  intent?: string,
  callerName?: string,
  phoneNumber?: string,
  isAiVoice?: boolean
): ScamExplanation {
  const lowerIntent = (intent || '').toLowerCase();
  const lowerCaller = (callerName || '').toLowerCase();

  // 1. AI Voice Clone / Family Emergency Extortion
  if (isAiVoice || lowerIntent.includes('bail') || lowerIntent.includes('accident') || lowerIntent.includes('grandchild') || lowerIntent.includes('kidnap')) {
    return {
      tag: 'Synthetic AI Voice Clone · Virtual Kidnapping Extortion',
      category: 'Deepfake Voice Cloning',
      callerIdentity: callerName || 'Unknown Caller (AI Voice Synthesizer)',
      whyExplaining:
        'The attacker is using generative AI to clone a family member’s voice. They are fabricating an urgent medical or legal emergency (car crash, arrest, jail bail) to panic you into wiring funds before you have time to confirm their safety.',
      psychologicalTactic:
        'Exploits emotional panic and familial love, demanding immediate secrecy ("don’t tell mom and dad") so you don’t verify the story.',
      recommendedAction:
        'Cut the call immediately. Hang up now and call your family member directly on their known personal phone number to confirm they are safe.',
      shouldCutCallImmediately: true,
    };
  }

  // 2. Government / IRS / Law Enforcement Impersonation
  if (lowerIntent.includes('irs') || lowerIntent.includes('arrest') || lowerIntent.includes('warrant') || lowerIntent.includes('tax') || lowerCaller.includes('irs') || lowerCaller.includes('legal enforcement')) {
    return {
      tag: 'Government Impersonation · Fake Federal Tax Arrest Warrant',
      category: 'Federal Law Enforcement Impersonator',
      callerIdentity: callerName || 'IRS Legal Enforcement (Spoofed VoIP)',
      whyExplaining:
        'The caller is pretending to be a federal officer or magistrate claiming you have unpaid taxes and an active arrest warrant. They demand immediate settlement via gift cards, wire transfer, or Bitcoin ATM to avoid jail.',
      psychologicalTactic:
        'High-pressure intimidation using fake legal jargon, badges, and simulated urgency ("marshals will arrive at your home in 40 minutes").',
      recommendedAction:
        'Cut the call immediately. The IRS and law enforcement never contact citizens by phone demanding instant payment, and they never accept gift cards or cryptocurrency.',
      shouldCutCallImmediately: true,
    };
  }

  // 3. Bank Fraud / 2FA One-Time Passcode (OTP) Harvesting
  if (lowerIntent.includes('wire') || lowerIntent.includes('code') || lowerIntent.includes('passcode') || lowerIntent.includes('otp') || lowerIntent.includes('chase') || lowerCaller.includes('chase') || lowerCaller.includes('bank')) {
    return {
      tag: 'Financial Spoofing · 2FA One-Time Passcode (OTP) Theft',
      category: 'Banking Social Engineering',
      callerIdentity: callerName || 'Bank Fraud Prevention (Spoofed)',
      whyExplaining:
        'The caller is pretending to be your bank’s fraud department alerting you to a fake offshore transfer. In reality, they are attempting to log in to your bank account and need you to speak or text back the 6-digit one-time authorization code sent to your phone.',
      psychologicalTactic:
        'Creates false relief ("we are blocking the fraud for you") to trick you into surrendering your multi-factor security code.',
      recommendedAction:
        'Cut the call immediately. Never share verification codes with any caller. Real banks will never ask you to read your 2FA codes aloud.',
      shouldCutCallImmediately: true,
    };
  }

  // 4. Remote Desktop / Tech Support Trojan
  if (lowerIntent.includes('virus') || lowerIntent.includes('trojan') || lowerIntent.includes('anydesk') || lowerIntent.includes('teamviewer') || lowerCaller.includes('windows') || lowerCaller.includes('microsoft')) {
    return {
      tag: 'Remote Access Tool Phishing · Tech Support Extortion',
      category: 'Device Takeover Scam',
      callerIdentity: callerName || 'Windows Security Center (Spoofed)',
      whyExplaining:
        'The caller falsely claims your computer is transmitting dangerous viruses or that your bank accounts are compromised. They want you to download remote support software (AnyDesk, TeamViewer) to gain full administrative access to your files and banking sessions.',
      psychologicalTactic:
        'Fabricates technical alarms and threats of identity theft to make you hand over remote control of your computer.',
      recommendedAction:
        'Cut the call immediately. Do not install any software, do not press Windows+R, and do not let unexpected callers connect to your computer.',
      shouldCutCallImmediately: true,
    };
  }

  // 5. Default High-Risk Threat
  return {
    tag: isAiVoice ? 'Synthetic Voice Clone · High-Risk Fraud' : 'High-Risk Social Engineering Coercion',
    category: 'Phone Fraud & Impersonation',
    callerIdentity: callerName || (phoneNumber ? `${phoneNumber} (High Risk)` : 'Unknown Flagged Entity'),
    whyExplaining:
      'The caller is using deceptive social engineering tactics and urgent manipulation to extract money, sensitive passwords, or personal credentials from you.',
    psychologicalTactic:
      'Creates artificial urgency and fear to bypass critical thinking and prevent independent verification.',
    recommendedAction:
      'Cut the call immediately. Do not provide personal information, financial credentials, or agree to any transfers.',
    shouldCutCallImmediately: true,
  };
}
