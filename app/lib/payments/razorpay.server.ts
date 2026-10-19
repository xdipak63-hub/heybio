export interface RazorpayBindings {
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
}

export interface RazorpaySubscription {
  id: string;
  entity: "subscription";
  plan_id: string;
  status: string;
  customer_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
  total_count: number;
  paid_count: number;
  remaining_count?: number;
  short_url?: string | null;
}

export interface RazorpayPayment {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  subscription_id?: string | null;
  captured: boolean;
  created_at: number;
  method?: string | null;
  amount_refunded?: number;
}

export interface RazorpayPlan {
  id: string;
  entity: "plan";
  interval: number;
  period: string;
  item: { amount: number; currency: string };
}

export interface RazorpayOrder {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  currency: string;
  status: string;
  receipt: string;
}

export interface CreateSubscriptionInput {
  razorpayPlanId: string;
  totalCount: number;
  notifyCustomer?: boolean;
  notes?: Record<string, string>;
}

export class RazorpayApiError extends Error {
  constructor(
    readonly status: number,
    readonly retryable: boolean
  ) {
    super(`Razorpay API error: ${status}`);
    this.name = "RazorpayApiError";
  }
}

export class RazorpayClient {
  private readonly authorization: string;

  constructor(env: RazorpayBindings) {
    if (
      !env.RAZORPAY_KEY_ID?.trim() ||
      !env.RAZORPAY_KEY_SECRET?.trim()
    ) {
      throw new Error("Razorpay credentials missing");
    }

    this.authorization = "Basic " + btoa(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    );
  }

  private async request<T>(
    path: string,
    options: {
      method?: "GET" | "POST";
      body?: unknown;
    } = {}
  ): Promise<T> {
    const response = await fetch(
      `https://api.razorpay.com/v1${path}`,
      {
        method: options.method ?? "GET",
        headers: {
          Authorization: this.authorization,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      throw new RazorpayApiError(
        response.status,
        response.status === 429 ||
        response.status >= 500
      );
    }

    return await response.json() as T;
  }

  async createOrder(input: {
    amountPaise: number;
    receipt: string;
    notes: Record<string, string>;
  }): Promise<RazorpayOrder> {
    if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise < 100 ||
        !/^[a-zA-Z0-9_-]{1,40}$/.test(input.receipt)) {
      throw new Error("Invalid order request");
    }
    return this.request<RazorpayOrder>("/orders", {
      method: "POST",
      body: { amount: input.amountPaise, currency: "INR", receipt: input.receipt,
        partial_payment: false, notes: input.notes }
    });
  }

  async getPlan(planId: string): Promise<RazorpayPlan> {
    if (!/^plan_[A-Za-z0-9]+$/.test(planId)) throw new Error("Invalid plan ID");
    return this.request<RazorpayPlan>(`/plans/${planId}`);
  }

  async getOrder(orderId: string): Promise<RazorpayOrder> {
    if (!/^order_[A-Za-z0-9]+$/.test(orderId)) throw new Error("Invalid order ID");
    return this.request<RazorpayOrder>(`/orders/${orderId}`);
  }

  async getSubscription(
    subscriptionId: string
  ): Promise<RazorpaySubscription> {
    if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
      throw new Error("Invalid subscription ID");
    }

    return this.request<RazorpaySubscription>(
      `/subscriptions/${subscriptionId}`
    );
  }

  async getPayment(
    paymentId: string
  ): Promise<RazorpayPayment> {
    if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
      throw new Error("Invalid payment ID");
    }

    return this.request<RazorpayPayment>(
      `/payments/${paymentId}`
    );
  }

  async createSubscription(
    input: CreateSubscriptionInput
  ): Promise<RazorpaySubscription> {
    if (
      !/^plan_[A-Za-z0-9]+$/.test(input.razorpayPlanId) ||
      !Number.isSafeInteger(input.totalCount) ||
      input.totalCount < 1 ||
      input.totalCount > 120
    ) {
      throw new Error("Invalid subscription input");
    }

    return this.request<RazorpaySubscription>(
      "/subscriptions",
      {
        method: "POST",
        body: {
          plan_id: input.razorpayPlanId,
          total_count: input.totalCount,
          customer_notify: input.notifyCustomer === false
            ? 0 : 1,
          notes: input.notes ?? {}
        }
      }
    );
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtCycleEnd: boolean
  ): Promise<RazorpaySubscription> {
    if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
      throw new Error("Invalid subscription ID");
    }

    return this.request<RazorpaySubscription>(
      `/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        body: {
          cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0
        }
      }
    );
  }
}

export function createRazorpayClient(
  env: RazorpayBindings
): RazorpayClient {
  return new RazorpayClient(env);
}