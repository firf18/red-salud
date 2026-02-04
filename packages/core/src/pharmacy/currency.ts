import { Currency, ExchangeRate, PharmacyPaymentMethod } from '@red-salud/types';

/**
 * Multi-Currency Manager
 * Handles conversions between currencies with dynamic exchange rates
 */
export class CurrencyManager {
  private exchangeRates: Map<string, number> = new Map();

  /**
   * Set exchange rate for a currency pair
   */
  setExchangeRate(from: Currency, to: Currency, rate: number): void {
    const key = this.getRateKey(from, to);
    this.exchangeRates.set(key, rate);
  }

  /**
   * Get exchange rate for a currency pair
   */
  getExchangeRate(from: Currency, to: Currency): number {
    const key = this.getRateKey(from, to);
    const rate = this.exchangeRates.get(key);
    
    if (rate === undefined) {
      throw new Error(`No exchange rate found for ${from} -> ${to}`);
    }
    
    return rate;
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;
    
    const rate = this.getExchangeRate(from, to);
    return amount * rate;
  }

  /**
   * Convert USD to VES (Bolívares)
   */
  usdToVes(amount: number): number {
    return this.convert(amount, Currency.USD, Currency.VES);
  }

  /**
   * Convert VES to USD
   */
  vesToUsd(amount: number): number {
    return this.convert(amount, Currency.VES, Currency.USD);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: Currency): string {
    const formatter = new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === Currency.VES ? 'VES' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  }

  /**
   * Format dual currency display (USD + VES)
   */
  formatDualCurrency(amountUsd: number, amountVes: number): string {
    return `${this.formatCurrency(amountUsd, Currency.USD)} / ${this.formatCurrency(amountVes, Currency.VES)}`;
  }

  /**
   * Get rate key for storage
   */
  private getRateKey(from: Currency, to: Currency): string {
    return `${from}_${to}`;
  }

  /**
   * Load exchange rates from array
   */
  loadRates(rates: ExchangeRate[]): void {
    rates.forEach((rate) => {
      this.setExchangeRate(rate.from_currency, rate.to_currency, rate.rate);
    });
  }

  /**
   * Get all configured rates
   */
  getAllRates(): Array<{ from: Currency; to: Currency; rate: number }> {
    const rates: Array<{ from: Currency; to: Currency; rate: number }> = [];
    
    this.exchangeRates.forEach((rate, key) => {
      const [from, to] = key.split('_') as [Currency, Currency];
      rates.push({ from, to, rate });
    });
    
    return rates;
  }
}

/**
 * BCV Exchange Rate Fetcher
 * Fetches official exchange rates from Banco Central de Venezuela
 */
export class BCVRateFetcher {
  private static readonly BCV_API_URL = 'https://pydolarve.org/api/v1/dollar';

  /**
   * Fetch current USD to VES rate from BCV
   */
  static async fetchCurrentRate(): Promise<number> {
    try {
      const response = await fetch(this.BCV_API_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch BCV rate');
      }

      const data = await response.json();
      
      // Extract rate from BCV API response
      if (data && data.year && data.year.dollar) {
        return parseFloat(data.year.dollar);
      }

      throw new Error('Invalid response format from BCV API');
    } catch (error) {
      console.error('Error fetching BCV rate:', error);
      throw error;
    }
  }

  /**
   * Fetch rate with fallback
   */
  static async fetchRateWithFallback(fallbackRate: number): Promise<number> {
    try {
      return await this.fetchCurrentRate();
    } catch (error) {
      console.warn('Using fallback exchange rate:', error);
      return fallbackRate;
    }
  }
}

/**
 * Price Calculator
 * Calculates prices in both currencies
 */
export class PriceCalculator {
  /**
   * Calculate sale price in VES from USD price
   */
  static calculateVesPrice(
    priceUsd: number,
    exchangeRate: number,
    markup: number = 0
  ): number {
    const basePrice = priceUsd * exchangeRate;
    return basePrice * (1 + markup);
  }

  /**
   * Calculate sale price in USD from VES price
   */
  static calculateUsdPrice(
    priceVes: number,
    exchangeRate: number,
    markup: number = 0
  ): number {
    const basePrice = priceVes / exchangeRate;
    return basePrice * (1 + markup);
  }

  /**
   * Calculate total price with IVA
   */
  static calculateWithIVA(
    basePrice: number,
    ivaRate: number
  ): number {
    return basePrice * (1 + ivaRate);
  }

  /**
   * Calculate subtotal, IVA, and total for invoice items
   */
  static calculateInvoiceTotals(
    items: Array<{
      unit_price_usd: number;
      unit_price_ves: number;
      quantity: number;
      iva_rate: number;
    }>
  ) {
    let subtotalUsd = 0;
    let subtotalVes = 0;
    let ivaUsd = 0;
    let ivaVes = 0;

    items.forEach((item) => {
      const itemSubtotalUsd = item.unit_price_usd * item.quantity;
      const itemSubtotalVes = item.unit_price_ves * item.quantity;
      const itemIvaUsd = itemSubtotalUsd * item.iva_rate;
      const itemIvaVes = itemSubtotalVes * item.iva_rate;

      subtotalUsd += itemSubtotalUsd;
      subtotalVes += itemSubtotalVes;
      ivaUsd += itemIvaUsd;
      ivaVes += itemIvaVes;
    });

    return {
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes,
      iva_usd: ivaUsd,
      iva_ves: ivaVes,
      total_usd: subtotalUsd + ivaUsd,
      total_ves: subtotalVes + ivaVes,
    };
  }

  /**
   * Calculate change for payment
   */
  static calculateChange(
    total: number,
    payment: number
  ): number {
    return payment - total;
  }

  /**
   * Calculate change for mixed payment methods
   */
  static calculateMixedChange(
    totalUsd: number,
    totalVes: number,
    payments: Array<{ amount_usd: number; amount_ves: number }>
  ): { change_usd: number; change_ves: number } {
    const totalPaidUsd = payments.reduce((sum, p) => sum + p.amount_usd, 0);
    const totalPaidVes = payments.reduce((sum, p) => sum + p.amount_ves, 0);

    return {
      change_usd: Math.max(0, totalPaidUsd - totalUsd),
      change_ves: Math.max(0, totalPaidVes - totalVes),
    };
  }
}

/**
 * IGTF (Impuesto a las Grandes Transacciones Financieras) Calculator
 * Calculates 3% tax for cash payments in foreign currency per Venezuelan law
 */
export class IGTFManager {
  private static readonly IGTF_RATE = 0.03;
  private static readonly STORAGE_KEY = 'igtf_accumulated';
  private static accumulatedIGTF: { usd: number; eur: number; total_ves: number } = { usd: 0, eur: 0, total_ves: 0 };

  static requiresIGTF(paymentMethod: PharmacyPaymentMethod): boolean {
    return paymentMethod === PharmacyPaymentMethod.CASH;
  }

  static calculateIGTF(amount: number, currency: 'USD' | 'EUR', exchangeRateToVES: number): {
    igtfAmount: number;
    igtfVES: number;
    rate: number;
  } {
    const igtfAmount = amount * this.IGTF_RATE;
    const igtfVES = igtfAmount * exchangeRateToVES;
    return { igtfAmount, igtfVES, rate: this.IGTF_RATE };
  }

  static calculateWithIGTF(
    subtotalUSD: number,
    subtotalVES: number,
    ivaUSD: number,
    ivaVES: number,
    paymentMethod: PharmacyPaymentMethod,
    exchangeRateUSD: number
  ): {
    subtotal_usd: number;
    subtotal_ves: number;
    iva_usd: number;
    iva_ves: number;
    igtf_usd: number;
    igtf_ves: number;
    total_usd: number;
    total_ves: number;
  } {
    const baseTotalUSD = subtotalUSD + ivaUSD;
    const baseTotalVES = subtotalVES + ivaVES;
    let igtfUSD = 0;
    let igtfVES = 0;

    if (this.requiresIGTF(paymentMethod)) {
      const igtfCalc = this.calculateIGTF(baseTotalUSD, 'USD', exchangeRateUSD);
      igtfUSD = igtfCalc.igtfAmount;
      igtfVES = igtfCalc.igtfVES;
    }

    return {
      subtotal_usd: subtotalUSD,
      subtotal_ves: subtotalVES,
      iva_usd: ivaUSD,
      iva_ves: ivaVES,
      igtf_usd: igtfUSD,
      igtf_ves: igtfVES,
      total_usd: baseTotalUSD + igtfUSD,
      total_ves: baseTotalVES + igtfVES,
    };
  }

  static async accumulateIGTF(igtfUSD: number, igtfEUR: number, igtfVES: number): Promise<void> {
    this.accumulatedIGTF.usd += igtfUSD;
    this.accumulatedIGTF.eur += igtfEUR;
    this.accumulatedIGTF.total_ves += igtfVES;
    await this.persistAccumulated();
  }

  static getAccumulatedIGTF(): { usd: number; eur: number; total_ves: number; declaration_date: Date } {
    return {
      usd: this.accumulatedIGTF.usd,
      eur: this.accumulatedIGTF.eur,
      total_ves: this.accumulatedIGTF.total_ves,
      declaration_date: new Date(),
    };
  }

  static async resetAccumulatedIGTF(): Promise<void> {
    this.accumulatedIGTF = { usd: 0, eur: 0, total_ves: 0 };
    await this.persistAccumulated();
  }

  private static async persistAccumulated(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.accumulatedIGTF));
    } catch (error) {
      console.error('Error persisting accumulated IGTF:', error);
    }
  }

  static async loadAccumulated(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.accumulatedIGTF = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading accumulated IGTF:', error);
    }
  }
}

/**
 * Cash Drawer Manager
 * Multi-currency cash drawer with change calculation and digital vouchers
 */
export interface CashDrawerEntry {
  id: string;
  timestamp: Date;
  type: 'opening' | 'sale' | 'payment' | 'refund' | 'closing' | 'adjustment';
  currency: 'USD' | 'EUR' | 'VES';
  amount: number;
  payment_method?: PharmacyPaymentMethod;
  invoice_id?: string;
  description?: string;
  user_id: string;
  created_at: Date;
}

export interface DigitalVoucher {
  id: string;
  voucher_number: string;
  original_amount_usd: number;
  original_amount_ves: number;
  remaining_balance_usd: number;
  remaining_balance_ves: number;
  issued_date: Date;
  expires_date: Date;
  customer_name?: string;
  customer_ci?: string;
  invoice_id: string;
  warehouse_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CashDrawerManager {
  private static entries: CashDrawerEntry[] = [];
  private static vouchers: DigitalVoucher[] = [];
  private static STORAGE_KEY_ENTRIES = 'cash_drawer_entries';
  private static STORAGE_KEY_VOUCHERS = 'digital_vouchers';

  static async addEntry(data: Omit<CashDrawerEntry, 'id' | 'timestamp' | 'created_at'>): Promise<CashDrawerEntry> {
    const entry: CashDrawerEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...data,
      created_at: new Date(),
    };
    CashDrawerManager.entries.push(entry);
    await CashDrawerManager.persistEntries();
    return entry;
  }

  static getCurrentBalance(currency: 'USD' | 'EUR' | 'VES'): number {
    return CashDrawerManager.entries
      .filter((entry: CashDrawerEntry) => entry.currency === currency)
      .reduce((sum: number, entry: CashDrawerEntry) => {
        switch (entry.type) {
          case 'opening':
          case 'sale':
          case 'payment':
            return sum + entry.amount;
          case 'refund':
          case 'closing':
          case 'adjustment':
            return sum - entry.amount;
          default:
            return sum;
        }
      }, 0);
  }

  static getAllBalances(): { usd: number; eur: number; ves: number } {
    return {
      usd: CashDrawerManager.getCurrentBalance('USD'),
      eur: CashDrawerManager.getCurrentBalance('EUR'),
      ves: CashDrawerManager.getCurrentBalance('VES'),
    };
  }

  static calculateChange(
    totalUSD: number,
    totalVES: number,
    paymentUSD: number,
    paymentEUR: number,
    paymentVES: number,
    exchangeRateUSD: number,
    exchangeRateEUR: number
  ): {
    changeUSD: number;
    changeEUR: number;
    changeVES: number;
    changeSuggestion: 'cash_usd' | 'cash_eur' | 'cash_ves' | 'pago_movil' | 'digital_voucher';
    digitalVoucherAmount?: number;
  } {
    const totalPaidUSD = paymentUSD + (paymentEUR * exchangeRateEUR / exchangeRateUSD) + (paymentVES / exchangeRateUSD);
    const totalPaidVES = paymentUSD * exchangeRateUSD + paymentEUR * exchangeRateEUR + paymentVES;

    const changeUSD = Math.max(0, totalPaidUSD - totalUSD);
    const changeEUR = Math.max(0, paymentEUR);
    const changeVES = Math.max(0, totalPaidVES - totalVES);

    let changeSuggestion: 'cash_usd' | 'cash_eur' | 'cash_ves' | 'pago_movil' | 'digital_voucher' = 'cash_usd';
    let digitalVoucherAmount: number | undefined;

    if (changeUSD > 0 && changeUSD < 2) {
      changeSuggestion = 'digital_voucher';
      digitalVoucherAmount = changeUSD;
    } else if (paymentVES > 0 && changeVES > 0) {
      changeSuggestion = 'cash_ves';
    } else if (paymentEUR > 0 && changeEUR > 0) {
      changeSuggestion = 'cash_eur';
    }

    return { changeUSD, changeEUR, changeVES, changeSuggestion, digitalVoucherAmount };
  }

  static async createVoucher(data: {
    originalAmountUSD: number;
    originalAmountVES: number;
    customerName?: string;
    customerCI?: string;
    invoiceId: string;
    warehouseId: string;
    expiresInDays?: number;
  }): Promise<DigitalVoucher> {
    const voucherNumber = `VCH-${Date.now().toString().slice(-8)}`;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + (data.expiresInDays || 30));

    const voucher: DigitalVoucher = {
      id: crypto.randomUUID(),
      voucher_number: voucherNumber,
      original_amount_usd: data.originalAmountUSD,
      original_amount_ves: data.originalAmountVES,
      remaining_balance_usd: data.originalAmountUSD,
      remaining_balance_ves: data.originalAmountVES,
      issued_date: new Date(),
      expires_date: expiresDate,
      customer_name: data.customerName,
      customer_ci: data.customerCI,
      invoice_id: data.invoiceId,
      warehouse_id: data.warehouseId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.vouchers.push(voucher);
    await this.persistVouchers();
    return voucher;
  }

  static async useVoucher(
    voucherNumber: string,
    amountUSD: number,
    amountVES: number
  ): Promise<{ success: boolean; remainingUSD: number; remainingVES: number; message?: string }> {
    const voucher = this.vouchers.find(v => v.voucher_number === voucherNumber);

    if (!voucher) {
      return { success: false, remainingUSD: 0, remainingVES: 0, message: 'Voucher not found' };
    }

    if (!voucher.is_active) {
      return { success: false, remainingUSD: 0, remainingVES: 0, message: 'Voucher is not active' };
    }

    if (new Date() > voucher.expires_date) {
      return { success: false, remainingUSD: 0, remainingVES: 0, message: 'Voucher has expired' };
    }

    if (amountUSD > voucher.remaining_balance_usd || amountVES > voucher.remaining_balance_ves) {
      return {
        success: false,
        remainingUSD: voucher.remaining_balance_usd,
        remainingVES: voucher.remaining_balance_ves,
        message: 'Insufficient balance',
      };
    }

    voucher.remaining_balance_usd -= amountUSD;
    voucher.remaining_balance_ves -= amountVES;
    voucher.updated_at = new Date();

    if (voucher.remaining_balance_usd <= 0.01 && voucher.remaining_balance_ves <= 0.01) {
      voucher.is_active = false;
    }

    await this.persistVouchers();

    return {
      success: true,
      remainingUSD: voucher.remaining_balance_usd,
      remainingVES: voucher.remaining_balance_ves,
    };
  }

  static getActiveVouchers(customerCI?: string): DigitalVoucher[] {
    return this.vouchers.filter(v => v.is_active && (!customerCI || v.customer_ci === customerCI));
  }

  static generateReport(startDate: Date, endDate: Date): {
    period: { start: Date; end: Date };
    entries: CashDrawerEntry[];
    balances: { usd: number; eur: number; ves: number };
    summary: { total_usd: number; total_eur: number; total_ves: number; total_transactions: number };
  } {
    const entriesInRange = this.entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const summary = entriesInRange.reduce(
      (acc, entry) => {
        switch (entry.currency) {
          case 'USD':
            acc.total_usd += entry.amount;
            break;
          case 'EUR':
            acc.total_eur += entry.amount;
            break;
          case 'VES':
            acc.total_ves += entry.amount;
            break;
        }
        acc.total_transactions++;
        return acc;
      },
      { total_usd: 0, total_eur: 0, total_ves: 0, total_transactions: 0 }
    );

    return {
      period: { start: startDate, end: endDate },
      entries: entriesInRange,
      balances: this.getAllBalances(),
      summary,
    };
  }

  private static async persistEntries(): Promise<void> {
    try {
      const entriesToStore = this.entries.slice(-1000);
      localStorage.setItem(this.STORAGE_KEY_ENTRIES, JSON.stringify(entriesToStore));
    } catch (error) {
      console.error('Error persisting cash drawer entries:', error);
    }
  }

  private static async persistVouchers(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_VOUCHERS, JSON.stringify(this.vouchers));
    } catch (error) {
      console.error('Error persisting digital vouchers:', error);
    }
  }

  static async loadEntries(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_ENTRIES);
      if (stored) {
        this.entries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          created_at: new Date(entry.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading cash drawer entries:', error);
    }
  }

  static async loadVouchers(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_VOUCHERS);
      if (stored) {
        this.vouchers = JSON.parse(stored).map((voucher: any) => ({
          ...voucher,
          issued_date: new Date(voucher.issued_date),
          expires_date: new Date(voucher.expires_date),
          created_at: new Date(voucher.created_at),
          updated_at: new Date(voucher.updated_at),
        }));
      }
    } catch (error) {
      console.error('Error loading digital vouchers:', error);
    }
  }
}
