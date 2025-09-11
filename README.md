# PayloadCMS + Unsend.dev Email Adapter

This adapter integrates [PayloadCMS](https://payloadcms.com) with the [useSend](https://usesend.com) REST API for transactional and marketing emails.

[![npm version](https://img.shields.io/npm/v/@rubixstudios/payload-usesend.svg)](https://www.npmjs.com/package/@rubixstudios/payload-usesend)
![Release](https://github.com/rubix-studios-pty-ltd/payload-usesend/actions/workflows/release.yml/badge.svg)

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
    defaultFromAddress: 'hello@rubixstudios.com.au',
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
- Facebook: [rubixvi](https://www.facebook.com/rubixvi/)
- X: [@rubixvi](https://x.com/rubixvi)
- Website: [Rubix Studios](https://rubixstudios.com.au)

## Author

Rubix Studios Pty. Ltd.  
[https://rubixstudios.com.au](https://rubixstudios.com.au)