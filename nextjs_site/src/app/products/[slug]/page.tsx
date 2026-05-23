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
  const { user } = useAuth();
  const [requestStatus, setRequestStatus] = useState<AccessRequest | null>(null);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [show3D, setShow3D] = useState(false);

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

      if (user && datasheetKey) {
        try {
          // fetch all requests for this email to find pending/status
          const requests = await fetchAllRequests(user.attributes.email);
          // CRITICAL FIX: Ensure request belongs to the current user
          const existing = requests.find(r => r.documentName === datasheetKey && r.userEmail === user.attributes.email);
          if (existing) setRequestStatus(existing);

          // fetch user-specific access list
          const access = await fetchUserAccess(user.userId);
          setUserAccess(access);

          // Debug Logging
          console.log("Access Check Debug:", {
            userId: user.userId,
            userEmail: user.attributes.email,
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
  }, [user, datasheetKey]);

  const handleRequest = async () => {
    if (!user?.attributes?.email || !datasheetKey) return;
    setIsLoading(true);
    try {
      const result = await requestDocumentAccess(
        user.attributes.email,
        user.username || user.attributes.email.split('@')[0],
        datasheetKey
      );
      if (result.success) {
        setRequestStatus({
          id: 'temp',
          userEmail: user.attributes.email,
          userName: user.username || user.attributes.email.split('@')[0],
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
  const handleDirectDownload = async (url: string, filenameSuffix: string) => {
    const filename = `${sensor.datasheetKey}_${filenameSuffix.replace(/\s+/g, '_')}`;
    await downloadFileFromUrl(url, filename);
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

  const renderActionButtons = () => {
    const fileConfig = sensor.datasheetKey ? SENSOR_FILES[sensor.datasheetKey] : null;
    
    // Lists of buttons to render
    const publicButtons = [];
    const protectedButtons = [];

    // 1. PUBLIC DOCUMENTS (Datasheet & Manuals)
    if (fileConfig) {
      // 0. ENQUIRE BUTTON
      publicButtons.push(
        <button 
          key="enquire"
          onClick={handleEnquire}
          className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform">mail</span>
          Enquire
        </button>
      );
      if (fileConfig.datasheet) {
        publicButtons.push(
          <button 
            key="datasheet"
            onClick={() => handleView('datasheet')}
            className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition-all border border-white/10 flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">description</span>
            Datasheet
          </button>
        );
      }

      const manualTypes = ['manual', 'quec_manual', 'nrf_manual'];
      manualTypes.forEach(type => {
        if (fileConfig[type]) {
          const label = type === 'manual' ? 'nRF Manual' : type === 'quec_manual' ? 'Quec Manual' : 'UI Manual';
          publicButtons.push(
            <button 
              key={type}
              onClick={() => handleView(type)}
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition-all border border-white/10 flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined text-accent group-hover:scale-110 transition-transform">menu_book</span>
              {label}
            </button>
          );
        }
      });

      // 1.5 EXPERIMENTS
      const fileConfigExpKey = fileConfig.experiments ? 'experiments' : fileConfig.student_doc ? 'student_doc' : null;
      const directExpLink = (sensor as any).experimentsLink || (sensor as any).experiments;

      if (fileConfigExpKey || directExpLink) {
        publicButtons.push(
          <button 
            key="experiments"
            onClick={() => {
              if (fileConfigExpKey) handleView(fileConfigExpKey);
              else window.open(directExpLink, '_blank');
            }}
            className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition-all border border-white/10 flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">science</span>
            Experiments
          </button>
        );
      }
    }

    // 2. PROTECTED CODE (Requires Request Access)
    const codeLinks = [
      { key: 'nreCodeLink', label: 'nRF Code' },
      { key: 'quecCodeLink', label: 'Quec Code' },
      { key: 'nrfUICodeLink', label: 'nRF UI Code' },
      { key: 'nrfCodeLink', label: 'nRF Code' } // some use different naming
    ];

    const availableCode = codeLinks.filter(cl => (sensor as any)[cl.key]);

    if (availableCode.length > 0) {
      if (isChecking) {
        protectedButtons.push(
          <div key="checking" className="bg-surface-container py-4 px-8 rounded-full border border-white/5 opacity-50 flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin">refresh</span>
            Checking Code Access...
          </div>
        );
      } else if (!user) {
        protectedButtons.push(
          <Link key="login" href="/login" className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2">
            <span className="material-symbols-outlined">lock</span>
            Sign in for Code Access
          </Link>
        );
      } else if (userAccess.includes(datasheetKey) || requestStatus?.status === 'GRANTED') {
        availableCode.forEach(cl => {
          protectedButtons.push(
            <button 
              key={cl.key}
              onClick={() => handleDirectDownload((sensor as any)[cl.key], cl.label)} 
              className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">code</span>
              {cl.label}
            </button>
          );
        });
      } else if (requestStatus?.status === 'PENDING') {
        protectedButtons.push(
          <button key="pending" className="bg-yellow-500/20 text-yellow-500 font-bold py-4 px-8 rounded-full flex items-center gap-2 border border-yellow-500/30 cursor-default">
            <span className="material-symbols-outlined animate-pulse">pending</span>
            Access Request Pending
          </button>
        );
      } else {
        protectedButtons.push(
          <button 
            key="request"
            onClick={handleRequest}
            disabled={isLoading}
            className="bg-primary hover:bg-primary-light text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">{isLoading ? 'sync' : 'verified_user'}</span>
            {isLoading ? 'Submitting...' : 'Request Code Access'}
          </button>
        );
      }
    }

    return (
      <div className="flex flex-col gap-6 w-full">
        {publicButtons.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {publicButtons}
          </div>
        )}
        {protectedButtons.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {protectedButtons}
          </div>
        )}
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
        <Link href="/products" className="inline-flex items-center text-on-surface-variant hover:text-white transition-colors mb-12 font-label text-sm uppercase tracking-widest gap-2 group">
          <span className="material-symbols-outlined transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Products
        </Link>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-start mb-24">
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative group min-h-[700px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
            
            {((sensor as any).modelPath || sensor.imagePath.toLowerCase().endsWith('.glb') || sensor.imagePath.toLowerCase().endsWith('.gltf')) && show3D ? (
              <div className="absolute inset-0 z-10">   
                <ModelViewer modelPath={(sensor as any).modelPath || sensor.imagePath} autoRotate={true} />
              </div>
            ) : (
              <>
                <img 
                  src={`/${sensor.imagePath}`} 
                  alt={productDisplayName}
                  className="w-full h-auto object-contain max-h-[500px] transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* 3D Overlay Button if modelPath exists */}
                {((sensor as any).modelPath || sensor.imagePath.toLowerCase().endsWith('.glb')) && !show3D && (
                  <button 
                    onClick={() => setShow3D(true)}
                    className="absolute inset-0 m-auto w-40 h-16 bg-surface-container/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 transition-all group/btn z-20"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">3d_rotation</span>
                    </div>
                    <span className="font-label font-bold text-white uppercase tracking-wider text-sm pr-2">View 3D</span>
                  </button>
                )}
              </>
            )}
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tighter">
              {sensor.title} <span className="text-primary">{sensor.highlightText}</span>
            </h1>
            <h2 className="font-body text-xl md:text-2xl text-on-surface-variant font-medium mb-10 leading-relaxed">
              {sensor.subtitle}
            </h2>
            
            <div className="flex flex-col gap-4 mb-10">
              {sensor.bannerPoints.map((point: string, i: number) => (
                <div key={i} className="flex items-start gap-4 bg-surface-container py-3 px-5 rounded-2xl border border-white/5 hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body text-white/90">{point}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {renderActionButtons()}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Features */}
          <div className="bg-surface-container rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-colors group">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300">
               <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">star</span>
             </div>
             <h3 className="font-headline text-2xl font-bold text-white mb-6 tracking-tight">Key Features</h3>
             <ul className="flex flex-col gap-4">
               {sensor.features.map((feature: string, i: number) => (
                 <li key={i} className="flex gap-3 text-on-surface-variant font-body">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2.5"></span>
                   <span>{feature}</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* Applications */}
          <div className="bg-surface-container rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-colors group">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300">
               <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">build</span>
             </div>
             <h3 className="font-headline text-2xl font-bold text-white mb-6 tracking-tight">Applications</h3>
             <ul className="flex flex-col gap-4">
               {sensor.applications.map((app: string, i: number) => (
                 <li key={i} className="flex gap-3 text-on-surface-variant font-body">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2.5"></span>
                   <span>{app}</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* Specifications */}
          <div className="bg-surface-container rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-colors group">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300">
               <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">analytics</span>
             </div>
             <h3 className="font-headline text-2xl font-bold text-white mb-6 tracking-tight">Specifications</h3>
             <ul className="flex flex-col gap-4">
               {sensor.specifications.map((spec: string, i: number) => (
                 <li key={i} className="flex gap-3 text-on-surface-variant font-body">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2.5"></span>
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