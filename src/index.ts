import { APIError, type SendEmailOptions } from "payload"

import {
	type useSendAdapterArgs,
	type useSendEmailAdapter,
	type useSendEmailOptions,
	type useSendResponse,
} from "./types.js"

export { type useSendAdapterArgs } from "./types.js"

/**
 * Email adapter for [useSend](https://usesend.com) REST API
 */
export const sendAdapter = (args: useSendAdapterArgs): useSendEmailAdapter => {
	const {
		apiKey,
		defaultFromAddress,
		defaultFromName,
		scheduledAt,
		templateId,
		useSendUrl,
		variables,
	} = args

	const adapter: useSendEmailAdapter = () => ({
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
