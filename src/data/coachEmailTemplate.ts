// "How to email a coach": shown on college pages once a visitor has unlocked coach emails.
// Plain wording, no invented facts. Square brackets are the bits the player fills in.

export const COACH_EMAIL_TIPS: string[] = [
  'Keep it short and specific. Name the college and say why it fits you.',
  'Coaches are flat out in season, so the offseason is the better time to write.',
  'Follow up once, then leave it.',
];

export function coachEmailSubject(collegeName: string): string {
  return `[Your name], [position], [country]: interested in ${collegeName} rugby`;
}

export function coachEmailBody(collegeName: string): string {
  return [
    'Hi Coach [surname],',
    '',
    `My name is [your name]. I'm [age], from [city, country], and I play [position] for [your club or school]. I'm [height] and [weight].`,
    '',
    `I'm interested in ${collegeName} because [one real reason: the level of rugby, the course, the coaching].`,
    '',
    `Here is my highlight reel: [link]. I can send full match film too.`,
    '',
    'Could you tell me what you look for in a [position], and whether you expect to have space on the roster in [year]?',
    '',
    'Thanks for your time,',
    '[Your name]',
    '[Email and WhatsApp number]',
  ].join('\n');
}
