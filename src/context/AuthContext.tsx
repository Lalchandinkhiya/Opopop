import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Wallet, AppNotification } from '../types';
import { api } from '../services/api';
import { audio } from '../services/audioService';
import { testFirestoreConnection, auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

export type AppTab =
  | 'HOME'
  | 'GAMES'
  | 'TASKS'
  | 'WALLET'
  | 'PROFILE'
  | 'ADMIN'
  | 'REQUESTS'
  | 'HISTORY'
  | 'WITHDRAW'
  | 'REFER'
  | 'LEADERBOARD'
  | 'GAME_HISTORY'
  | 'TXN_HISTORY'
  | 'SETTINGS'
  | 'HELP';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  isLoading: boolean;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  activeGameId: string | null;
  setActiveGameId: (gameId: string | null) => void;
  showAddCreditsModal: boolean;
  setShowAddCreditsModal: (show: boolean) => void;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  notifications: AppNotification[];
  isMuted: boolean;
  toggleMute: () => void;
  login: (identifier: string, pass: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  quickGuestLogin: () => Promise<User>;
  signup: (params: {
    fullName: string;
    memberId?: string;
    mobileNumber: string;
    password: string;
    invitationCode?: string;
  }) => Promise<{ user: User; bonusCredits: number; message: string }>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<Wallet | null>;
  firstDepositAlert: boolean;
  setFirstDepositAlert: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(audio.getMuted());
  const [firstDepositAlert, setFirstDepositAlert] = useState<boolean>(false);

  const refreshWallet = async () => {
    if (!user) return null;
    try {
      const w = await api.getWallet(user.id);
      setWallet(w);
      return w;
    } catch (e) {
      console.error('Failed to load wallet', e);
      return null;
    }
  };

  const loadNotifications = async (userId: string) => {
    try {
      const list = await api.getNotifications(userId);
      setNotifications(list);
    } catch {}
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Validate Firestore connectivity per Skill requirements
        await testFirestoreConnection();

        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const w = await api.getWallet(currentUser.id);
          setWallet(w);
          loadNotifications(currentUser.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const u = await api.login(identifier, pass);
    setUser(u);
    const w = await api.getWallet(u.id);
    setWallet(w);
    loadNotifications(u.id);
    audio.playWin();
    return u;
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const cleanMemberId = `RL-${fbUser.uid.substring(0, 4).toUpperCase()}`;
      const signedUser = await api.signup({
        fullName: fbUser.displayName || 'Google Member',
        memberId: cleanMemberId,
        mobileNumber: fbUser.phoneNumber || `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        password: fbUser.uid,
        invitationCode: 'VIP-RECOVERY-2026',
      });
      setUser(signedUser.user);
      const w = await api.getWallet(signedUser.user.id);
      setWallet(w);
      setShowWelcomeModal(true);
      audio.playJackpot();
      return signedUser.user;
    } catch (e: any) {
      console.error('Google Sign-in error: ', e);
      throw new Error(e.message || 'Firebase Google Sign-in could not be completed');
    }
  };

  const quickGuestLogin = async () => {
    const res = await api.createInstantGuest();
    setUser(res.user);
    const w = await api.getWallet(res.user.id);
    setWallet(w);
    setShowWelcomeModal(true);
    loadNotifications(res.user.id);
    audio.playJackpot();
    return res.user;
  };

  const signup = async (params: {
    fullName: string;
    memberId?: string;
    mobileNumber: string;
    password: string;
    invitationCode?: string;
  }) => {
    const res = await api.signup(params);
    setUser(res.user);
    const w = await api.getWallet(res.user.id);
    setWallet(w);
    setShowWelcomeModal(true);
    loadNotifications(res.user.id);
    audio.playJackpot();
    return res;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setWallet(null);
    setActiveTab('HOME');
    setActiveGameId(null);
    audio.playClick();
  };

  const toggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        isLoading,
        activeTab,
        setActiveTab,
        activeGameId,
        setActiveGameId,
        showAddCreditsModal,
        setShowAddCreditsModal,
        showWelcomeModal,
        setShowWelcomeModal,
        notifications,
        isMuted,
        toggleMute,
        login,
        loginWithGoogle,
        quickGuestLogin,
        signup,
        logout,
        refreshWallet,
        firstDepositAlert,
        setFirstDepositAlert,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
