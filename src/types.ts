import { type EmailAdapter } from 'payload'

export type useSendAdapterArgs = {
  apiKey: string
  defaultFromAddress: string
  defaultFromName: string
  scheduledAt?: string
  templateId?: string
  useSendUrl: string
  variables?: Record<string, string>
}

type useSendError = {
  error: {
    code: string
    message: string
  }
}

export type useSendResponse = { emailId: string } | useSendError

export type useSendEmailAdapter = EmailAdapter<useSendResponse>

export type useSendEmailOptions = {
  /**
   * Filename and content of attachments. Max 10 attachments per email.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-attachments
   */
  attachments?: Attachment[]

  /**
   * Blind carbon copy recipient email address. For multiple addresses, send as an array of strings.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-bcc
   */
  bcc?: string | string[]

  /**
   * Carbon copy recipient email address. For multiple addresses, send as an array of strings.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-cc
   */
  cc?: string | string[]

  /**
   * Sender email address. To include a friendly name, use the format `"Your Name <sender@domain.com>"`
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-from
   */
  from: string

  /**
   * The HTML version of the message.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-html
   */
  html?: null | string

  /**
   * The ID of the email this is in reply to, if applicable.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-in-reply-to-id
   */
  inReplyToId?: string

  /**
   * Reply-to email address. For multiple addresses, send as an array of strings.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-reply-to
   */
  replyTo?: string | string[]

  /**
   * The date and time to send the email. If not provided, the email will be sent immediately.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-scheduled-at
   */
  scheduledAt?: string

  /**
   * Email subject. Optional when templateId is provided.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-subject
   */
  subject?: string

  /**
   * ID of a template to use for this email.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-template-id
   */
  templateId?: string

  /**
   * The plain text version of the message.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-text
   */
  text?: null | string

  /**
   * Recipient email address. For multiple addresses, send as an array of strings. Max 50.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-to
   */
  to: string | string[]

  /**
   * Email template variables. Allows for dynamic content in the email template.
   *
   * @link https://docs.usesend.com/api-reference/emails/send-email#body-variables
   */
  variables?: Record<string, string>
}

export type Attachment = {
  /** Content of an attached file. */
  content: string
  /** Name of attached file. */
  filename: string
}
