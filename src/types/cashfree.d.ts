declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<CheckoutResult>;
  }

  export interface CheckoutOptions {
    paymentSessionId: string;
    returnUrl?: string;
    redirectTarget?: '_self' | '_blank' | '_parent' | '_top';
  }

  export interface CheckoutResult {
    error?: {
      message: string;
      code?: string;
    };
    paymentDetails?: {
      orderId?: string;
      paymentId?: string;
    };
    redirect?: boolean;
  }

  export interface LoadOptions {
    mode: 'sandbox' | 'production';
  }

  export function load(options: LoadOptions): Promise<CashfreeInstance>;
}
