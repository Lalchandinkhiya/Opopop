import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User,
  CreditRequest,
  AdminAuditLog,
  OrganisationConfig,
} from '../../types';
import {
  ShieldAlert,
  Users,
  FileText,
  Key,
  History,
  Smartphone,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Lock,
  RefreshCw,
  Gift,
  ArrowRight,
  Sliders,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { audio } from '../../services/audioService';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [adminTab, setAdminTab] = useState<
    'OVERVIEW' | 'USERS' | 'REQUESTS' | 'BONUSES' | 'DEVICES' | 'AUDIT' | 'SETTINGS'
  >('OVERVIEW');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [requestsList, setRequestsList] = useState<CreditRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [orgConfig, setOrgConfig] = useState<OrganisationConfig | null>(null);

  const [requestFilter, setRequestFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('PENDING');
  const [userSearch, setUserSearch] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [newCapacity, setNewCapacity] = useState<number>(500);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshAdminData = async () => {
    try {
      const [s, u, r, a, c] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers(),
        api.getRequests(),
        api.getAuditLogs(),
        api.getOrganisationConfig(),
      ]);
      setStats(s);
      setUsersList(u);
      setRequestsList(r);
      setAuditLogs(a);
      setOrgConfig(c);
      setNewCapacity(c.maxMembers);
    } catch (e) {
      console.error('Admin data refresh failed', e);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const handleRequestAction = async (
    requestId: string,
    action: 'APPROVE' | 'REJECT' | 'COMPLETE'
  ) => {
    if (!user) return;
    try {
      await api.processRequestAction(user.id, requestId, action, reviewNote);
      audio.playWin();
      setActionMessage(`Request ${action.toLowerCase()}d successfully.`);
      setErrorMessage(null);
      setReviewNote('');
      refreshAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      audio.playLoss();
      setErrorMessage(err.message || 'Action failed');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    if (!user) return;
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUserStatus(user.id, targetUser.id, nextStatus);
      audio.playClick();
      setActionMessage(`Member ${targetUser.memberId} is now ${nextStatus}.`);
      setErrorMessage(null);
      refreshAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage(e.message || 'Status update failed');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleResetDevice = async (targetUser: User) => {
    if (!user) return;
    try {
      await api.resetUserDevice(user.id, targetUser.id);
      audio.playClick();
      setActionMessage(`Device association reset for ${targetUser.memberId}. Member can now bind a new device.`);
      setErrorMessage(null);
      refreshAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage(e.message || 'Device reset failed');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleUpdateCapacity = async () => {
    if (!user) return;
    try {
      await api.updateMaxMembers(user.id, Number(newCapacity));
      audio.playWin();
      setActionMessage(`Organisation maximum capacity updated to ${newCapacity} members.`);
      setErrorMessage(null);
      refreshAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to update capacity');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.memberId.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.mobileNumber.includes(userSearch)
  );

  const filteredRequests = requestsList.filter((r) => r.status === requestFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-3 pb-24 space-y-6 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#1E2336] via-[#141724] to-[#0A0D15] border border-[#D4AF37]/35 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#F5C542]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-display font-black text-white uppercase tracking-wider">
              ADMIN CONTROL AUTHORITY
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Organisation Syndicate Management Console · Super Admin Role
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM NOMINAL</span>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              refreshAdminData();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Refresh Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Dashboard', icon: Sliders },
          { id: 'USERS', label: 'Users', icon: Users },
          { id: 'REQUESTS', label: 'Requests', icon: FileText },
          { id: 'BONUSES', label: 'Bonuses', icon: Gift },
          { id: 'DEVICES', label: 'Devices', icon: Smartphone },
          { id: 'AUDIT', label: 'Audit Logs', icon: History },
          { id: 'SETTINGS', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                audio.playClick();
                setAdminTab(tab.id as any);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#141724] text-[#9CA3AF] hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {adminTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#141724] border border-[#D4AF37]/25">
              <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold block">
                TOTAL MEMBERS
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-white">
                  {stats?.totalMembers ?? 347}
                </span>
                <span className="text-xs text-[#9CA3AF] font-mono">
                  / {orgConfig?.maxMembers ?? 500}
                </span>
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                {stats?.availableSlots ?? 153} slots available
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141724] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold block">
                ACTIVE MEMBERS
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                {stats?.activeMembers ?? 342}
              </span>
              <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">
                Suspended: {stats?.suspendedMembers ?? 5}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141724] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold block">
                PENDING REQUESTS
              </span>
              <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                {stats?.pendingRequestsCount ?? 0}
              </span>
              <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">
                Awaiting approval
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141724] border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold block">
                SIGNUP BONUSES
              </span>
              <span className="text-2xl font-black font-mono text-[#F5C542] mt-1 block">
                {stats?.totalBonusesIssued ?? 347}
              </span>
              <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">
                {stats?.totalBonusCredits ?? 17350} Credits granted
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#131622] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F5C542]" />
                Recent Pending Requests
              </h4>
              {requestsList.filter((r) => r.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-[#9CA3AF]">No requests currently pending review.</p>
              ) : (
                <div className="space-y-2">
                  {requestsList
                    .filter((r) => r.status === 'PENDING')
                    .slice(0, 3)
                    .map((r) => (
                      <div
                        key={r.requestId}
                        className="p-3 rounded-xl bg-[#181B2A] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{r.name}</span>
                          <span className="text-[10px] text-[#9CA3AF] font-mono ml-2">
                            ({r.memberId})
                          </span>
                          <p className="text-[10px] text-[#9CA3AF]">
                            ₹{r.amount.toLocaleString()} · {new Date(r.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAdminTab('REQUESTS');
                            setRequestFilter('PENDING');
                          }}
                          className="px-2.5 py-1 rounded-lg gold-gradient-btn text-[11px] font-bold"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#131622] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-400" />
                Latest Audit Trail
              </h4>
              <div className="space-y-2">
                {auditLogs.slice(0, 3).map((log) => (
                  <div
                    key={log.logId}
                    className="p-2.5 rounded-xl bg-[#181B2A] text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5C542] text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-[#9CA3AF] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#D1D5DB] truncate">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {adminTab === 'USERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Organisation Roster ({filteredUsers.length} Members)
            </h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, member ID, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full h-9 px-3 pl-8 rounded-xl bg-[#141724] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#12141F] border border-white/5 overflow-hidden divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.01]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{u.fullName}</span>
                    <span className="text-xs font-mono font-bold text-[#F5C542] px-2 py-0.5 rounded-full bg-[#1A1E2E]">
                      {u.memberId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9CA3AF] mt-1 font-mono">
                    <span>Mobile: {u.mobileNumber}</span>
                    <span>·</span>
                    <span>Device: {u.primaryDeviceId.slice(0, 14)}...</span>
                    <span>·</span>
                    <span>Joined: {new Date(u.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleUserStatus(u)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      u.status === 'ACTIVE'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => handleResetDevice(u)}
                    className="px-3 py-1.5 rounded-xl bg-[#1D2132] border border-white/10 hover:border-[#D4AF37] text-white text-xs font-semibold"
                    title="Allow member to bind a new physical phone"
                  >
                    Reset Device
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REQUESTS REVIEW */}
      {adminTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Settlement & Redemption Requests
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#141724] p-1 rounded-xl border border-white/5">
              {(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    audio.playClick();
                    setRequestFilter(st);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    requestFilter === st
                      ? 'bg-[#D4AF37] text-black shadow-sm'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#12141F] border border-white/5 text-xs text-[#9CA3AF]">
              No {requestFilter.toLowerCase()} requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((r) => (
                <div
                  key={r.requestId}
                  className="p-5 rounded-2xl bg-[#131622] border border-[#D4AF37]/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black font-mono text-white">
                          ₹{r.amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#F5C542] font-semibold uppercase">
                          ({r.amount} Game Credits)
                        </span>
                      </div>
                      <p className="text-xs text-[#D1D5DB] mt-0.5">
                        Member: <strong className="text-white">{r.name}</strong> · ID:{' '}
                        <strong className="text-[#F5C542] font-mono">{r.memberId}</strong> · Tel: {r.mobileNumber}
                      </p>
                    </div>

                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {r.note && (
                    <div className="p-2.5 rounded-xl bg-[#181B2A] text-xs text-[#D1D5DB]">
                      <strong>User Remark:</strong> "{r.note}"
                    </div>
                  )}

                  {/* Actions (If Pending) */}
                  {r.status === 'PENDING' && (
                    <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Admin note for audit trail..."
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full sm:w-72 h-9 px-3 rounded-xl bg-[#181B2A] border border-white/10 text-xs text-white"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRequestAction(r.requestId, 'APPROVE')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(r.requestId, 'REJECT')}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject & Refund
                        </button>
                      </div>
                    </div>
                  )}

                  {r.status === 'APPROVED' && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-blue-300">
                        Approved by {r.processedBy || 'Admin'}. Ready for offline settlement.
                      </span>
                      <button
                        onClick={() => handleRequestAction(r.requestId, 'COMPLETE')}
                        className="px-3 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold"
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BONUSES STATISTICS */}
      {adminTab === 'BONUSES' && (
        <div className="p-6 rounded-3xl bg-[#131622] border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#F5C542]" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Signup Bonus Statistics (50 Credits Guarantee)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#171B28] border border-white/5">
              <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">
                Total Bonuses Issued
              </span>
              <span className="text-2xl font-black font-mono text-[#F5C542] mt-1 block">
                {stats?.totalBonusesIssued ?? 347}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#171B28] border border-white/5">
              <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">
                Credits Disbursed
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {(stats?.totalBonusesIssued ?? 347) * 50} Credits
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#171B28] border border-white/5">
              <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">
                Duplicate Attempts Prevented
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                0 Duplicates
              </span>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">Enforced via SIGNUP_BONUS_{'{userId}'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {adminTab === 'AUDIT' && (
        <div className="space-y-4">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
            Immutable Administrative Audit Trail
          </h3>

          <div className="rounded-2xl bg-[#12141F] border border-white/5 overflow-hidden divide-y divide-white/5">
            {auditLogs.map((log) => (
              <div key={log.logId} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#F5C542]">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                      {log.result}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#D1D5DB]">{log.details}</p>
                <div className="text-[10px] text-[#6B7280] font-mono">
                  Actor: {log.actorName} · Target: {log.targetId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS & CAPACITY */}
      {adminTab === 'SETTINGS' && (
        <div className="p-6 rounded-3xl bg-[#131622] border border-[#D4AF37]/25 space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F5C542]" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Organisation Configuration
            </h3>
          </div>

          {/* Capacity Setting */}
          <div className="p-4 rounded-2xl bg-[#171B28] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Maximum Authorised Members Capacity
                </h4>
                <p className="text-xs text-[#9CA3AF]">
                  Default 500 members limit. When reached, public registration automatically locks.
                </p>
              </div>
              <span className="text-lg font-mono font-bold text-[#F5C542]">
                {orgConfig?.maxMembers} Max
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="number"
                min={10}
                max={5000}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-36 h-10 px-3 rounded-xl bg-[#12141F] border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={handleUpdateCapacity}
                className="h-10 px-4 rounded-xl gold-gradient-btn text-xs font-bold cursor-pointer shadow-md"
              >
                Update Capacity
              </button>
            </div>
          </div>

          {/* Invitation Codes */}
          <div className="p-4 rounded-2xl bg-[#171B28] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-[#F5C542]" />
              Active Invitation Codes
            </h4>
            <div className="divide-y divide-white/5 rounded-xl bg-[#12141F] border border-white/5 overflow-hidden">
              {orgConfig?.invitationCodes.map((code) => (
                <div key={code.code} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#F5C542]">{code.code}</span>
                    <p className="text-[10px] text-[#9CA3AF]">{code.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white text-xs">
                      {code.usedCount} / {code.maxUses} Used
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance & System Junk Cleaner */}
          <div className="p-4 rounded-2xl bg-[#171B28] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-emerald-400" />
                  System Cache & Junk Cleaner (सिस्टम सफ़ाई)
                </h4>
                <p className="text-xs text-[#9CA3AF]">
                  Purges obsolete logs, cleans orphaned test caches, and optimizes storage.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                audio.playClick();
                const res = await api.clearJunkAndCache();
                audio.playWin();
                setActionMessage(`System Cleaned: Freed ${res.freedKb} KB of cached junk.`);
                refreshAdminData();
                setTimeout(() => setActionMessage(null), 3000);
              }}
              className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear System Junk & Cache Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
