// Template for src/pisano.config.ts (git-ignored).
// `yarn` copies this file to src/pisano.config.ts on first install.
// Fill it with your own Pisano test values — never commit real credentials.
//
//   appId / accessKey            Panel -> Profile -> Mobile applications
//   apiUrl / feedbackUrl / code  Panel -> Mobile Channels -> Deploy ->
//                                Publish Channel Parameters
//
// You can also leave these blank and type the values into the fields in the
// running app.

export type PisanoConfig = {
  appId: string;
  accessKey: string;
  apiUrl: string;
  feedbackUrl: string;
  eventUrl?: string;
  language?: string;
  code?: string;
  title?: string;
  titleFontSize?: number;
};

export const PISANO_CONFIG: PisanoConfig = {
  appId: '',
  accessKey: '',
  apiUrl: '',
  feedbackUrl: '',
  eventUrl: '',
  language: 'en',
  code: '',
  title: 'We Value Your Feedback',
  titleFontSize: 16,
};
