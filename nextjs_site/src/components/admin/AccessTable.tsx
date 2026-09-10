
'use client';

import { AccessRequest, RequestStatus } from '@/types/admin';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldOff, Clock } from 'lucide-react';

interface AccessTableProps {
  requests: AccessRequest[];
  onAction: (id: string, newStatus: RequestStatus) => void;
  isLoading: boolean;
}

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: Clock },
  GRANTED: { label: 'Granted', color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: Check },
  REVOKED: { label: 'Revoked', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: ShieldOff },
  REJECTED: { label: 'Rejected', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', icon: X },
};

export default function AccessTable({ requests, onAction, isLoading }: AccessTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-surface-container/50 rounded-3xl animate-pulse">
        <span className="material-symbols-outlined text-3xl text-primary mb-4 animate-[spin_3s_linear_infinite]">sync</span>
        <p className="font-label text-white/50 text-xs tracking-widest uppercase font-bold">Fetching Access Logs</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-surface-container/30 border border-white/5 rounded-3xl text-center p-8">
        <span className="material-symbols-outlined text-5xl text-white/10 mb-6 drop-shadow-lg">inventory_2</span>
        <h3 className="font-headline text-xl font-bold text-white mb-2">No matching requests found</h3>
        <p className="font-body text-on-surface-variant max-w-sm">Try adjusting your filters or search query to see other entries.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-black">User Details</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-black">Document</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-black">Status</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-black">Request Date</th>
              <th className="px-8 py-6 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            <AnimatePresence mode="popLayout">
              {requests.map((request) => {
                const config = statusConfig[request.status];
                const StatusIcon = config.icon;

                return (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{request.userName}</span>
                        <span className="font-body text-xs text-on-surface-variant">{request.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-body text-white font-medium bg-white/5 py-1 px-3 rounded-lg border border-white/5">{request.documentName}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                        {StatusIcon && <span className="w-3 h-3 flex items-center justify-center"><StatusIcon size={12} /></span>}
                        {config.label}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-[10px] text-on-surface-variant/80">
                        {request.requestDate && !isNaN(new Date(request.requestDate).getTime())
                          ? new Date(request.requestDate).toLocaleString()
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {request.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => onAction(request.id, 'GRANTED')}
                              title="Approve Access"
                              className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/40 transition-all flex items-center justify-center hover:scale-110"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => onAction(request.id, 'REJECTED')}
                              title="Reject Access"
                              className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 hover:bg-red-500/40 transition-all flex items-center justify-center hover:scale-110"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onAction(request.id, request.status === 'REVOKED' || request.status === 'REJECTED' ? 'GRANTED' : 'REVOKED')}
                            title={request.status === 'REVOKED' || request.status === 'REJECTED' ? "Re-grant Access" : "Revoke Access"}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${request.status === 'GRANTED'
                              ? 'bg-red-500/20 text-red-500 border border-red-500/20 hover:bg-red-500/40'
                              : 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/40'
                              }`}
                          >
                            {request.status === 'GRANTED' ? <ShieldOff className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
