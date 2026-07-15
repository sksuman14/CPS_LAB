'use client';

import { motion, Variants } from 'framer-motion';
import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission -> open mailto
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`;
    const mailtoLink = `mailto:awadhropar@gmail.com?subject=Website Inquiry&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setTimeout(() => {
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-32 pb-24 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ambient-glow-1 opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header and Banner Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-12">
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
             <div className="w-8 h-[2px] bg-primary"></div>
             <span className="text-primary font-mono text-sm uppercase tracking-widest font-bold">CONTACT</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="font-headline text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Get in Touch
          </motion.h1>
          <motion.div variants={itemVariants} className="bg-surface-container border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <strong className="block mb-1 font-headline not-italic text-white text-lg">Innovation Hub for Automation Technology (AWaDH)</strong>
              <p className="font-body text-on-surface-variant text-sm italic">We're here to collaborate, innovate, and transform ideas into reality.</p>
            </div>
            <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 flex items-center gap-2 whitespace-nowrap">
               <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#b4c5ff]"></div>
               <span className="text-primary text-xs font-mono">Response within 24h</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Two Columns Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Column: Map */}
          <motion.div 
            variants={itemVariants}
            className="w-full h-[500px] lg:h-auto rounded-[24px] overflow-hidden border border-white/5 shadow-2xl relative group bg-[#0e1116] flex flex-col"
          >
             
             {/* Map container takes remaining space */}
             <div className="relative flex-grow w-full h-full">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.409395111054!2d76.4715555!3d30.9683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39055427d2c3aa65%3A0xeab4944fe0101c!2sIndian%20Institute%20of%20Technology%20Ropar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }} 
                 allowFullScreen 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 className="absolute inset-0 grayscale transition-all duration-700 group-hover:grayscale-0"
               ></iframe>
             </div>

             <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-[24px]"></div>
          </motion.div>

          {/* Right Column: Content */}
          <div className="w-full flex flex-col gap-6">
             {/* Address Card */}
             <motion.div variants={itemVariants} className="bg-surface-container rounded-[24px] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                <h2 className="font-headline text-2xl font-bold text-white mb-8 relative z-10">Visit Us</h2>
                
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex gap-4 items-start group/item">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:bg-primary/20 group-hover/item:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    </div>
                    <div>
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Address</h4>
                      <p className="text-white font-body text-sm leading-relaxed">
                        214 / M. Visvesvaraya Block<br />
                        IIT Ropar, Rupnagar<br />
                        Punjab – 140001, India
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start group/item">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:bg-primary/20 group-hover/item:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>phone</span>
                    </div>
                    <div>
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Phone</h4>
                      <p className="text-white font-body text-sm">+91 70870 32853</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <a href="mailto:awadhropar@gmail.com" className="flex gap-3 items-center group/item cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                      <div className="w-2.5 h-2.5 rounded-sm bg-white/30 group-hover/item:bg-primary transition-colors"></div>
                      <span className="text-on-surface-variant text-xs font-medium group-hover/item:text-white truncate">awadhropar@gmail.com</span>
                    </a>
                    <a href="mailto:project.manager@ihub-awadh.in" className="flex gap-3 items-center group/item cursor-pointer bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                      <div className="w-2.5 h-2.5 rounded-sm bg-white/30 group-hover/item:bg-primary transition-colors"></div>
                      <span className="text-on-surface-variant text-xs font-medium group-hover/item:text-white truncate">project.manager@ihub-awadh...</span>
                    </a>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <a href="https://www.iitrpr.ac.in/awadh" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all">
                      <span className="material-symbols-outlined text-sm text-white group-hover:text-primary">language</span>
                    </a>
                    <a href="https://www.linkedin.com/company/ihub-awadh/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/50 transition-all">
                      <span className="text-white text-xs font-bold">in</span>
                    </a>
                  </div>
                </div>
             </motion.div>

             {/* Contact Form */}
             <motion.div variants={itemVariants} className="bg-surface-container rounded-[24px] p-8 md:p-10 border border-white/5 shadow-2xl relative">
               <h2 className="font-headline text-2xl font-bold text-white mb-2">Send us a message</h2>
               <p className="text-sm text-on-surface-variant mb-6">Fill in the form and our team will get back to you within a day.</p>
               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                 <div>
                   <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Your Name *</label>
                   <input 
                     type="text" 
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
                     placeholder="John Doe"
                   />
                 </div>
                 <div>
                   <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Email Address *</label>
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
                     placeholder="john@example.com"
                   />
                 </div>
                 <div>
                   <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Your Message *</label>
                   <textarea 
                     required
                     rows={3}
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors resize-none"
                     placeholder="How can we help you?"
                   ></textarea>
                 </div>
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-primary text-[#0f172a] font-headline font-bold text-base py-3 rounded-xl mt-2 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(180,197,255,0.4)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                 >
                   {isSubmitting ? 'Sending...' : 'Send Message'}
                   {!isSubmitting && <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>}
                 </button>
               </form>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
