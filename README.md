# PayloadCMS + useSend Email Adapter

useSend is an API-first email delivery platform built for transactional and marketing email workflows. It adopts an architectural model comparable to Resend while remaining fully open source and self-hostable. This combination enables teams to standardise email delivery without surrendering control over infrastructure, deployment topology, or data locality.

The platform exposes a REST-based interface for email delivery and supports provider-native capabilities such as templates, dynamic variables, and scheduled sends. By abstracting the underlying delivery infrastructure, useSend simplifies application integration while allowing organisations to retain operational and regulatory control.

This adapter integrates [PayloadCMS](https://payloadcms.com) with the [useSend](https://usesend.com) REST API for transactional and marketing emails.

[![npm version](https://img.shields.io/npm/v/@rubixstudios/payload-usesend.svg)](https://www.npmjs.com/package/@rubixstudios/payload-usesend)
![Release](https://github.com/rubix-studios-pty-ltd/payload-usesend/actions/workflows/release.yml/badge.svg)

## Documentation

See the [full documentation](https://rubixstudios.com.au/documents/usesend) for comprehensive guides, features, comparisons, and configuration examples.

## Installation

```sh
pnpm add @rubixstudios/payload-usesend
```

## Usage

- Sign up for a [useSend](https://usesend.com) account
- Set up a domain
- Create an API key
- Set API key as USESEND_API_KEY environment variable
- Set your useSend base url as USESEND_URL environment variable
- Configure your Payload config

## Configuration

```ts
// payload.config.js
import { sendAdapter } from '@rubixstudios/payload-usesend'

export default buildConfig({
  email: sendAdapter({
    apiKey: process.env.USESEND_API_KEY!,
    useSendUrl: process.env.USESEND_URL!,
    defaultFromName: 'Rubix Studios',
    defaultFromAddress: 'example@mail.com',
    // Optional:
    // scheduledAt: '2025-08-01T10:00:00Z',
    // templateId: 'template-uuid',
    // variables: { firstName: 'Vincent' }
  }),
})
```

| Option             | Type   | Required | Default | Description          |
|--------------------|--------|----------|---------|----------------------|
| apiKey             | string | Yes      | -       | useSend API key      |
| useSendUrl         | string | Yes      | -       | useSend base URL     |
| defaultFromAddress | string | Yes      | -       | Default sender email |
| defaultFromName    | string | Yes      | -       | Default sender name  |
| scheduledAt        | string | No       | -       | ISO date string      |
| templateId         | string | No       | -       | Email template ID    |
| variables          | object | No       | -       | Template variables   |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or inquiries:

- LinkedIn: [rubixvi](https://www.linkedin.com/in/rubixvi/)
- Website: [Rubix Studios](https://rubixstudios.com.au)

## Author

Rubix Studios Pty. Ltd.  
[https://rubixstudios.com.au](https://rubixstudios.com.au)
