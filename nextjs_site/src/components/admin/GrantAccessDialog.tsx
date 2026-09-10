'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, FileText, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { allSensors } from '@/data/products';

interface GrantAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGrant: (email: string, documentName: string) => Promise<void>;
}

export default function GrantAccessDialog({ isOpen, onClose, onGrant }: GrantAccessDialogProps) {
  const [email, setEmail] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isGrantEverything = 
    documentName.toUpperCase().includes('ALL') || 
    documentName.toLowerCase().includes('everything');

  const handleGrantEverything = () => {
    setDocumentName('ALL (Grant Access to Everything)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onGrant(email, documentName);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        setDocumentName('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentSuggestions = Array.from(
    new Set(allSensors.map(s => s.datasheetKey).filter(Boolean))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-lg bg-surface-container rounded-[32px] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {isSuccess ? (
              <div className="p-12 text-center flex flex-col items-center gap-6">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-400"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <h2 className="text-2xl font-headline font-bold text-white">Access Granted!</h2>
                <p className="text-on-surface-variant font-body">
                  {isGrantEverything 
                    ? 'Access to ALL sensors and codes has been granted successfully.' 
                    : 'Notification has been sent to the user.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-headline font-bold text-white">Grant New Access</h2>
                      <p className="text-xs text-on-surface-variant font-body">Grant individual or full system access</p>
                    </div>
                  </div>
                  <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-white transition-all">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-8 space-y-6">
                  {/* User Email Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant ml-1">User Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors cursor-pointer" size={18} />
                      <input 
                        type="email" 
                        required 
                        placeholder="e.g. user@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-body focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  </div>
                  
                  {/* Document Name / ID Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant ml-1">Document Name / ID</label>
                      <button
                        type="button"
                        onClick={handleGrantEverything}
                        className="text-[10px] font-headline font-bold uppercase tracking-wider text-primary hover:text-white bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1"
                      >
                        <Zap size={12} className="fill-primary" />
                        Grant Access to Everything
                      </button>
                    </div>
                    
                    <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors cursor-pointer" size={18} />
                      <input 
                        type="text" 
                        required 
                        list="document-suggestions"
                        placeholder="e.g. ALL (Grant Access to Everything) or Gateway"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-white font-body focus:outline-none transition-all placeholder:text-on-surface-variant/40 ${
                          isGrantEverything ? 'border-primary bg-primary/10 font-bold' : 'border-white/10 focus:border-primary'
                        }`}
                      />
                      <datalist id="document-suggestions">
                        <option value="ALL (Grant Access to Everything)" />
                        {documentSuggestions.map(key => (
                          <option key={key} value={key} />
                        ))}
                      </datalist>
                    </div>

                    {/* Preset buttons */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] text-on-surface-variant/60 font-label uppercase">Quick Select:</span>
                      <button
                        type="button"
                        onClick={handleGrantEverything}
                        className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border transition-all flex items-center gap-1 ${
                          isGrantEverything 
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/30' 
                            : 'bg-white/5 text-primary border-primary/20 hover:bg-primary/10'
                        }`}
                      >
                        <Zap size={10} />
                        ALL (Everything)
                      </button>
                      {documentSuggestions.slice(0, 3).map(key => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDocumentName(key)}
                          className="text-[10px] text-on-surface-variant bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 transition-all"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Everything Granted Banner */}
                  {isGrantEverything && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-start gap-3 text-primary text-xs"
                    >
                      <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-headline font-bold text-white mb-0.5">Full System Access Selected</p>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          This will grant this user access to <strong className="text-primary">ALL sensors, products, datasheets, and source codes</strong> simultaneously.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="p-8 bg-black/20 flex gap-4">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-grow font-headline font-bold py-4 rounded-2xl border border-white/10 text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-grow bg-primary hover:bg-primary-light text-white font-headline font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Processing...' : isGrantEverything ? 'Grant Access to Everything' : 'Grant Access'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
