import { PaymentOrder, PaymentVerificationResult } from '../types';

export interface IPaymentService {
  createOrder(userId: string, amountInInr: number): Promise<PaymentOrder>;
  verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature?: string;
    method?: string;
  }): Promise<PaymentVerificationResult>;
  processWebhook(rawPayload: string, webhookSignature: string): Promise<boolean>;
  getPaymentStatus(orderId: string): Promise<string>;
  refundPayment(orderId: string, reason: string): Promise<boolean>;
}

/**
 * Mock / Sandbox Payment Gateway Implementation
 * Provides safe demo deposits without real monetary settlement.
 * Complies with strict sandbox and virtual credits specifications.
 */
export class MockPaymentService implements IPaymentService {
  private orders: Map<string, PaymentOrder> = new Map();

  async createOrder(userId: string, amountInInr: number): Promise<PaymentOrder> {
    if (amountInInr < 55) {
      throw new Error('Minimum deposit amount is ₹55.');
    }

    const orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const order: PaymentOrder = {
      orderId,
      userId,
      amountInInr,
      creditsToAward: amountInInr, // 1 INR = 1 Game Credit
      currency: 'INR',
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      gateway: 'MOCK_SANDBOX',
      receipt: `rcpt_${Date.now()}`,
    };

    this.orders.set(orderId, order);
    return order;
  }

  async verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature?: string;
    method?: string;
  }): Promise<PaymentVerificationResult> {
    const order = this.orders.get(payload.orderId);
    if (!order) {
      // Fallback for orders created in previous server sessions
      const credits = 100;
      return {
        success: true,
        orderId: payload.orderId,
        paymentId: payload.paymentId || `pay_mock_${Date.now()}`,
        signature: `sig_sandbox_valid_${Date.now()}`,
        creditsAdded: credits,
        newBalance: credits,
        message: 'Sandbox payment verified successfully.',
      };
    }

    order.status = 'PAID';
    this.orders.set(payload.orderId, order);

    return {
      success: true,
      orderId: order.orderId,
      paymentId: payload.paymentId || `pay_mock_${Date.now()}`,
      signature: `sig_sandbox_valid_${Date.now()}`,
      creditsAdded: order.creditsToAward,
      newBalance: order.creditsToAward,
      message: 'Demo / Sandbox payment confirmed. Virtual credits added to ledger.',
    };
  }

  async processWebhook(rawPayload: string, webhookSignature: string): Promise<boolean> {
    console.log('[MockPaymentService] Webhook received (sandbox simulation):', {
      rawPayload,
      webhookSignature,
    });
    return true;
  }

  async getPaymentStatus(orderId: string): Promise<string> {
    const order = this.orders.get(orderId);
    return order ? order.status : 'UNKNOWN';
  }

  async refundPayment(orderId: string, reason: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = 'FAILED';
      console.log(`[MockPaymentService] Order ${orderId} refunded for reason: ${reason}`);
      return true;
    }
    return false;
  }
}

/**
 * Future Razorpay Payment Service Adapter
 * Can be activated seamlessly once keys are supplied on the server side:
 * RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 * NEVER expose secrets to the client.
 */
export class RazorpayPaymentServiceAdapter implements IPaymentService {
  private keyId: string;
  private isConfigured: boolean;

  constructor(keyId: string = '') {
    this.keyId = keyId;
    this.isConfigured = Boolean(keyId);
  }

  async createOrder(userId: string, amountInInr: number): Promise<PaymentOrder> {
    if (!this.isConfigured) {
      throw new Error(
        'Razorpay credentials not yet configured on server. Use Sandbox Payment.'
      );
    }
    // Future server call to /api/payments/razorpay/create-order
    const res = await fetch('/api/payments/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amountInInr }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create Razorpay order');
    }
    return res.json();
  }

  async verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature?: string;
  }): Promise<PaymentVerificationResult> {
    // Forward to trusted server-side HMAC validation
    const res = await fetch('/api/payments/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Razorpay server verification failed');
    }
    return res.json();
  }

  async processWebhook(rawPayload: string, webhookSignature: string): Promise<boolean> {
    const res = await fetch('/api/payments/razorpay/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': webhookSignature,
      },
      body: rawPayload,
    });
    return res.ok;
  }

  async getPaymentStatus(orderId: string): Promise<string> {
    const res = await fetch(`/api/payments/razorpay/status/${orderId}`);
    const data = await res.json();
    return data.status || 'UNKNOWN';
  }

  async refundPayment(orderId: string, reason: string): Promise<boolean> {
    const res = await fetch('/api/payments/razorpay/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, reason }),
    });
    return res.ok;
  }
}

// Export singleton instance
export const mockPaymentService = new MockPaymentService();
