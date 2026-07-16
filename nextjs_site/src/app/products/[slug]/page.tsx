'use client';

import { allSensors } from '@/data/products';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { fetchAllRequests, requestDocumentAccess, fetchUserAccess } from '@/lib/api/admin';
import { downloadDocument, downloadFileFromUrl } from '@/lib/api/download';
import { SENSOR_FILES } from '@/data/downloads';
import { AccessRequest } from '@/types/admin';
import ModelViewer from '@/components/ModelViewer';

export default function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const { user, googleUser } = useAuth();
  const [requestStatus, setRequestStatus] = useState<AccessRequest | null>(null);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const sensor = allSensors.find((s) => {
    const fullTitle = `${s.title.trim()} ${s.highlightText.trim()}`.replace(/\s+/g, ' ');
    const productSlug = fullTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return productSlug === params.slug;
  });

  const productDisplayName = sensor ? `${sensor.title.trim()} ${sensor.highlightText.trim()}`.replace(/\s+/g, ' ') : '';
  const datasheetKey = sensor?.datasheetKey || '';

  useEffect(() => {
    async function checkExistingRequest() {
      // Reset state on user change or product change
      setRequestStatus(null);
      setUserAccess([]);
      setIsChecking(true);

      const currentUserEmail = user?.attributes?.email || googleUser?.email;
      const currentUserId = user?.userId || googleUser?.email;

      if (currentUserEmail && datasheetKey) {
        try {
          // fetch all requests for this email to find pending/status
          const requests = await fetchAllRequests(currentUserEmail);
          // CRITICAL FIX: Ensure request belongs to the current user
          const existing = requests.find(r => r.documentName === datasheetKey && r.userEmail === currentUserEmail);
          if (existing) setRequestStatus(existing);

          // fetch user-specific access list
          const access = await fetchUserAccess(currentUserId as string);
          setUserAccess(access);

          // Debug Logging
          console.log("Access Check Debug:", {
            userId: currentUserId,
            userEmail: currentUserEmail,
            datasheetKey: datasheetKey,
            requestStatus: existing?.status,
            userAccessList: access,
            hasAccess: access.includes(datasheetKey) || existing?.status === 'GRANTED'
          });
        } catch (err) {
          console.error(err);
        }
      }
      setIsChecking(false);
    }
    checkExistingRequest();
  }, [user, googleUser, datasheetKey]);

  const handleRequest = async () => {
    const currentUserEmail = user?.attributes?.email || googleUser?.email;
    const currentUserName = user?.username || user?.attributes?.email?.split('@')[0] || googleUser?.name || googleUser?.email?.split('@')[0] || 'User';

    if (!currentUserEmail || !datasheetKey) return;
    setIsLoading(true);
    try {
      const result = await requestDocumentAccess(
        currentUserEmail,
        currentUserName,
        datasheetKey
      );
      if (result.success) {
        setRequestStatus({
          id: 'temp',
          userEmail: currentUserEmail,
          userName: currentUserName,
          documentName: datasheetKey,
          status: 'PENDING',
          requestDate: new Date().toISOString(),
        });
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!sensor) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center flex-col gap-6 relative">
         <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-50"></div>
        </div>
        <h1 className="text-4xl text-white font-headline font-bold relative z-10">Product not found</h1>
        <Link href="/products" className="text-primary hover:text-white transition-colors relative z-10">
          ← Back to Products
        </Link>
      </div>
    );
  }

  // Open PDF/Files in browser for public documents
  const handleView = async (type: string = 'datasheet') => {
    if (sensor.datasheetKey) {
      const filePath = SENSOR_FILES[sensor.datasheetKey]?.[type];
      if (!filePath) {
        alert('Document link not available.');
        return;
      }
      
      const normalizedPath = filePath.startsWith('http') ? filePath : (filePath.startsWith('/') ? filePath : `/${filePath}`);
      
      // If it's a remote PDF, fetch it as a blob and open as an object URL 
      // to bypass server-side "download" headers (Content-Disposition: attachment)
      if (normalizedPath.toLowerCase().endsWith('.pdf') && normalizedPath.startsWith('http')) {
        try {
          const response = await fetch(normalizedPath);
          if (response.ok) {
            const blob = await response.blob();
            // Create a Blob URL with explicit PDF type to force in-browser previewing
            const previewUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(previewUrl, '_blank');
            return;
          }
        } catch (error) {
          console.warn("Failed to fetch as blob, falling back to direct open:", error);
        }
      }

      window.open(normalizedPath, '_blank');
    }
  };

  // Force download for protected code files
  const handleDirectDownload = async (url: string, filenameSuffix: string, key: string) => {
    setDownloadingKey(key);
    try {
      const filename = `${sensor.datasheetKey}_${filenameSuffix.replace(/\s+/g, '_')}`;
      await downloadFileFromUrl(url, filename);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleEnquire = () => {
    const recipient = (sensor as any).email || 'Vikash.hardwareengineer@ihub-awadh.in';
    const subject = "Product Enquiry";
    const body = `Hello, I am interested in your ${productDisplayName} product.`;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    }
  };

  const findIPRating = () => {
    const ipPattern = /IP\d{2}/i;
    const allTexts = [...(sensor?.features || []), ...(sensor?.specifications || [])];
    for (const f of allTexts) {
      const match = f.match(ipPattern);
      if (match) return `${match[0]} Rated`;
    }
    return "IP54 Rated"; // fallback
  };

  const findMaterial = () => {
    const materialPattern = /(ABS|Polycarbonate|Aluminium|Metal|Stainless Steel|Silicon|Glass)/i;
    const allTexts = [...(sensor?.features || []), ...(sensor?.specifications || [])];
    for (const f of allTexts) {
      const match = f.match(materialPattern);
      if (match) return `${match[0]} Body`;
    }
    return "ABS Body"; // fallback
  };

  const renderActionButtons = () => {
    const fileConfig = sensor.datasheetKey ? SENSOR_FILES[sensor.datasheetKey] : null;
    
    // 1. Enquire Button
    const enquireButton = (
      <button 
        key="enquire"
        onClick={handleEnquire}
        className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-headline font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-blue-500/10 active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-white text-xl">mail</span>
        Enquire Now
      </button>
    );

    // 2. Document Buttons (Datasheet & Manuals)
    const docButtons = [];
    if (fileConfig) {
      if (fileConfig.datasheet) {
        docButtons.push(
          <button 
            key="datasheet"
            onClick={() => handleView('datasheet')}
            className="flex-grow bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-body text-xs font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-lg">description</span>
            Datasheet
          </button>
        );
      }

      const manualTypes = ['manual', 'quec_manual', 'nrf_manual'];
      manualTypes.forEach(type => {
        if (fileConfig[type]) {
          const label = type === 'manual' ? 'nRF Manual' : type === 'quec_manual' ? 'Quec Manual' : 'UI Manual';
          docButtons.push(
            <button 
              key={type}
              onClick={() => handleView(type)}
              className="flex-grow bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-body text-xs font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-accent text-lg">menu_book</span>
              {label}
            </button>
          );
        }
      });
    }

    // 3. Experiments Button
    let experimentsButton = null;
    if (fileConfig) {
      const fileConfigExpKey = fileConfig.experiments ? 'experiments' : fileConfig.student_doc ? 'student_doc' : null;
      const directExpLink = (sensor as any).experimentsLink || (sensor as any).experiments;

      if (fileConfigExpKey || directExpLink) {
        experimentsButton = (
          <button 
            key="experiments"
            onClick={() => {
              if (fileConfigExpKey) handleView(fileConfigExpKey);
              else window.open(directExpLink, '_blank');
            }}
            className="w-full bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-headline font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">edit</span>
            View Experiments
          </button>
        );
      }
    }

    // 4. Code Access Button
    const codeLinks = [
      { key: 'nreCodeLink', label: 'nRF Code' },
      { key: 'quecCodeLink', label: 'Quec Code' },
      { key: 'nrfUICodeLink', label: 'nRF UI Code' },
      { key: 'nrfCodeLink', label: 'nRF Code' }
    ];

    const availableCode = codeLinks.filter(cl => (sensor as any)[cl.key]);
    let codeAccessButton = null;

    if (availableCode.length > 0) {
      if (isChecking) {
        codeAccessButton = (
          <div className="w-full bg-purple-500/5 py-3.5 rounded-2xl border border-purple-500/10 opacity-50 flex items-center justify-center gap-3 text-purple-600 dark:text-purple-400 text-sm font-bold">
            <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
            Checking Code Access...
          </div>
        );
      } else if (!user && !googleUser) {
        codeAccessButton = (
          <Link href="/login" className="w-full bg-purple-500/5 dark:bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 dark:border-purple-500/20 hover:border-purple-500/50 text-purple-600 dark:text-purple-400 font-headline font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300">
            <span className="material-symbols-outlined text-lg">lock</span>
            Sign in for Code Access
          </Link>
        );
      } else if (userAccess.includes(datasheetKey) || requestStatus?.status === 'GRANTED') {
        codeAccessButton = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {availableCode.map(cl => (
              <button 
                key={cl.key}
                onClick={() => handleDirectDownload((sensor as any)[cl.key], cl.label, cl.key)} 
                disabled={downloadingKey === cl.key}
                className={`bg-purple-500/5 dark:bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 dark:border-purple-500/20 hover:border-purple-500/50 text-purple-600 dark:text-purple-400 font-headline font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 ${downloadingKey === cl.key ? 'cursor-wait' : ''}`}
              >
                <span className={`material-symbols-outlined text-lg ${downloadingKey === cl.key ? 'animate-spin' : ''}`}>
                  {downloadingKey === cl.key ? 'sync' : 'code'}
                </span>
                {downloadingKey === cl.key ? 'Downloading...' : cl.label}
              </button>
            ))}
          </div>
        );
      } else if (requestStatus?.status === 'PENDING') {
        codeAccessButton = (
          <button className="w-full bg-yellow-500/15 text-yellow-500 font-headline font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-yellow-500/20 cursor-default">
            <span className="material-symbols-outlined animate-pulse text-lg">pending</span>
            Access Request Pending
          </button>
        );
      } else {
        codeAccessButton = (
          <button 
            onClick={handleRequest}
            disabled={isLoading}
            className={`bg-purple-500/5 dark:bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 dark:border-purple-500/20 hover:border-purple-500/50 text-purple-600 dark:text-purple-400 font-headline font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50`}
          >
            <span className="material-symbols-outlined text-lg">{isLoading ? 'sync' : 'verified_user'}</span>
            {isLoading ? 'Submitting...' : 'Request Code Access'}
          </button>
        );
      }
    }

    return (
      <div className="flex flex-col gap-4 w-full">
        {enquireButton}
        {docButtons.length > 0 && (
          <div className="flex flex-wrap gap-3 w-full">
            {docButtons}
          </div>
        )}
        {experimentsButton}
        {codeAccessButton}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-32 pb-24 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] ambient-glow-1 opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <Link href="/products" className="inline-flex items-center text-on-surface-variant hover:text-white transition-colors mb-12 font-label text-xs uppercase tracking-widest gap-2 group">
          <span className="material-symbols-outlined transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Products
        </Link>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-start mb-24">
          {/* Left Column: Image/3D Viewer */}
          <div className="w-full lg:w-1/2 bg-[#f8fafc] dark:bg-[#0B0F19] border border-slate-200/80 dark:border-white/10 rounded-3xl min-h-[550px] lg:min-h-[600px] flex items-center justify-center relative overflow-hidden shadow-2xl group">
            {/* Grid background pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(var(--grid-dot-color) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}></div>
            
            {/* Ambient glow */}
            <div className="absolute w-[85%] h-[85%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            {/* Badges removed */}

            {/* Model / Image Rendering */}
            {((sensor as any).modelPath || sensor.imagePath.toLowerCase().endsWith('.glb') || sensor.imagePath.toLowerCase().endsWith('.gltf')) && show3D ? (
              <div className="absolute inset-0 z-10">   
                <ModelViewer modelPath={(sensor as any).modelPath || sensor.imagePath} autoRotate={true} />
              </div>
            ) : (
              <>
                <img 
                  src={`/${sensor.imagePath}`} 
                  alt={productDisplayName}
                  className="w-[70%] h-auto object-contain max-h-[450px] transform group-hover:scale-105 transition-transform duration-700 relative z-10"
                />
                
                {/* 3D Overlay Button */}
                {((sensor as any).modelPath || sensor.imagePath.toLowerCase().endsWith('.glb')) && !show3D && (
                  <button 
                    onClick={() => setShow3D(true)}
                    className="absolute inset-0 m-auto w-40 h-16 bg-[#0F172A]/90 backdrop-blur-md border border-slate-500/30 rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 transition-all group/btn z-20"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-100 text-xl">3d_rotation</span>
                    </div>
                    <span className="font-label font-bold text-slate-100 uppercase tracking-wider text-sm pr-2">View 3D</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            <span className="text-[#10b981] font-label font-bold text-xs uppercase tracking-widest mb-3 block">
              SENSOR PRODUCT
            </span>
            <h1 className="font-headline text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tighter">
              {sensor.title} <span className="text-primary">{sensor.highlightText}</span>
            </h1>
            <p className="font-body text-lg text-on-surface-variant/80 mb-8 font-medium">
              {sensor.subtitle}
            </p>

            {/* Checkmark Pills */}
            <div className="flex flex-col gap-4 mb-8 w-full">
              {sensor.bannerPoints.map((point: string, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-[#f8fafc] dark:bg-[#0B0F19] border border-slate-200/80 dark:border-white/5 py-4 px-6 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300">
                  <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-xl shrink-0 font-bold">check</span>
                  <p className="font-body text-sm text-on-surface-variant/90 font-semibold">{point}</p>
                </div>
              ))}
            </div>

            {/* Buttons Group */}
            <div className="w-full">
              {renderActionButtons()}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {/* Features */}
          <div className="bg-[#f8fafc] dark:bg-[#0B0F19] rounded-3xl p-8 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 group flex flex-col shadow-lg">
             <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-500 dark:text-amber-400">
               <span className="material-symbols-outlined text-2xl">star</span>
             </div>
             <h3 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Key Features</h3>
             <ul className="flex flex-col gap-4">
               {sensor.features.map((feature: string, i: number) => (
                 <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant/80 font-body leading-relaxed">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0 mt-2"></span>
                   <span>{feature}</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* Applications */}
          <div className="bg-[#f8fafc] dark:bg-[#0B0F19] rounded-3xl p-8 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 group flex flex-col shadow-lg">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 dark:text-indigo-400">
               <span className="material-symbols-outlined text-2xl">build</span>
             </div>
             <h3 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Applications</h3>
             <ul className="flex flex-col gap-4">
               {sensor.applications.map((app: string, i: number) => (
                 <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant/80 font-body leading-relaxed">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 mt-2"></span>
                   <span>{app}</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* Specifications */}
          <div className="bg-[#f8fafc] dark:bg-[#0B0F19] rounded-3xl p-8 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 group flex flex-col shadow-lg">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 dark:text-emerald-400">
               <span className="material-symbols-outlined text-2xl">analytics</span>
             </div>
             <h3 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Specifications</h3>
             <ul className="flex flex-col gap-4">
               {sensor.specifications.map((spec: string, i: number) => (
                 <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant/80 font-body leading-relaxed">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 mt-2"></span>
                   <span>{spec}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}