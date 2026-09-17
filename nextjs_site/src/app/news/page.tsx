import fs from 'fs';
import path from 'path';
import NewsClient from './NewsClient';

export default function NewsPage() {
  const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images');
  let files: string[] = [];
  
  try {
    files = fs.readdirSync(imagesDir);
  } catch (error) {
    console.error("Error reading images directory:", error);
  }
  
  // Filter for news images
  const newsFiles = files.filter(f => f.toLowerCase().includes('news') && f.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/));
  
  const newsItems = newsFiles.map(file => {
    let title = file.replace(/\.[^/.]+$/, "");
    let description = "";
    
    // Explicitly set titles based on filename
    if (file.toLowerCase() === 'news.jpg' || file.toLowerCase() === 'news.jpeg' || file.toLowerCase() === 'news.png') {
      title = "Acropolis Institute";
      description = "Inauguration of Central India's first Cyber-Physical Systems Lab at Acropolis Institute, Indore.";
    } else if (file.toLowerCase() === 'news1.jpg' || file.toLowerCase() === 'news1.jpeg' || file.toLowerCase() === 'news1.png') {
      title = "Sardar Vallabhbhai Patel University";
      description = "Three-day training program on Sensors, IoT, and Modern Technologies successfully concluded.";
    } else {
      title = title.replace(/_/g, " ").trim();
      title = title.replace(/([a-z])([A-Z])/g, '$1 $2');
      description = "Latest updates and events from CPS LAB.";
    }
    
    return {
      src: `/assets/images/${file}`,
      title,
      description,
      fileName: file
    };
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-32 pb-24 relative z-30 overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 relative z-30">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[2px] bg-primary"></div>
            <span className="text-primary font-mono text-sm uppercase tracking-widest font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">newspaper</span> News & Events
            </span>
            <div className="w-10 h-[2px] bg-primary"></div>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Latest Updates
          </h1>
          <p className="font-body text-base text-on-surface-variant max-w-2xl">
            Stay up to date with the latest news, events, and announcements from CPS LAB.
          </p>
        </div>

        <NewsClient items={newsItems} />
      </div>
    </div>
  );
}
