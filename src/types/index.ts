export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export type DeviceStatus = 'ACTIVE' | 'BLOCKED' | 'RESET_REQUIRED';

export interface User {
  id: string;
  memberId: string; // e.g. RL-8842
  fullName: string;
  mobileNumber: string;
  role: UserRole;
  status: UserStatus;
  primaryDeviceId: string;
  registeredAt: string;
  lastLoginAt: string;
  avatarSeed?: string;
}

export interface DeviceRecord {
  deviceId: string;
  userId: string;
  registeredAt: string;
  lastSeen: string;
  status: DeviceStatus;
  platform: 'web-pwa' | 'android-webview' | 'android-native';
  appVersion: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Wallet {
  userId: string;
  availableGameCredits: number;
  bonusCredits: number;
  totalDepositsCount: number; // Mandatory for "First deposit kiye bina koi bhi widro/request na kr sake"
  totalDepositedAmount: number;
  updatedAt: string;
}

export type LedgerType =
  | 'SIGNUP_BONUS'
  | 'GAME_STAKE'
  | 'GAME_PAYOUT'
  | 'PROMOTIONAL_CREDIT'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT'
  | 'DEPOSIT_CREDIT';

export type LedgerStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';

export interface LedgerEntry {
  ledgerId: string;
  userId: string;
  type: LedgerType;
  amount: number;
  previousBalance: number;
  newBalance: number;
  referenceId: string;
  source: string;
  createdAt: string;
  status: LedgerStatus;
  description: string;
}

export interface SignupBonusRecord {
  bonusId: string;
  userId: string;
  bonusType: 'SIGNUP_BONUS';
  amount: number; // 50 Game Credits
  unit: 'GAME_CREDITS';
  status: 'ISSUED' | 'CLAIMED';
  createdAt: string;
  referenceId: string;
  idempotencyKey: string; // SIGNUP_BONUS_{userId}
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface CreditRequest {
  requestId: string;
  userId: string;
  memberId: string;
  name: string;
  mobileNumber: string;
  requestType: 'WITHDRAWAL_REDEMPTION' | 'CREDIT_SETTLEMENT' | 'SUPPORT_ADJUSTMENT';
  amount: number; // Min ₹55
  note?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  processedBy?: string;
}

export type GameCategory =
  | 'ALL'
  | 'LOTTERY'
  | 'SLOTS'
  | 'CARDS'
  | 'DICE'
  | 'WHEEL'
  | 'ARCADE'
  | 'LUCKY GAMES';

export interface GameDefinition {
  id: string;
  name: string;
  category: GameCategory;
  shortDescription: string;
  minCredits: number; // In Rupees (₹)
  maxCredits: number;
  isPopular?: boolean;
  isNew?: boolean;
  requiresDeposit?: boolean; // Slots unlock after deposit
  iconName: string;
  accentColor: string;
}

export interface GameSession {
  sessionId: string;
  userId: string;
  gameId: string;
  gameVersion: string;
  stakeCredits: number;
  result: 'WIN' | 'LOSS' | 'PUSH';
  payoutCredits: number;
  multiplier: number;
  createdAt: string;
  status: 'COMPLETED' | 'ACTIVE';
  gameDetails?: Record<string, any>;
}

export interface PaymentOrder {
  orderId: string;
  userId: string;
  amountInInr: number; // Min ₹55
  creditsToAward: number;
  currency: 'INR';
  status: 'CREATED' | 'ATTEMPTED' | 'PAID' | 'FAILED';
  createdAt: string;
  gateway: 'MOCK_SANDBOX' | 'RAZORPAY';
  receipt: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId?: string;
  signature?: string;
  creditsAdded: number;
  newBalance: number;
  message: string;
}

export interface AdminAuditLog {
  logId: string;
  actorId: string;
  actorName: string;
  action:
    | 'LOGIN'
    | 'SIGNUP'
    | 'DEVICE_REGISTERED'
    | 'DEVICE_RESET'
    | 'BONUS_ISSUED'
    | 'GAME_STARTED'
    | 'GAME_COMPLETED'
    | 'REQUEST_CREATED'
    | 'REQUEST_APPROVED'
    | 'REQUEST_REJECTED'
    | 'REQUEST_COMPLETED'
    | 'USER_SUSPENDED'
    | 'USER_REACTIVATED'
    | 'PAYMENT_VERIFIED'
    | 'REFUND_PROCESSED'
    | 'ADMIN_ACTION';
  targetId: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILED' | 'FLAGGED';
  details?: string;
}

export interface OrganisationConfig {
  id: string;
  name: string;
  maxMembers: number; // Default 500
  currentMembers: number;
  activeMembers: number;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  minDepositInr: number; // 55
  minRequestInr: number; // 55
  signupBonusCredits: number; // 50
  invitationCodes: Array<{
    code: string;
    isActive: boolean;
    maxUses: number;
    usedCount: number;
    description: string;
  }>;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'WELCOME'
    | 'SIGNUP_BONUS'
    | 'REQUEST_STATUS'
    | 'SECURITY_ALERT'
    | 'LOGIN'
    | 'ANNOUNCEMENT'
    | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  category: 'DAILY' | 'OFFER' | 'SPECIAL';
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionText: string;
  iconName: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  holderName: string;
  isDefault: boolean;
}

export interface LeaderboardItem {
  rank: number;
  userId: string;
  memberId: string;
  name: string;
  avatarSeed: string;
  rewardAmount: number;
  isCurrentUser?: boolean;
}

export interface ReferralInfo {
  referralCode: string;
  totalInvited: number;
  totalEarned: number;
  activeFriends: number;
  rewardPerReferral: number;
}

