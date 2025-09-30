import type { EmailAdapter, SendEmailOptions } from "payload"

import { APIError } from "payload"

export type useSendAdapterArgs = {
	apiKey: string
	defaultFromAddress: string
	defaultFromName: string
	scheduledAt?: string
	templateId?: string
	useSendUrl: string
	variables?: Record<string, string>
}

type UseSendEmailAdapter = EmailAdapter<useSendResponse>

type useSendError = {
	error: {
		code: string
		message: string
	}
}

type useSendResponse = { emailId: string } | useSendError

/**
 * Email adapter for [useSend](https://usesend.com) REST API
 */
export const sendAdapter = (args: useSendAdapterArgs): UseSendEmailAdapter => {
	const {
		apiKey,
		defaultFromAddress,
		defaultFromName,
		scheduledAt,
		templateId,
		useSendUrl,
		variables,
	} = args

	const adapter: UseSendEmailAdapter = () => ({
		name: "usesend-rest",
		defaultFromName,
		defaultFromAddress,
		sendEmail: async (message) => {
			const sendEmailOptions = mapPayloadToUseSendEmail(
				defaultFromName,
				defaultFromAddress,
				message
			)

			const payload = {
				...sendEmailOptions,
				...(scheduledAt ? { scheduledAt } : {}),
				...(templateId ? { templateId } : {}),
				...(variables ? { variables } : {}),
			}

			const res = await fetch(`${useSendUrl}/api/v1/emails`, {
				body: JSON.stringify(payload),
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				method: "POST",
			})

			const data = (await res.json()) as useSendResponse

			if ("emailId" in data) {
				return data
			} else {
				const statusCode = res.status
				let formattedError = `Error sending email: ${statusCode}`
				if ("error" in data) {
					formattedError += ` ${data.error.code} - ${data.error.message}`
				}

				throw new APIError(formattedError, statusCode)
			}
		},
	})

	return adapter
}

function mapPayloadToUseSendEmail(
	defaultFromName: string,
	defaultFromAddress: string,
	message: SendEmailOptions
): useSendEmailOptions {
	const emailOptions: Partial<useSendEmailOptions> = {
		from: mapFromAddress(message.from, defaultFromName, defaultFromAddress),
		subject: message.subject,
		to: mapAddresses(message.to),
	}

	if (message.text?.toString().trim().length > 0) {
		emailOptions.text = message.text
	} else {
		emailOptions.text = "Please view this email in an HTML-compatible client."
	}

	if (message.html?.toString().trim()) {
		emailOptions.html = message.html.toString()
	}

	if (message.attachments?.length) {
		if (message.attachments.length > 10) {
			throw new APIError("Maximum of 10 attachments allowed", 400)
		}
		emailOptions.attachments = mapAttachments(message.attachments)
	}

	if (message.replyTo) {
		emailOptions.replyTo = mapAddresses(message.replyTo)
	}

	if (message.cc) {
		emailOptions.cc = mapAddresses(message.cc)
	}

	if (message.bcc) {
		emailOptions.bcc = mapAddresses(message.bcc)
	}

	return emailOptions as useSendEmailOptions
}

function mapFromAddress(
	address: SendEmailOptions["from"],
	defaultFromName: string,
	defaultFromAddress: string
): useSendEmailOptions["from"] {
	if (!address) {
		return `${defaultFromName} <${defaultFromAddress}>`
	}

	if (typeof address === "string") {
		return address
	}

	return `${address.name} <${address.address}>`
}

function mapAddresses(
	addresses: SendEmailOptions["to"]
): useSendEmailOptions["to"] {
	if (!addresses) {
		return ""
	}

	if (typeof addresses === "string") {
		return addresses
	}

	if (Array.isArray(addresses)) {
		return addresses.map((address) =>
			typeof address === "string" ? address : address.address
		)
	}

	return [addresses.address]
}

function mapAttachments(
	attachments: SendEmailOptions["attachments"]
): useSendEmailOptions["attachments"] {
	if (!attachments) {
		return []
	}

	if (attachments.length > 10) {
		throw new APIError("Maximum of 10 attachments allowed", 400)
	}

	return attachments.map((attachment) => {
		if (!attachment.filename || !attachment.content) {
			throw new APIError("Attachment is missing filename or content", 400)
		}

		if (typeof attachment.content === "string") {
			return {
				content: Buffer.from(attachment.content).toString("base64"),
				filename: attachment.filename,
			}
		}

		if (attachment.content instanceof Buffer) {
			return {
				content: attachment.content.toString("base64"),
				filename: attachment.filename,
			}
		}

		throw new APIError("Attachment content must be a string or a buffer", 400)
	})
}

type useSendEmailOptions = {
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

type Attachment = {
	/** Content of an attached file. */
	content: string
	/** Name of attached file. */
	filename: string
}
