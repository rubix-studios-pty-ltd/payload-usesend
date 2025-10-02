import type { EmailAdapter } from "payload";
export type useSendAdapterArgs = {
    apiKey: string;
    defaultFromAddress: string;
    defaultFromName: string;
    scheduledAt?: string;
    templateId?: string;
    useSendUrl: string;
    variables?: Record<string, string>;
};
type UseSendEmailAdapter = EmailAdapter<useSendResponse>;
type useSendError = {
    error: {
        code: string;
        message: string;
    };
};
type useSendResponse = {
    emailId: string;
} | useSendError;
/**
 * Email adapter for [useSend](https://usesend.com) REST API
 */
export declare const sendAdapter: (args: useSendAdapterArgs) => UseSendEmailAdapter;
export {};
//# sourceMappingURL=index.d.ts.map