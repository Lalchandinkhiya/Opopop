/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { SplashScreen } from './components/auth/SplashScreen';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { HomeView } from './components/home/HomeView';
import { GameLobby } from './components/games/GameLobby';
import { TasksView } from './components/tasks/TasksView';
import { WalletView } from './components/wallet/WalletView';
import { WithdrawView } from './components/wallet/WithdrawView';
import { AddMoneyView } from './components/wallet/AddMoneyView';
import { ReferView } from './components/refer/ReferView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { GameHistoryView } from './components/games/GameHistoryView';
import { TransactionHistoryView } from './components/wallet/TransactionHistoryView';
import { SettingsView } from './components/profile/SettingsView';
import { HelpSupportView } from './components/profile/HelpSupportView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RequestsView } from './components/requests/RequestsView';
import { LedgerHistory } from './components/wallet/LedgerHistory';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { BrandLogo } from './components/common/BrandLogo';

const MainAppContent: React.FC = () => {
  const {
    user,
    isLoading,
    activeTab,
    setActiveTab,
    showAddCreditsModal,
    setShowAddCreditsModal,
    showWelcomeModal,
    setShowWelcomeModal,
    quickGuestLogin,
  } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);

  useEffect(() => {
    // Check if onboarding was completed before
    const hasSeenOnboarding = localStorage.getItem('recovery_losss_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleFinishOnboarding = () => {
    localStorage.setItem('recovery_losss_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090C] text-[#F3F4F6]">
        <div className="animate-pulse mb-4">
          <BrandLogo size="lg" />
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mb-2" />
        <span className="text-xs uppercase tracking-widest text-[#9CA3AF] font-mono">
          Authorising Secure Environment...
        </span>
      </div>
    );
  }

  // Unauthenticated: Show Casino Welcome Splash & Invite Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] relative overflow-hidden flex flex-col justify-center">
        <SplashScreen
          onLogin={() => setShowLoginModal(true)}
          onSignup={() => setShowSignupModal(true)}
          onQuickGuest={quickGuestLogin}
          onAdminLogin={() => setShowLoginModal(true)}
        />

        <OnboardingModal
          isOpen={showOnboarding}
          onFinish={handleFinishOnboarding}
        />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />

        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      </div>
    );
  }

  // Authenticated Member Interface
  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] relative flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      {/* Top Application Bar */}
      <TopHeader onOpenNotifications={() => setShowNotificationsDrawer(true)} />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'HOME' && <HomeView />}
        {activeTab === 'GAMES' && <GameLobby />}
        {activeTab === 'TASKS' && <TasksView />}
        {activeTab === 'WALLET' && <WalletView />}
        {activeTab === 'PROFILE' && <ProfileView />}

        {/* Sub-screens from references */}
        {activeTab === 'WITHDRAW' && <WithdrawView onBack={() => setActiveTab('WALLET')} />}
        {activeTab === 'REFER' && <ReferView onBack={() => setActiveTab('HOME')} />}
        {activeTab === 'LEADERBOARD' && <LeaderboardView onBack={() => setActiveTab('HOME')} />}
        {activeTab === 'GAME_HISTORY' && <GameHistoryView onBack={() => setActiveTab('WALLET')} />}
        {activeTab === 'TXN_HISTORY' && <TransactionHistoryView onBack={() => setActiveTab('WALLET')} />}
        {activeTab === 'SETTINGS' && <SettingsView onBack={() => setActiveTab('PROFILE')} />}
        {activeTab === 'HELP' && <HelpSupportView onBack={() => setActiveTab('PROFILE')} />}
        {activeTab === 'ADMIN' && <AdminDashboard />}
        {activeTab === 'REQUESTS' && <RequestsView />}
        {activeTab === 'HISTORY' && <LedgerHistory />}
      </main>

      {/* Fixed Bottom Navigation (5 tabs) */}
      <BottomNav />

      {/* Global Add Money / Razorpay Drawer Modal */}
      {showAddCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-md my-auto">
            <AddMoneyView
              onBack={() => setShowAddCreditsModal(false)}
              onSuccess={() => setShowAddCreditsModal(false)}
            />
          </div>
        </div>
      )}

      {showWelcomeModal && (
        <WelcomeScreen
          memberId={user.memberId}
          onStartPlaying={() => setShowWelcomeModal(false)}
        />
      )}

      <NotificationsDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
