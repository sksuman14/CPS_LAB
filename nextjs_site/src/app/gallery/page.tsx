export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import GalleryClient from './GalleryClient';

export default function GalleryPage() {
  const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images');
  let files: string[] = [];
  
  try {
    files = fs.readdirSync(imagesDir);
  } catch (error) {
    console.error("Error reading images directory:", error);
  }
  
  const galleryFiles = files.filter(f => f.toLowerCase().includes('gallery'));
  
  const galleryItems = galleryFiles.map(file => {
    let name = file.replace(/\.[^/.]+$/, "");
    // Remove _Gallery followed by optional numbers and spaces
    name = name.replace(/_?Gallery\s*[0-9]*$/i, "");
    
    let location = name.replace(/_/g, " ").trim();
    
    // Custom name overrides
    if (location.toLowerCase().includes('shivalik')) {
      location = "Shivalik University Dehradun";
    } else if (location.toLowerCase().includes('shoolini')) {
      location = "Shoolini University";
    }
    
    // Add space between lowercase and uppercase (e.g. ChandigarhUniversity -> Chandigarh University)
    location = location.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Add space after an acronym before a capitalized word (e.g. GPCBarnala -> GPC Barnala)
    location = location.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    
    // Safe replacements for "of" and "and" that got merged
    location = location.replace(/Collegeof/gi, 'College of');
    location = location.replace(/Instituteof/gi, 'Institute of');
    location = location.replace(/Universityof/gi, 'University of');
    location = location.replace(/Chamberof/gi, 'Chamber of');
    
    // Fix "of" and "and" attached to next word (e.g. ofEngineering -> of Engineering)
    location = location.replace(/\b(of)([A-Z])/gi, '$1 $2');
    location = location.replace(/\b(and)([A-Z])/gi, '$1 $2');
    location = location.replace(/Technologyand/gi, 'Technology and');

    // Add spaces around ampersand (&)
    location = location.replace(/&/g, ' & ');
    
    // Add space after comma
    location = location.replace(/,/g, ', ');

    // Clean up any double spaces resulting from the above
    location = location.replace(/\s+/g, ' ').trim();
    
    let description = undefined;
    if (location.toLowerCase().includes('iti ropar')) {
      description = "Demonstrating the CPS Lab setup to the Honorable MLA at ITI Ropar.";
    }
    
    return {
      src: `/assets/images/${file}`,
      location,
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
              <span className="material-symbols-outlined">photo_library</span> Gallery
            </span>
            <div className="w-10 h-[2px] bg-primary"></div>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            CPS Labs in Action
          </h1>
          <p className="font-body text-base text-on-surface-variant max-w-2xl">
            Explore the footprint of our Cyber-Physical Systems labs across various schools, colleges, and universities.
          </p>
        </div>

        <GalleryClient items={galleryItems} />
      </div>
    </div>
  );
}
