
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  Plus,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

// Types & API
import { AccessRequest, RequestStatus, AdminStats } from '@/types/admin';
import { fetchAllRequests, updateRequestStatus, manualGrantAccess } from '@/lib/api/admin';

// Components
import StatsCard from '@/components/admin/StatsCard';
import AdminSearchBar from '@/components/admin/AdminSearchBar';
import StatusFilter, { FilterStatus } from '@/components/admin/StatusFilter';
import AccessTable from '@/components/admin/AccessTable';
import GrantAccessDialog from '@/components/admin/GrantAccessDialog';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to fetch requests. Please check your network connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered requests based on search and status, with PENDING sorted to the top
  const filteredRequests = useMemo(() => {
    const statusOrder: Record<string, number> = {
      'PENDING': 0,
      'GRANTED': 1,
      'REJECTED': 2,
      'REVOKED': 3,
    };

    return requests
      .filter((req) => {
        const matchesSearch = 
          req.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.documentName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));
  }, [requests, searchQuery, statusFilter]);

  // Statistics calculation
  const stats: AdminStats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      granted: requests.filter(r => r.status === 'GRANTED').length,
      revoked: requests.filter(r => r.status === 'REVOKED' || r.status === 'REJECTED').length,
    };
  }, [requests]);

  // Handlers
  const handleAction = async (requestId: string, newStatus: RequestStatus) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Validation
    if (newStatus === 'REVOKED' && request.status !== 'GRANTED' && request.status !== 'PENDING') {
      return;
    }

    try {
      const result = await updateRequestStatus(request.userEmail, request.documentName, newStatus, request.status);
      if (result.success) {
        await loadData(); // Reload to get updated state
      } else {
        alert('Action failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  const handleManualGrant = async (email: string, doc: string) => {
    try {
      const result = await manualGrantAccess(email, doc);
      if (result.success) {
        await loadData();
      } else {
        alert('Failed to grant access. This user may not exist.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while granting access.');
      throw err;
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-surface text-on-surface pb-24 relative overflow-hidden">
        {/* Ambient Glow background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-20"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] ambient-glow-1 opacity-20"></div>
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link href="/" className="inline-flex items-center text-on-surface-variant hover:text-white transition-colors mb-6 font-label text-[10px] uppercase tracking-widest gap-2 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Link>
              <h1 className="font-headline text-4xl font-black text-white leading-tight mb-2 tracking-tighter shadow-sm uppercase">
                Admin <span className="text-primary">Control</span>
              </h1>
              <p className="font-body text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Request Access Management System (RAMS) v2.0
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <button 
                onClick={loadData}
                disabled={isLoading}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-on-surface-variant hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50 group active:scale-95"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="font-headline font-bold text-xs hidden sm:inline uppercase tracking-widest">Manual Refresh</span>
              </button>
              <button 
                onClick={() => setIsGrantDialogOpen(true)}
                className="p-4 px-6 bg-primary hover:bg-primary-light text-white rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="font-headline font-black text-xs uppercase tracking-widest">Grant New Access</span>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatsCard label="Total Requests" value={stats.total} icon={Users} color="bg-blue-500" />
            <StatsCard label="Pending Approval" value={stats.pending} icon={Clock} color="bg-yellow-500" />
            <StatsCard label="Active Access" value={stats.granted} icon={CheckCircle2} color="bg-green-500" />
            <StatsCard label="Revoked/Denied" value={stats.revoked} icon={ShieldAlert} color="bg-red-500" />
          </section>

          {/* Filters and Search */}
          <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-surface-container/30 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
            <AdminSearchBar query={searchQuery} onSearch={setSearchQuery} />
            <StatusFilter currentFilter={statusFilter} onFilterChange={setStatusFilter} />
          </section>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-4 text-red-500 relative overflow-hidden group">
                  <ShieldAlert className="w-6 h-6 flex-shrink-0 animate-pulse" />
                  <div className="flex-grow">
                    <h4 className="font-headline font-black text-xs uppercase mb-1">Synchronisation Error</h4>
                    <p className="font-body text-xs opacity-90">{error}</p>
                  </div>
                  <button onClick={loadData} className="px-5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all font-headline font-bold text-[10px] uppercase">Retry</button>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Section */}
          <section className="relative">
            <AccessTable 
              requests={filteredRequests} 
              onAction={handleAction} 
              isLoading={isLoading} 
            />
            
            <div className="mt-8 flex items-center justify-center">
              <p className="text-on-surface-variant font-body text-[10px] opacity-50 uppercase tracking-widest text-center">
                Showing {filteredRequests.length} of {requests.length} total interactions recorded
              </p>
            </div>
          </section>
        </main>

        {/* Manual Grant Dialog */}
        <GrantAccessDialog 
          isOpen={isGrantDialogOpen} 
          onClose={() => setIsGrantDialogOpen(false)} 
          onGrant={handleManualGrant}
        />
      </div>
    </ProtectedRoute>
  );
}
