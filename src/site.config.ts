// Site-wide settings. Copy that appears on the page lives in src/pages/index.astro
// and src/data/home.ts; this file holds names, addresses and links.

export const SITE = {
  name: 'Student Supersonic',
  team: 'ETH Zürich',
  // TODO(Sebastian): confirm the domain. The brand guide uses student-supersonic.com.
  domain: 'student-supersonic.com',
  url: 'https://student-supersonic.com',
  description:
    'A student team at ETH Zürich building a sub-25 kg jet that flies faster than sound, lands, and flies again the same day.',
  // TODO(Sebastian): this address does not exist yet. Set it up with
  // Cloudflare Email Routing (free) once the domain is in Cloudflare.
  email: 'join@student-supersonic.com',
  location: 'Zürich',
  // TODO(Sebastian): Etienne's surname, and whether you both want to be named.
  founders: ['Sebastian Truijens', 'Etienne Horta Emidio Blüm'],
  links: {
    boomPrize: 'https://boomsupersonic.com/prize',
    phantum: 'https://phantum.eu',
  },
};

/** A mailto: link with a subject and a short template, so the first email
 *  already tells us what we need to know. */
export function mailto(subject: string, body = '') {
  const q = new URLSearchParams({ subject, body }).toString().replace(/\+/g, '%20');
  return `mailto:${SITE.email}?${q}`;
}

export const MAIL = {
  student: mailto(
    'Interested: Student Supersonic ETH',
    [
      'Hi,',
      '',
      'Name:',
      'Programme and semester:',
      'The part of the problem I would want to work on:',
      'Something I have built or done:',
      '',
    ].join('\n'),
  ),
  university: mailto('New team: Student Supersonic challenge', 'Hi,\n\nUniversity:\nWho we are:\n'),
  partner: mailto('Partnership: Student Supersonic', 'Hi,\n\nOrganisation:\nWhat we could offer:\n'),
};
