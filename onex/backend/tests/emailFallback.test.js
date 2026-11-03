import { jest } from '@jest/globals';
import env from '../src/config/env.js';
import AdminSettings from '../src/models/AdminSettings.js';
import { sendEmail } from '../src/common/utils/unosend.js';

const message = { to: 'someonetothinkabout@gmail.com', subject: 'Hello', html: '<p>Hi</p>' };
const realFetch = global.fetch;
const saved = {};

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(AdminSettings, 'findOne').mockReturnValue({
    select: () => ({ lean: async () => null }),
  });
  for (const key of ['UNOSEND_API_KEY', 'MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_BASE_URL']) saved[key] = env[key];
});

beforeEach(() => {
  Object.assign(env, {
    UNOSEND_API_KEY: 'uno-test',
    MAILGUN_API_KEY: 'mg-test',
    MAILGUN_DOMAIN: 'mysterymansion.app',
    MAILGUN_BASE_URL: 'https://api.mailgun.net',
  });
  delete process.env.EMAIL_FORCE_PROVIDER;
});

afterAll(() => {
  global.fetch = realFetch;
  Object.assign(env, saved);
  jest.restoreAllMocks();
});

const json = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });

test('uses Unosend when it succeeds', async () => {
  global.fetch = jest.fn(async () => json(200, { id: 'uno_1' }));
  const result = await sendEmail(message);
  expect(result).toMatchObject({ provider: 'unosend', id: 'uno_1' });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('falls back to Mailgun when Unosend errors', async () => {
  global.fetch = jest.fn(async (url) => (String(url).includes('unosend')
    ? json(503, { error: 'down' })
    : json(200, { id: '<mg_1@mysterymansion.app>', message: 'Queued. Thank you.' })));

  const result = await sendEmail(message);
  expect(result).toMatchObject({ provider: 'mailgun', id: '<mg_1@mysterymansion.app>' });

  const [url, init] = global.fetch.mock.calls[1];
  expect(url).toBe('https://api.mailgun.net/v3/mysterymansion.app/messages');
  expect(init.headers.Authorization).toBe(`Basic ${Buffer.from('api:mg-test').toString('base64')}`);
  expect(init.body.getAll('to')).toEqual(['someonetothinkabout@gmail.com']);
  expect(init.body.get('subject')).toBe('Hello');
  expect(init.body.get('html')).toBe('<p>Hi</p>');
});

test('falls back to Mailgun when Unosend throws (network/timeout)', async () => {
  global.fetch = jest.fn(async (url) => {
    if (String(url).includes('unosend')) throw new Error('timeout');
    return json(200, { id: 'mg_2' });
  });
  await expect(sendEmail(message)).resolves.toMatchObject({ provider: 'mailgun' });
});

test('rethrows the Unosend error when Mailgun is not configured', async () => {
  env.MAILGUN_API_KEY = undefined;
  global.fetch = jest.fn(async () => json(500, { error: 'boom' }));
  await expect(sendEmail(message)).rejects.toThrow('Unosend API error 500');
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('EMAIL_FORCE_PROVIDER=mailgun skips Unosend', async () => {
  process.env.EMAIL_FORCE_PROVIDER = 'mailgun';
  global.fetch = jest.fn(async () => json(200, { id: 'mg_3' }));
  await expect(sendEmail(message)).resolves.toMatchObject({ provider: 'mailgun' });
  expect(String(global.fetch.mock.calls[0][0])).toContain('mailgun');
});
