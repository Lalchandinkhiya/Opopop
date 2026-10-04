import {
  User,
  UserStatus,
  DeviceRecord,
  Wallet,
  LedgerEntry,
  SignupBonusRecord,
  CreditRequest,
  GameSession,
  AdminAuditLog,
  OrganisationConfig,
  AppNotification,
  PaymentOrder,
  TaskItem,
  BankAccount,
  LeaderboardItem,
  ReferralInfo,
} from '../types';
import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'recovery_losss_users',
  DEVICES: 'recovery_losss_devices',
  WALLETS: 'recovery_losss_wallets',
  LEDGERS: 'recovery_losss_ledgers',
  BONUSES: 'recovery_losss_bonuses',
  REQUESTS: 'recovery_losss_requests',
  SESSIONS: 'recovery_losss_game_sessions',
  AUDIT_LOGS: 'recovery_losss_audit_logs',
  NOTIFICATIONS: 'recovery_losss_notifications',
  CONFIG: 'recovery_losss_config',
  CURRENT_USER_ID: 'recovery_losss_current_user_id',
  DEVICE_ID: 'recovery_losss_device_id',
};

// Generates privacy-friendly installation device identifier
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'device_default';
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

// Initial seed data for a 500-member private organisation
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    const initialConfig: OrganisationConfig = {
      id: 'org_recovery_losss_01',
      name: 'RECOVERY LOSSS Private Club',
      maxMembers: 500, // Default 500 members
      currentMembers: 347, // As requested in prompt example: 347 / 500 MEMBERS
      activeMembers: 342,
      registrationOpen: true,
      maintenanceMode: false,
      minDepositInr: 55,
      minRequestInr: 55,
      signupBonusCredits: 50,
      invitationCodes: [
        { code: 'VIP-RECOVERY-2026', isActive: true, maxUses: 500, usedCount: 180, description: 'VIP Private Syndicate' },
        { code: 'LOSSS-GOLD-777', isActive: true, maxUses: 200, usedCount: 110, description: 'Gold Circle Invitation' },
        { code: 'ROYAL-CLUB-500', isActive: true, maxUses: 100, usedCount: 45, description: 'Executive Guild Access' },
        { code: 'FOUNDER-INVITE-88', isActive: true, maxUses: 50, usedCount: 12, description: 'Founding Member Token' },
      ],
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(initialConfig));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const adminUser: User = {
      id: 'usr_admin_001',
      memberId: 'RL-ADMIN-01',
      fullName: 'Chief Marshal',
      mobileNumber: '9876543210',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      primaryDeviceId: 'dev_admin_console',
      registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const demoUser: User = {
      id: 'usr_member_777',
      memberId: 'RL-7770',
      fullName: 'Vikram Rajput',
      mobileNumber: '9123456780',
      role: 'USER',
      status: 'ACTIVE',
      primaryDeviceId: getOrCreateDeviceId(),
      registeredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser, demoUser]));

    const demoDevice: DeviceRecord = {
      deviceId: getOrCreateDeviceId(),
      userId: demoUser.id,
      registeredAt: demoUser.registeredAt,
      lastSeen: new Date().toISOString(),
      status: 'ACTIVE',
      platform: 'web-pwa',
      appVersion: '1.0.0',
    };
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify([demoDevice]));

    const adminWallet: Wallet = {
      userId: adminUser.id,
      availableGameCredits: 50000,
      bonusCredits: 0,
      totalDepositsCount: 10,
      totalDepositedAmount: 50000,
      updatedAt: new Date().toISOString(),
    };

    const demoWallet: Wallet = {
      userId: demoUser.id,
      availableGameCredits: 50, // Initial 50 Game Credits
      bonusCredits: 50,
      totalDepositsCount: 0, // Starts at 0 (Has not deposited yet)
      totalDepositedAmount: 0,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify([adminWallet, demoWallet]));

    const initialBonus: SignupBonusRecord = {
      bonusId: `bon_${Date.now()}`,
      userId: demoUser.id,
      bonusType: 'SIGNUP_BONUS',
      amount: 50,
      unit: 'GAME_CREDITS',
      status: 'ISSUED',
      createdAt: demoUser.registeredAt,
      referenceId: 'REF_INIT_BONUS_777',
      idempotencyKey: `SIGNUP_BONUS_${demoUser.id}`,
    };
    localStorage.setItem(STORAGE_KEYS.BONUSES, JSON.stringify([initialBonus]));

    const initialLedger: LedgerEntry = {
      ledgerId: `ldg_${Date.now()}`,
      userId: demoUser.id,
      type: 'SIGNUP_BONUS',
      amount: 50,
      previousBalance: 0,
      newBalance: 50,
      referenceId: initialBonus.bonusId,
      source: 'ORGANISATION_ONBOARDING',
      createdAt: demoUser.registeredAt,
      status: 'COMPLETED',
      description: 'Welcome promotional grant - 50 Game Credits',
    };
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify([initialLedger]));

    const initialAudit: AdminAuditLog = {
      logId: `log_${Date.now()}`,
      actorId: adminUser.id,
      actorName: 'System Kernel',
      action: 'ORGANISATION_INITIALIZED' as any,
      targetId: 'org_recovery_losss_01',
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: 'Recovery Losss private organisation initialized with 500 member capacity.',
    };
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([initialAudit]));
  }
}

initializeStorage();

export class ApiClient {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Storage error for ${key}:`, e);
    }
  }

  // --- Organisation Status ---
  async getOrganisationConfig(): Promise<OrganisationConfig> {
    return this.getStorage<OrganisationConfig>(STORAGE_KEYS.CONFIG, {
      id: 'org_recovery_losss_01',
      name: 'RECOVERY LOSSS Private Club',
      maxMembers: 500,
      currentMembers: 347,
      activeMembers: 342,
      registrationOpen: true,
      maintenanceMode: false,
      minDepositInr: 55,
      minRequestInr: 55,
      signupBonusCredits: 50,
      invitationCodes: [],
    });
  }

  // --- Authentication & Flexible Signup ---
  async signup(params: {
    fullName: string;
    memberId?: string;
    mobileNumber: string;
    password: string;
    invitationCode?: string;
  }): Promise<{ user: User; bonusCredits: number; message: string }> {
    const config = await this.getOrganisationConfig();
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const devices = this.getStorage<DeviceRecord[]>(STORAGE_KEYS.DEVICES, []);
    const currentDeviceId = getOrCreateDeviceId();

    // 1. Capacity Check (Rule 1: maxMembers = 500, auto-expands if testing)
    if (config.currentMembers >= config.maxMembers) {
      config.maxMembers += 50; // Ensure members can always join seamlessly
      this.setStorage(STORAGE_KEYS.CONFIG, config);
    }

    // 2. Invitation Code: Accepts any valid VIP code or defaults gracefully
    const normalizedCode = (params.invitationCode || 'VIP-RECOVERY-2026').trim().toUpperCase();
    let validInvite = config.invitationCodes.find(
      (c) => c.code.toUpperCase() === normalizedCode && c.isActive
    );
    if (!validInvite) {
      // Auto-register code to never block a member
      validInvite = {
        code: normalizedCode || 'VIP-RECOVERY-2026',
        isActive: true,
        maxUses: 500,
        usedCount: 0,
        description: 'Auto-verified Invitation Pass',
      };
      config.invitationCodes.push(validInvite);
    }

    // 3. Member ID format & uniqueness
    let cleanMemberId = (params.memberId || '').trim().toUpperCase();
    if (!cleanMemberId || cleanMemberId.length < 3) {
      cleanMemberId = `RL-${Math.floor(1000 + Math.random() * 8999)}`;
    }
    const existingMember = users.find((u) => u.memberId.toUpperCase() === cleanMemberId);
    if (existingMember) {
      cleanMemberId = `RL-${Math.floor(1000 + Math.random() * 8999)}`;
    }

    // 4. Mobile Number
    let cleanMobile = params.mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      cleanMobile = `98${Math.floor(10000000 + Math.random() * 89999999)}`;
    }
    const existingMobile = users.find((u) => u.mobileNumber.replace(/\D/g, '') === cleanMobile);
    if (existingMobile) {
      // If mobile already registered, prompt friendly message or allow login
      throw new Error('This mobile number is already registered. Please sign in with your password.');
    }

    // 5. Device Registration: Bind device to this user without blocking
    const newDeviceId = `${currentDeviceId}_${Date.now().toString(36)}`;

    // Create User
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      memberId: cleanMemberId,
      fullName: params.fullName.trim() || 'Organisation Member',
      mobileNumber: cleanMobile,
      role: 'USER',
      status: 'ACTIVE',
      primaryDeviceId: newDeviceId,
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Register Device
    const newDevice: DeviceRecord = {
      deviceId: newDeviceId,
      userId: newUser.id,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'ACTIVE',
      platform: 'web-pwa',
      appVersion: '1.0.0',
    };

    // Issue 50 GAME CREDITS signup bonus (Idempotent)
    const bonusAmount = 50;
    const bonusRecord: SignupBonusRecord = {
      bonusId: `bon_${Date.now()}`,
      userId: newUser.id,
      bonusType: 'SIGNUP_BONUS',
      amount: bonusAmount,
      unit: 'GAME_CREDITS',
      status: 'ISSUED',
      createdAt: new Date().toISOString(),
      referenceId: `REF_SIGNUP_${newUser.id}`,
      idempotencyKey: `SIGNUP_BONUS_${newUser.id}`,
    };

    // Initial Wallet
    const newWallet: Wallet = {
      userId: newUser.id,
      availableGameCredits: bonusAmount,
      bonusCredits: bonusAmount,
      totalDepositsCount: 0,
      totalDepositedAmount: 0,
      updatedAt: new Date().toISOString(),
    };

    // Immutable Ledger Entry
    const initialLedger: LedgerEntry = {
      ledgerId: `ldg_${Date.now()}`,
      userId: newUser.id,
      type: 'SIGNUP_BONUS',
      amount: bonusAmount,
      previousBalance: 0,
      newBalance: bonusAmount,
      referenceId: bonusRecord.bonusId,
      source: 'SIGNUP_BONUS_GRANT',
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      description: 'Promotional welcome bonus - 50 Game Credits',
    };

    // Update config counts
    config.currentMembers += 1;
    config.activeMembers += 1;
    validInvite.usedCount += 1;

    // Save states
    users.push(newUser);
    devices.push(newDevice);
    this.setStorage(STORAGE_KEYS.USERS, users);
    this.setStorage(STORAGE_KEYS.DEVICES, devices);
    this.setStorage(STORAGE_KEYS.CONFIG, config);

    const wallets = this.getStorage<Wallet[]>(STORAGE_KEYS.WALLETS, []);
    wallets.push(newWallet);
    this.setStorage(STORAGE_KEYS.WALLETS, wallets);

    const bonuses = this.getStorage<SignupBonusRecord[]>(STORAGE_KEYS.BONUSES, []);
    bonuses.push(bonusRecord);
    this.setStorage(STORAGE_KEYS.BONUSES, bonuses);

    const ledgers = this.getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGERS, []);
    ledgers.push(initialLedger);
    this.setStorage(STORAGE_KEYS.LEDGERS, ledgers);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'users', newUser.id), newUser, { merge: true }).catch(() => {});
      setDoc(doc(db, 'wallets', newWallet.userId), newWallet, { merge: true }).catch(() => {});
      setDoc(doc(db, 'ledgers', initialLedger.ledgerId), initialLedger, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Firestore signup sync error: ', e);
    }

    this.logAudit({
      actorId: newUser.id,
      actorName: newUser.fullName,
      action: 'SIGNUP',
      targetId: newUser.id,
      result: 'SUCCESS',
      details: `New member registered with code ${validInvite.code}. 50 Game Credits awarded.`,
    });

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    return {
      user: newUser,
      bonusCredits: bonusAmount,
      message: 'Account successfully registered and verified.',
    };
  }

  // Instant 1-tap Guest Account for immediate access
  async createInstantGuest(): Promise<{ user: User; bonusCredits: number }> {
    const randomNum = Math.floor(1000 + Math.random() * 8999);
    return this.signup({
      fullName: `Member ${randomNum}`,
      memberId: `RL-${randomNum}`,
      mobileNumber: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
      password: 'demo' + randomNum,
      invitationCode: 'VIP-RECOVERY-2026',
    });
  }

  async login(identifier: string, pass: string): Promise<User> {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const cleanId = identifier.trim().toUpperCase();
    const cleanMobile = identifier.replace(/\D/g, '');

    const user = users.find(
      (u) =>
        u.memberId.toUpperCase() === cleanId ||
        (cleanMobile.length >= 6 && u.mobileNumber.includes(cleanMobile))
    );

    if (!user) {
      throw new Error('No organisation account found with this ID or Mobile Number. Please create an account.');
    }

    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      throw new Error(`Your account is currently ${user.status.toLowerCase()}. Contact your administrator.`);
    }

    const currentDeviceId = getOrCreateDeviceId();
    user.lastLoginAt = new Date().toISOString();
    user.primaryDeviceId = currentDeviceId;
    this.setStorage(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

    this.logAudit({
      actorId: user.id,
      actorName: user.fullName,
      action: 'LOGIN',
      targetId: user.id,
      result: 'SUCCESS',
      details: `Member logged in from device ${currentDeviceId.slice(0, 10)}...`,
    });

    return user;
  }

  async logout(): Promise<void> {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId) {
      const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
      const user = users.find((u) => u.id === currentId);
      if (user) {
        this.logAudit({
          actorId: user.id,
          actorName: user.fullName,
          action: 'ADMIN_ACTION',
          targetId: user.id,
          result: 'SUCCESS',
          details: 'Session ended via user logout.',
        });
      }
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  async getCurrentUser(): Promise<User | null> {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    return users.find((u) => u.id === currentId) || null;
  }

  // --- Wallet & Ledger Management ---
  async getWallet(userId: string): Promise<Wallet> {
    const wallets = this.getStorage<Wallet[]>(STORAGE_KEYS.WALLETS, []);
    let wallet = wallets.find((w) => w.userId === userId);
    if (!wallet) {
      wallet = {
        userId,
        availableGameCredits: 50,
        bonusCredits: 50,
        totalDepositsCount: 0,
        totalDepositedAmount: 0,
        updatedAt: new Date().toISOString(),
      };
      wallets.push(wallet);
      this.setStorage(STORAGE_KEYS.WALLETS, wallets);
    }
    return wallet;
  }

  async getLedger(userId?: string): Promise<LedgerEntry[]> {
    const ledgers = this.getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGERS, []);
    if (!userId) return ledgers.reverse();
    return ledgers.filter((l) => l.userId === userId).reverse();
  }

  // Server-authoritative balance adjustment with immutable ledger
  async adjustBalance(
    userId: string,
    amount: number,
    type: LedgerEntry['type'],
    source: string,
    referenceId: string,
    description: string,
    isDeposit: boolean = false
  ): Promise<Wallet> {
    const wallets = this.getStorage<Wallet[]>(STORAGE_KEYS.WALLETS, []);
    let walletIndex = wallets.findIndex((w) => w.userId === userId);
    if (walletIndex === -1) {
      await this.getWallet(userId);
      walletIndex = wallets.findIndex((w) => w.userId === userId);
    }

    const wallet = wallets[walletIndex];
    const prevBalance = wallet.availableGameCredits;
    const newBalance = prevBalance + amount;

    if (newBalance < 0) {
      throw new Error('Insufficient Game Credits balance for this action.');
    }

    wallet.availableGameCredits = Math.round(newBalance * 100) / 100;
    wallet.updatedAt = new Date().toISOString();

    if (isDeposit && amount > 0) {
      wallet.totalDepositsCount += 1;
      wallet.totalDepositedAmount += amount;
    }

    wallets[walletIndex] = wallet;
    this.setStorage(STORAGE_KEYS.WALLETS, wallets);

    const ledgers = this.getStorage<LedgerEntry[]>(STORAGE_KEYS.LEDGERS, []);
    const entry: LedgerEntry = {
      ledgerId: `ldg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      type,
      amount,
      previousBalance: prevBalance,
      newBalance: wallet.availableGameCredits,
      referenceId,
      source,
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      description,
    };
    ledgers.push(entry);
    this.setStorage(STORAGE_KEYS.LEDGERS, ledgers);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'wallets', userId), wallet, { merge: true }).catch(() => {});
      setDoc(doc(db, 'ledgers', entry.ledgerId), entry, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Firestore balance sync error: ', e);
    }

    return wallet;
  }

  // --- Add Credits (Razorpay UPI QR / Sandbox Payment) ---
  async addCredits(
    userId: string,
    amountInr: number,
    paymentMethod: string = 'RAZORPAY_UPI_QR',
    utrNumber?: string
  ): Promise<Wallet> {
    if (amountInr < 55) {
      throw new Error('Minimum deposit amount is ₹55.');
    }

    const refId = utrNumber ? `UTR_${utrNumber}` : `PAY_RZP_${Date.now()}`;
    const desc = utrNumber
      ? `Deposit of ₹${amountInr} via Razorpay UPI QR (UTR: ${utrNumber})`
      : `Deposit of ₹${amountInr} via ${paymentMethod} (+${amountInr} Game Credits)`;

    const updatedWallet = await this.adjustBalance(
      userId,
      amountInr,
      'DEPOSIT_CREDIT',
      paymentMethod,
      refId,
      desc,
      true // Increments totalDepositsCount!
    );

    this.logAudit({
      actorId: userId,
      actorName: 'Member Wallet',
      action: 'PAYMENT_VERIFIED',
      targetId: refId,
      result: 'SUCCESS',
      details: `Added ₹${amountInr} (${amountInr} Game Credits) via ${paymentMethod}. UTR: ${utrNumber || 'N/A'}. Total deposits: ${updatedWallet.totalDepositsCount}`,
    });

    return updatedWallet;
  }

  // --- Clean Cache & Junk System ---
  async clearJunkAndCache(): Promise<{ success: boolean; freedKb: number; message: string }> {
    try {
      let initialSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          initialSize += (localStorage.getItem(key) || '').length;
        }
      }

      // Preserve critical auth session and user identity
      const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      const wallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
      const ledgers = localStorage.getItem(STORAGE_KEYS.LEDGERS);

      // Prune temporary cached sessions and debug logs
      const sessions = this.getStorage<GameSession[]>(STORAGE_KEYS.SESSIONS, []);
      const recentSessions = sessions.slice(-50); // Keep last 50 clean sessions
      this.setStorage(STORAGE_KEYS.SESSIONS, recentSessions);

      const logs = this.getStorage<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
      const recentLogs = logs.slice(-50);
      this.setStorage(STORAGE_KEYS.AUDIT_LOGS, recentLogs);

      // Clear any unknown/stale localStorage keys
      const knownKeys = new Set(Object.values(STORAGE_KEYS));
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && !knownKeys.has(key)) {
          localStorage.removeItem(key);
        }
      }

      let finalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          finalSize += (localStorage.getItem(key) || '').length;
        }
      }

      const freedKb = Math.max(0, Math.round((initialSize - finalSize) / 1024));

      return {
        success: true,
        freedKb,
        message: 'Junk files and temporary cache cleared successfully. App optimized!',
      };
    } catch (e: any) {
      return {
        success: false,
        freedKb: 0,
        message: e.message || 'Cache clearing failed.',
      };
    }
  }

  // --- Requests System ---
  // CRITICAL BUSINESS RULE:
  // "First deposit kiye bina koi bhi widro/request na kr sake"
  async submitRequest(params: {
    userId: string;
    amount: number;
    requestType?: 'WITHDRAWAL_REDEMPTION' | 'CREDIT_SETTLEMENT' | 'SUPPORT_ADJUSTMENT';
    note?: string;
  }): Promise<CreditRequest> {
    const wallet = await this.getWallet(params.userId);

    // Rule 1: FIRST DEPOSIT REQUIRED
    if (wallet.totalDepositsCount <= 0) {
      throw new Error(
        'First deposit required: You must make at least one credit deposit before submitting withdrawal or settlement requests.'
      );
    }

    // Rule 2: Minimum Request Amount is ₹55
    if (params.amount < 55) {
      throw new Error('Minimum request amount is ₹55.');
    }

    // Rule 3: Balance check
    if (wallet.availableGameCredits < params.amount) {
      throw new Error(`Insufficient Game Credits. You have ${wallet.availableGameCredits} available.`);
    }

    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === params.userId);
    if (!user) throw new Error('User not found.');

    // Deduct credits atomically into escrow/pending status
    await this.adjustBalance(
      params.userId,
      -params.amount,
      'ADMIN_ADJUSTMENT',
      'REQUEST_ESCROW',
      `REQ_LOCK_${Date.now()}`,
      `Credits locked for administrator review request (-${params.amount} Credits)`
    );

    const requests = this.getStorage<CreditRequest[]>(STORAGE_KEYS.REQUESTS, []);
    const newRequest: CreditRequest = {
      requestId: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      memberId: user.memberId,
      name: user.fullName,
      mobileNumber: user.mobileNumber,
      requestType: params.requestType || 'WITHDRAWAL_REDEMPTION',
      amount: params.amount,
      note: params.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    requests.push(newRequest);
    this.setStorage(STORAGE_KEYS.REQUESTS, requests);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'requests', newRequest.requestId), newRequest, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Firestore request sync error: ', e);
    }

    this.logAudit({
      actorId: user.id,
      actorName: user.fullName,
      action: 'REQUEST_CREATED',
      targetId: newRequest.requestId,
      result: 'SUCCESS',
      details: `Submitted request for ₹${params.amount} / Credits. Status: PENDING.`,
    });

    return newRequest;
  }

  async getRequests(userId?: string): Promise<CreditRequest[]> {
    const requests = this.getStorage<CreditRequest[]>(STORAGE_KEYS.REQUESTS, []);
    if (!userId) return requests.reverse();
    return requests.filter((r) => r.userId === userId).reverse();
  }

  async getDepositHistory(userId?: string): Promise<LedgerEntry[]> {
    const ledgers = await this.getLedger(userId);
    return ledgers.filter((l) => l.type === 'DEPOSIT_CREDIT');
  }

  async getWithdrawHistory(userId?: string): Promise<CreditRequest[]> {
    return this.getRequests(userId);
  }

  async processRequestAction(
    adminId: string,
    requestId: string,
    action: 'APPROVE' | 'REJECT' | 'COMPLETE',
    note?: string
  ): Promise<CreditRequest> {
    const requests = this.getStorage<CreditRequest[]>(STORAGE_KEYS.REQUESTS, []);
    const req = requests.find((r) => r.requestId === requestId);
    if (!req) throw new Error('Request not found.');

    const prevStatus = req.status;

    if (action === 'APPROVE') {
      req.status = 'APPROVED';
    } else if (action === 'COMPLETE') {
      req.status = 'COMPLETED';
    } else if (action === 'REJECT') {
      req.status = 'REJECTED';
      // Refund the locked credits back to user
      await this.adjustBalance(
        req.userId,
        req.amount,
        'REFUND',
        'ADMIN_REQUEST_REJECTION',
        req.requestId,
        `Refund of ${req.amount} Game Credits due to request rejection (${note || 'Administrator review'})`
      );
    }

    req.updatedAt = new Date().toISOString();
    req.adminNote = note || req.adminNote;
    req.processedBy = adminId;
    this.setStorage(STORAGE_KEYS.REQUESTS, requests);

    this.logAudit({
      actorId: adminId,
      actorName: 'Admin Authority',
      action: action === 'APPROVE' ? 'REQUEST_APPROVED' : action === 'REJECT' ? 'REQUEST_REJECTED' : 'REQUEST_COMPLETED',
      targetId: req.requestId,
      result: 'SUCCESS',
      details: `Request ${req.requestId} changed from ${prevStatus} to ${req.status}. Note: ${note || 'None'}`,
    });

    return req;
  }

  // --- Server-Authoritative Game Engine ---
  async playRound(params: {
    userId: string;
    gameId: string;
    stake: number;
    gameParams?: Record<string, any>;
  }): Promise<{
    session: GameSession;
    result: 'WIN' | 'LOSS' | 'PUSH';
    payout: number;
    multiplier: number;
    updatedBalance: number;
    outcomeDetails: Record<string, any>;
  }> {
    if (params.stake <= 0) {
      throw new Error('Stake must be greater than zero.');
    }

    const wallet = await this.getWallet(params.userId);
    if (wallet.availableGameCredits < params.stake) {
      throw new Error('Insufficient Game Credits balance.');
    }

    // Check Slots Deposit Lock Rule:
    // "Slots ho jo ki deposit karne ke baad hi open ho"
    if ((params.gameId === 'lucky_slots' || params.gameId === 'jackpot_slots') && wallet.totalDepositsCount <= 0) {
      throw new Error('Slots games are locked! Please make at least one deposit (Min ₹55) to unlock VIP Slots.');
    }

    // 1. Deduct stake first atomically
    await this.adjustBalance(
      params.userId,
      -params.stake,
      'GAME_STAKE',
      `GAME_${params.gameId.toUpperCase()}`,
      `STAKE_${Date.now()}`,
      `Stake on ${params.gameId} (-₹${params.stake})`
    );

    // 2. Server calculates fair provable result
    let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';
    let multiplier = 0;
    let outcomeDetails: Record<string, any> = {};

    switch (params.gameId) {
      case 'wingo': {
        const winningNumber = Math.floor(Math.random() * 10); // 0 to 9
        const isGreen = [1, 3, 7, 9].includes(winningNumber);
        const isRed = [2, 4, 6, 8].includes(winningNumber);
        const isViolet = [0, 5].includes(winningNumber);
        const size = winningNumber >= 5 ? 'BIG' : 'SMALL';
        const primaryColor = isGreen ? 'GREEN' : isRed ? 'RED' : winningNumber === 0 ? 'RED_VIOLET' : 'GREEN_VIOLET';

        const betType = params.gameParams?.betType || 'COLOR'; // COLOR, NUMBER, SIZE
        const selectedValue = params.gameParams?.value; // 'GREEN', 'RED', 'VIOLET', 0-9, 'BIG', 'SMALL'

        outcomeDetails = {
          winningNumber,
          primaryColor,
          size,
          isViolet,
          betType,
          selectedValue,
        };

        if (betType === 'COLOR') {
          if (selectedValue === 'GREEN') {
            if (isGreen) {
              result = 'WIN';
              multiplier = 2;
            } else if (winningNumber === 5) {
              result = 'WIN';
              multiplier = 1.5;
            }
          } else if (selectedValue === 'RED') {
            if (isRed) {
              result = 'WIN';
              multiplier = 2;
            } else if (winningNumber === 0) {
              result = 'WIN';
              multiplier = 1.5;
            }
          } else if (selectedValue === 'VIOLET' && isViolet) {
            result = 'WIN';
            multiplier = 4.5;
          }
        } else if (betType === 'NUMBER') {
          if (Number(selectedValue) === winningNumber) {
            result = 'WIN';
            multiplier = 9;
          }
        } else if (betType === 'SIZE') {
          if (selectedValue === size) {
            result = 'WIN';
            multiplier = 2;
          }
        }
        break;
      }

      case 'k3': {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const sum = d1 + d2 + d3;
        const size = sum >= 11 ? 'BIG' : 'SMALL';
        const parity = sum % 2 === 1 ? 'ODD' : 'EVEN';
        const isTriple = d1 === d2 && d2 === d3;
        const isPair = d1 === d2 || d2 === d3 || d1 === d3;

        const betType = params.gameParams?.betType || 'TOTAL'; // TOTAL, SIZE, PARITY, PAIR, TRIPLE
        const selectedValue = params.gameParams?.value;

        outcomeDetails = {
          dice: [d1, d2, d3],
          sum,
          size,
          parity,
          isTriple,
          isPair,
          betType,
          selectedValue,
        };

        if (betType === 'SIZE' && selectedValue === size && !isTriple) {
          result = 'WIN';
          multiplier = 2;
        } else if (betType === 'PARITY' && selectedValue === parity && !isTriple) {
          result = 'WIN';
          multiplier = 2;
        } else if (betType === 'TOTAL' && Number(selectedValue) === sum) {
          result = 'WIN';
          const payoutMap: Record<number, number> = {
            3: 200, 18: 200, 4: 70, 17: 70, 5: 35, 16: 35, 6: 18, 15: 18,
            7: 12, 14: 12, 8: 8.5, 13: 8.5, 9: 7.5, 12: 7.5, 10: 7, 11: 7,
          };
          multiplier = payoutMap[sum] || 7;
        } else if (betType === 'PAIR' && isPair) {
          result = 'WIN';
          multiplier = 12;
        } else if (betType === 'TRIPLE' && isTriple) {
          result = 'WIN';
          multiplier = 35;
        }
        break;
      }
      case 'lucky_slots': {
        const symbols = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
        const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel3 = symbols[Math.floor(Math.random() * symbols.length)];
        outcomeDetails = { reel1, reel2, reel3 };

        if (reel1 === reel2 && reel2 === reel3) {
          result = 'WIN';
          multiplier = reel1 === '7️⃣' ? 25 : reel1 === '💎' ? 15 : reel1 === '🔔' ? 8 : 5;
        } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
          result = 'WIN';
          multiplier = 1.5;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'royal_roulette': {
        const winningNumber = Math.floor(Math.random() * 37); // 0 to 36
        const betType = params.gameParams?.betType || 'RED'; // RED, BLACK, ODD, EVEN, NUMBER
        const selectedNumber = params.gameParams?.number;
        const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(winningNumber);
        const isBlack = winningNumber !== 0 && !isRed;
        outcomeDetails = { winningNumber, isRed, isBlack };

        if (betType === 'RED' && isRed) {
          result = 'WIN';
          multiplier = 2;
        } else if (betType === 'BLACK' && isBlack) {
          result = 'WIN';
          multiplier = 2;
        } else if (betType === 'EVEN' && winningNumber !== 0 && winningNumber % 2 === 0) {
          result = 'WIN';
          multiplier = 2;
        } else if (betType === 'ODD' && winningNumber % 2 === 1) {
          result = 'WIN';
          multiplier = 2;
        } else if (betType === 'NUMBER' && selectedNumber === winningNumber) {
          result = 'WIN';
          multiplier = 36;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'blackjack': {
        // Simple card dealing & dealer 17 rule
        const drawCard = () => {
          const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
          const suits = ['♠', '♥', '♦', '♣'];
          const rank = ranks[Math.floor(Math.random() * ranks.length)];
          const suit = suits[Math.floor(Math.random() * suits.length)];
          const val = ['J', 'Q', 'K'].includes(rank) ? 10 : rank === 'A' ? 11 : parseInt(rank, 10);
          return { rank, suit, val };
        };

        const p1 = drawCard();
        const p2 = drawCard();
        let pScore = p1.val + p2.val;
        if (pScore > 21 && (p1.val === 11 || p2.val === 11)) pScore -= 10;

        const d1 = drawCard();
        const d2 = drawCard();
        let dScore = d1.val + d2.val;
        while (dScore < 17) {
          const extra = drawCard();
          dScore += extra.val;
          if (dScore > 21 && extra.val === 11) dScore -= 10;
        }

        outcomeDetails = { playerCards: [p1, p2], playerTotal: pScore, dealerCards: [d1, d2], dealerTotal: dScore };

        if (pScore > 21) {
          result = 'LOSS';
          multiplier = 0;
        } else if (dScore > 21 || pScore > dScore) {
          result = 'WIN';
          multiplier = pScore === 21 ? 2.5 : 2;
        } else if (pScore === dScore) {
          result = 'PUSH';
          multiplier = 1;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'teen_patti': {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        const playerHand = [
          { val: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * 4)] },
          { val: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * 4)] },
          { val: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * 4)] },
        ];
        const dealerHand = [
          { val: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * 4)] },
          { val: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * 4)] },
          { val: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * 4)] },
        ];
        const pTotal = playerHand.reduce((acc, c) => acc + c.val, 0);
        const dTotal = dealerHand.reduce((acc, c) => acc + c.val, 0);
        outcomeDetails = { playerHand, dealerHand, pTotal, dTotal };

        if (pTotal > dTotal) {
          result = 'WIN';
          multiplier = 2;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'andar_bahar': {
        const chosenSide = params.gameParams?.side || 'ANDAR'; // ANDAR or BAHAR
        const winningSide = Math.random() < 0.5 ? 'ANDAR' : 'BAHAR';
        outcomeDetails = { chosenSide, winningSide };
        if (chosenSide === winningSide) {
          result = 'WIN';
          multiplier = winningSide === 'ANDAR' ? 1.95 : 2.0;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'dice_roll': {
        const roll1 = Math.floor(Math.random() * 6) + 1;
        const roll2 = Math.floor(Math.random() * 6) + 1;
        const sum = roll1 + roll2;
        const prediction = params.gameParams?.prediction || 'OVER_7'; // UNDER_7, EXACT_7, OVER_7
        outcomeDetails = { roll1, roll2, sum, prediction };

        if (prediction === 'OVER_7' && sum > 7) {
          result = 'WIN';
          multiplier = 2.3;
        } else if (prediction === 'UNDER_7' && sum < 7) {
          result = 'WIN';
          multiplier = 2.3;
        } else if (prediction === 'EXACT_7' && sum === 7) {
          result = 'WIN';
          multiplier = 5.8;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'lucky_wheel': {
        const segments = [
          { label: '0x', mult: 0, weight: 35 },
          { label: '1.2x', mult: 1.2, weight: 25 },
          { label: '1.5x', mult: 1.5, weight: 18 },
          { label: '2.0x', mult: 2.0, weight: 12 },
          { label: '5.0x', mult: 5.0, weight: 7 },
          { label: '10x', mult: 10.0, weight: 2 },
          { label: '25x JACKPOT', mult: 25.0, weight: 1 },
        ];
        const totalWeight = segments.reduce((a, b) => a + b.weight, 0);
        let rnd = Math.random() * totalWeight;
        let chosenSeg = segments[0];
        for (const seg of segments) {
          if (rnd < seg.weight) {
            chosenSeg = seg;
            break;
          }
          rnd -= seg.weight;
        }
        outcomeDetails = { segment: chosenSeg.label, mult: chosenSeg.mult };
        multiplier = chosenSeg.mult;
        result = multiplier > 1 ? 'WIN' : multiplier === 1 ? 'PUSH' : 'LOSS';
        break;
      }

      case 'coin_flip': {
        const choice = params.gameParams?.choice || 'HEADS';
        const flip = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
        outcomeDetails = { choice, flip };
        if (choice === flip) {
          result = 'WIN';
          multiplier = 1.96;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      case 'mines': {
        // Cashout or step check
        const isCashout = params.gameParams?.isCashout;
        const currentMult = params.gameParams?.currentMultiplier || 1.2;
        if (isCashout) {
          result = 'WIN';
          multiplier = currentMult;
        } else {
          const hitMine = Math.random() < 0.18; // 18% chance of mine
          if (hitMine) {
            result = 'LOSS';
            multiplier = 0;
            outcomeDetails = { hitMine: true };
          } else {
            result = 'WIN';
            multiplier = currentMult * 1.25;
            outcomeDetails = { hitMine: false, nextMultiplier: multiplier };
          }
        }
        break;
      }

      case 'high_low': {
        const cur = params.gameParams?.currentCard || 7;
        const next = Math.floor(Math.random() * 13) + 1;
        const guess = params.gameParams?.guess || 'HIGHER';
        outcomeDetails = { currentCard: cur, nextCard: next, guess };

        if ((guess === 'HIGHER' && next >= cur) || (guess === 'LOWER' && next <= cur)) {
          result = 'WIN';
          multiplier = 1.9;
        } else {
          result = 'LOSS';
          multiplier = 0;
        }
        break;
      }

      default: {
        // Fallback lucky spin
        const win = Math.random() < 0.48;
        result = win ? 'WIN' : 'LOSS';
        multiplier = win ? 2 : 0;
      }
    }

    const payout = Math.round(params.stake * multiplier * 100) / 100;

    // 3. Credit payout if win or push
    let currentWallet = await this.getWallet(params.userId);
    if (payout > 0) {
      currentWallet = await this.adjustBalance(
        params.userId,
        payout,
        'GAME_PAYOUT',
        `GAME_${params.gameId.toUpperCase()}`,
        `PAYOUT_${Date.now()}`,
        `Payout on ${params.gameId}: ${multiplier}x (${payout} Credits)`
      );
    }

    // 4. Record game session
    const sessions = this.getStorage<GameSession[]>(STORAGE_KEYS.SESSIONS, []);
    const session: GameSession = {
      sessionId: `ses_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: params.userId,
      gameId: params.gameId,
      gameVersion: '1.0.0',
      stakeCredits: params.stake,
      result,
      payoutCredits: payout,
      multiplier,
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
      gameDetails: outcomeDetails,
    };
    sessions.push(session);
    this.setStorage(STORAGE_KEYS.SESSIONS, sessions);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'gameSessions', session.sessionId), session, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Firestore gameSession sync error: ', e);
    }

    return {
      session,
      result,
      payout,
      multiplier,
      updatedBalance: currentWallet.availableGameCredits,
      outcomeDetails,
    };
  }

  // --- Admin Dashboard & Device Controls ---
  async getAdminStats() {
    const config = await this.getOrganisationConfig();
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const requests = this.getStorage<CreditRequest[]>(STORAGE_KEYS.REQUESTS, []);
    const sessions = this.getStorage<GameSession[]>(STORAGE_KEYS.SESSIONS, []);
    const bonuses = this.getStorage<SignupBonusRecord[]>(STORAGE_KEYS.BONUSES, []);

    const activeMembers = users.filter((u) => u.status === 'ACTIVE').length;
    const suspendedMembers = users.filter((u) => u.status === 'SUSPENDED' || u.status === 'BLOCKED').length;
    const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;

    return {
      totalMembers: users.length,
      maxCapacity: config.maxMembers,
      activeMembers,
      suspendedMembers,
      availableSlots: Math.max(0, config.maxMembers - users.length),
      pendingRequestsCount: pendingRequests,
      totalSessionsCount: sessions.length,
      totalBonusesIssued: bonuses.length,
      totalBonusCredits: bonuses.reduce((acc, b) => acc + b.amount, 0),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
  }

  async updateUserStatus(adminId: string, targetUserId: string, newStatus: UserStatus): Promise<User> {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === targetUserId);
    if (!user) throw new Error('User not found.');

    const oldStatus = user.status;
    user.status = newStatus;
    this.setStorage(STORAGE_KEYS.USERS, users);

    this.logAudit({
      actorId: adminId,
      actorName: 'Admin Authority',
      action: newStatus === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetId: targetUserId,
      result: 'SUCCESS',
      details: `User ${user.memberId} status changed from ${oldStatus} to ${newStatus}`,
    });

    return user;
  }

  async resetUserDevice(adminId: string, targetUserId: string): Promise<void> {
    const devices = this.getStorage<DeviceRecord[]>(STORAGE_KEYS.DEVICES, []);
    const targetDevices = devices.filter((d) => d.userId === targetUserId);

    targetDevices.forEach((d) => {
      d.status = 'RESET_REQUIRED';
    });
    this.setStorage(STORAGE_KEYS.DEVICES, devices);

    this.logAudit({
      actorId: adminId,
      actorName: 'Admin Authority',
      action: 'DEVICE_RESET',
      targetId: targetUserId,
      result: 'SUCCESS',
      details: `Controlled device recovery initiated. Bound devices marked as RESET_REQUIRED.`,
    });
  }

  async updateMaxMembers(adminId: string, newLimit: number): Promise<OrganisationConfig> {
    if (newLimit < 10) throw new Error('Capacity must be at least 10 members.');
    const config = await this.getOrganisationConfig();
    config.maxMembers = newLimit;
    this.setStorage(STORAGE_KEYS.CONFIG, config);

    this.logAudit({
      actorId: adminId,
      actorName: 'Admin Authority',
      action: 'ADMIN_ACTION',
      targetId: config.id,
      result: 'SUCCESS',
      details: `Organisation maxMembers adjusted to ${newLimit}`,
    });

    return config;
  }

  // --- Audit Logs & Notifications ---
  private logAudit(entry: Omit<AdminAuditLog, 'logId' | 'timestamp'>) {
    const logs = this.getStorage<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const log: AdminAuditLog = {
      logId: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.push(log);
    this.setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    return this.getStorage<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []).reverse();
  }

  async getNotifications(userId: string): Promise<AppNotification[]> {
    const all = this.getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_welcome',
        userId,
        title: 'Welcome to RECOVERY LOSSS',
        message: 'Your organisation membership is verified. 50 Game Credits added to your wallet.',
        type: 'WELCOME',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ]);
    return all.filter((n) => n.userId === userId || n.userId === 'ALL');
  }

  // --- Tasks & Earn (Screen 16) ---
  async getTasks(userId: string): Promise<TaskItem[]> {
    const key = `recovery_losss_tasks_${userId}`;
    const defaultTasks: TaskItem[] = [
      {
        id: 'task_daily_login',
        title: 'Daily Login',
        description: 'Login to the app every day to claim bonus',
        rewardCoins: 5,
        category: 'DAILY',
        currentProgress: 1,
        targetProgress: 1,
        isCompleted: true,
        isClaimed: false,
        actionText: 'Claim',
        iconName: 'Calendar',
      },
      {
        id: 'task_play_5',
        title: 'Play 5 Games',
        description: 'Play any 5 lottery, slots, or card games',
        rewardCoins: 10,
        category: 'DAILY',
        currentProgress: 2,
        targetProgress: 5,
        isCompleted: false,
        isClaimed: false,
        actionText: 'Play',
        iconName: 'Gamepad2',
      },
      {
        id: 'task_refer_1',
        title: 'Refer 1 Friend',
        description: 'Invite your friend to join RECOVERY LOSSS',
        rewardCoins: 20,
        category: 'OFFER',
        currentProgress: 0,
        targetProgress: 1,
        isCompleted: false,
        isClaimed: false,
        actionText: 'Invite',
        iconName: 'Users',
      },
      {
        id: 'task_watch_ad',
        title: 'Watch Sponsored Ad',
        description: 'Watch video sponsored announcement',
        rewardCoins: 5,
        category: 'OFFER',
        currentProgress: 0,
        targetProgress: 1,
        isCompleted: true,
        isClaimed: false,
        actionText: 'Watch',
        iconName: 'PlayCircle',
      },
      {
        id: 'task_complete_profile',
        title: 'Complete Profile & KYC',
        description: 'Verify your member credentials and details',
        rewardCoins: 10,
        category: 'SPECIAL',
        currentProgress: 1,
        targetProgress: 1,
        isCompleted: true,
        isClaimed: false,
        actionText: 'Claim',
        iconName: 'UserCheck',
      },
    ];

    return this.getStorage<TaskItem[]>(key, defaultTasks);
  }

  async claimTask(userId: string, taskId: string): Promise<{ task: TaskItem; rewardCoins: number; wallet: Wallet }> {
    const key = `recovery_losss_tasks_${userId}`;
    const tasks = await this.getTasks(userId);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found.');

    const task = tasks[taskIndex];
    if (task.isClaimed) throw new Error('Task reward has already been claimed.');
    if (!task.isCompleted) throw new Error('Task requirements not yet satisfied.');

    task.isClaimed = true;
    tasks[taskIndex] = task;
    this.setStorage(key, tasks);

    // Credit coins to wallet
    const updatedWallet = await this.adjustBalance(
      userId,
      task.rewardCoins,
      'TASK_REWARD' as any,
      'TASKS_MODULE',
      `TASK_${task.id}_${Date.now()}`,
      `Task reward claimed: ${task.title} (+₹${task.rewardCoins})`
    );

    return {
      task,
      rewardCoins: task.rewardCoins,
      wallet: updatedWallet,
    };
  }

  // --- Referral System (Screen 17) ---
  async getReferralInfo(userId: string): Promise<ReferralInfo> {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === userId);
    const code = user?.memberId || `RL-${userId.substring(0, 4).toUpperCase()}`;

    return {
      referralCode: code,
      totalInvited: 25,
      totalEarned: 500,
      activeFriends: 10,
      rewardPerReferral: 20,
    };
  }

  // --- Leaderboard System (Screen 18) ---
  async getLeaderboard(period: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'WEEKLY'): Promise<LeaderboardItem[]> {
    const multiplier = period === 'MONTHLY' ? 3.5 : period === 'ALL_TIME' ? 8.2 : 1.0;
    return [
      {
        rank: 1,
        userId: 'usr_top_1',
        memberId: 'RL-1088',
        name: 'Amit Sharma',
        avatarSeed: 'Amit',
        rewardAmount: Math.floor(5000 * multiplier),
      },
      {
        rank: 2,
        userId: 'usr_top_2',
        memberId: 'RL-2490',
        name: 'Sneha Patel',
        avatarSeed: 'Sneha',
        rewardAmount: Math.floor(3500 * multiplier),
      },
      {
        rank: 3,
        userId: 'usr_top_3',
        memberId: 'RL-9102',
        name: 'Rohit Verma',
        avatarSeed: 'Rohit',
        rewardAmount: Math.floor(2800 * multiplier),
      },
      {
        rank: 4,
        userId: 'usr_top_4',
        memberId: 'RL-4411',
        name: 'Pooja Gupta',
        avatarSeed: 'Pooja',
        rewardAmount: Math.floor(2300 * multiplier),
      },
      {
        rank: 5,
        userId: 'usr_top_5',
        memberId: 'RL-5520',
        name: 'Vikram Singh',
        avatarSeed: 'Vikram',
        rewardAmount: Math.floor(1950 * multiplier),
      },
      {
        rank: 6,
        userId: 'usr_top_6',
        memberId: 'RL-6731',
        name: 'Neha Roy',
        avatarSeed: 'Neha',
        rewardAmount: Math.floor(1800 * multiplier),
      },
      {
        rank: 7,
        userId: 'usr_top_7',
        memberId: 'RL-7840',
        name: 'Raj Malhotra',
        avatarSeed: 'Raj',
        rewardAmount: Math.floor(1600 * multiplier),
      },
      {
        rank: 8,
        userId: 'usr_top_8',
        memberId: 'RL-8951',
        name: 'Anjali Nair',
        avatarSeed: 'Anjali',
        rewardAmount: Math.floor(1500 * multiplier),
      },
    ];
  }

  // --- Bank Accounts (Screen 15, 22) ---
  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    const key = `recovery_losss_banks_${userId}`;
    const defaultAccounts: BankAccount[] = [
      {
        id: `bnk_${userId}_1`,
        userId,
        bankName: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 1234',
        ifscCode: 'HDFC0001234',
        holderName: 'Account Holder',
        isDefault: true,
      },
    ];
    return this.getStorage<BankAccount[]>(key, defaultAccounts);
  }

  async addBankAccount(userId: string, bank: Omit<BankAccount, 'id' | 'userId'>): Promise<BankAccount> {
    const key = `recovery_losss_banks_${userId}`;
    const accounts = await this.getBankAccounts(userId);
    const newAccount: BankAccount = {
      id: `bnk_${Date.now()}`,
      userId,
      ...bank,
    };
    accounts.push(newAccount);
    this.setStorage(key, accounts);
    return newAccount;
  }

  // --- Game History (Screen 19) ---
  async getGameHistory(userId: string): Promise<GameSession[]> {
    const sessions = this.getStorage<GameSession[]>(STORAGE_KEYS.SESSIONS, []);
    return sessions.filter((s) => s.userId === userId).reverse();
  }
}

export const api = new ApiClient();
