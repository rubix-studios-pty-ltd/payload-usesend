import { jest } from '@jest/globals'
import { type Payload } from 'payload'

import { sendAdapter } from './index.js'

describe('email-useSend', () => {
  const apiKey = 'test-api-key'
  const useSendUrl = 'https://app.usesend.com'
  const defaultFromName = 'Rubix Studios'
  const defaultFromAddress = 'example@mail.com'
  const from = 'example@mail.com'
  const to = from
  const subject = 'This was sent on init'
  const text = 'This is my message body'

  const mockPayload = {} as Payload

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockSuccessfulFetch = () => {
    global.fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation((_input: RequestInfo | URL, _init?: RequestInit) =>
        Promise.resolve({
          json: () => Promise.resolve({ emailId: 'test-id' }),
          ok: true,
          status: 200,
        } as Response)
      ) as unknown as typeof global.fetch
  }

  it('should handle sending an email', async () => {
    mockSuccessfulFetch()

    const adapter = sendAdapter({
      apiKey,
      useSendUrl,
      defaultFromName,
      defaultFromAddress,
    })

    await adapter({ payload: mockPayload }).sendEmail({
      from,
      subject,
      text,
      to,
    })

    const apiURL = `${useSendUrl?.replace(/\/+$/, '')}/api/v1/emails`
    // @ts-expect-error Mock fetch doesn't have a type definition
    expect(global.fetch.mock.calls[0][0]).toStrictEqual(apiURL)
    // @ts-expect-error Mock fetch doesn't have a type definition
    const request = global.fetch.mock.calls[0][1]
    expect(request.headers.Authorization).toStrictEqual(`Bearer ${apiKey}`)
    expect(JSON.parse(request.body)).toMatchObject({
      from,
      subject,
      text,
      to,
    })
  })

  describe('headers', () => {
    const adapter = () =>
      sendAdapter({ apiKey, defaultFromAddress, defaultFromName, useSendUrl })({
        payload: mockPayload,
      })

    it('should pass simple string headers through as-is', async () => {
      mockSuccessfulFetch()

      await adapter().sendEmail({
        from,
        headers: { 'List-Unsubscribe': '<mailto:unsub@example.com>' },
        subject,
        text,
        to,
      })

      // @ts-expect-error Mock fetch doesn't have a type definition
      const body = JSON.parse(global.fetch.mock.calls[0][1].body)
      expect(body.headers).toStrictEqual({ 'List-Unsubscribe': '<mailto:unsub@example.com>' })
    })

    it('should join array string values with a comma', async () => {
      mockSuccessfulFetch()

      await adapter().sendEmail({
        from,
        headers: { 'X-Custom': ['val1', 'val2'] },
        subject,
        text,
        to,
      })

      // @ts-expect-error Mock fetch doesn't have a type definition
      const body = JSON.parse(global.fetch.mock.calls[0][1].body)
      expect(body.headers).toStrictEqual({ 'X-Custom': 'val1, val2' })
    })

    it('should extract the value from prepared-object header values', async () => {
      mockSuccessfulFetch()

      await adapter().sendEmail({
        from,
        headers: { 'X-Prepared': { prepared: true, value: 'prepared-value' } },
        subject,
        text,
        to,
      })

      // @ts-expect-error Mock fetch doesn't have a type definition
      const body = JSON.parse(global.fetch.mock.calls[0][1].body)
      expect(body.headers).toStrictEqual({ 'X-Prepared': 'prepared-value' })
    })

    it('should convert array-of-objects header form to a plain object', async () => {
      mockSuccessfulFetch()

      await adapter().sendEmail({
        from,
        headers: [
          { key: 'X-First', value: 'first' },
          { key: 'X-Second', value: 'second' },
        ],
        subject,
        text,
        to,
      })

      // @ts-expect-error Mock fetch doesn't have a type definition
      const body = JSON.parse(global.fetch.mock.calls[0][1].body)
      expect(body.headers).toStrictEqual({ 'X-First': 'first', 'X-Second': 'second' })
    })

    it('should omit the headers field when headers are undefined', async () => {
      mockSuccessfulFetch()

      await adapter().sendEmail({
        from,
        subject,
        text,
        to,
      })

      // @ts-expect-error Mock fetch doesn't have a type definition
      const body = JSON.parse(global.fetch.mock.calls[0][1].body)
      expect(body).not.toHaveProperty('headers')
    })
  })

  it('should throw an error if the email fails to send', async () => {
    const errorResponse = {
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid API token',
      },
    }
    global.fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation((_input: RequestInfo | URL, _init?: RequestInit) =>
        Promise.resolve({
          json: () => Promise.resolve(errorResponse),
          ok: false,
          status: 403,
        } as Response)
      ) as unknown as typeof global.fetch

    const adapter = sendAdapter({
      apiKey,
      defaultFromAddress,
      defaultFromName,
      useSendUrl,
    })

    await expect(() =>
      adapter({ payload: mockPayload }).sendEmail({
        from,
        subject,
        text,
        to,
      })
    ).rejects.toThrow(`Error sending email: 403 ${errorResponse.error.code}`)
  })
})
