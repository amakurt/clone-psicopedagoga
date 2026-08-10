import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private api = inject(ApiService);

  getStatus() {
    return this.api.get('/billing');
  }

  getPlans() {
    return this.api.get('/billing/plans');
  }

  checkout(planCode: string) {
    return this.api.post('/billing/checkout', { planCode });
  }

  mockPay() {
    return this.api.post('/billing/mock-pay', {});
  }
}