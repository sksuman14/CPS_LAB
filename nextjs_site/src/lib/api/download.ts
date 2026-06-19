import { SENSOR_FILES } from '@/data/downloads';

declare module 'jszip';
import JSZip from 'jszip';

async function fetchGithubDir(owner: string, repo: string, branch: string, path: string, zip: JSZip, folderPath: string = '') {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch github contents for ${path}: ${response.statusText}`);
  }
  const contents = await response.json();
  
  const promises = contents.map(async (item: any) => {
    if (item.type === 'file' && item.download_url) {
      const fileRes = await fetch(item.download_url);
      if (!fileRes.ok) throw new Error(`Failed to fetch file: ${item.name}`);
      const arrayBuffer = await fileRes.arrayBuffer();
      zip.file(folderPath + item.name, arrayBuffer);
    } else if (item.type === 'dir') {
      zip.folder(folderPath + item.name);
      await fetchGithubDir(owner, repo, branch, item.path, zip, folderPath + item.name + '/');
    }
  });
  
  await Promise.all(promises);
}

/**
 * Generic function to download a file from a URL using fetch and blob.
 * Works for both local and remote (if CORS is supported) URLs.
 * Falls back to window.open if fetch fails.
 */
export async function downloadFileFromUrl(url: string, filename: string) {
  // Special handling for GitHub links
  if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
    
    // Pattern for GitHub tree URLs (directories)
    const githubTreeRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.*)/;
    const treeMatch = url.match(githubTreeRegex);
    
    if (treeMatch) {
      const [_, owner, repo, branch, path] = treeMatch;
      
      try {
        const zip = new JSZip();
        await fetchGithubDir(owner, repo, branch, path, zip, '');
        const blob = await zip.generateAsync({ type: 'blob' });
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        // Append .zip if not present
        const downloadName = filename.endsWith('.zip') ? filename : `${filename}.zip`;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return { success: true };
      } catch (err) {
        console.error('Failed to download github directory zip:', err);
        return { success: false, message: 'Failed to download directory' };
      }
    }

    // Pattern for GitHub blob URLs (single files)
    const githubBlobRegex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.*)/;
    const blobMatch = url.match(githubBlobRegex);
    
    if (blobMatch) {
      const [_, user, repo, branch, path] = blobMatch;
      url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    } else {
       // If it's the root of a repo (no tree/blob)
       const repoMatch = url.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
       if (repoMatch) {
          const [_, user, repo] = repoMatch;
          url = `https://github.com/${user}/${repo}/archive/refs/heads/main.zip`; // fallback
       }
    }
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: Use a hidden anchor tag
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: false, message: 'Initiated fallback download.' };
  }
}

export async function downloadDocument(sensorKey: string, fileType: string = 'datasheet') {
  const filePath = SENSOR_FILES[sensorKey]?.[fileType];

  if (!filePath) {
    console.error(`Document not found for ${sensorKey} [${fileType}]`);
    return { success: false, message: 'Document link not available.' };
  }

  const filename = `${sensorKey}_${fileType}.pdf`;

  if (filePath.startsWith('http')) {
    return await downloadFileFromUrl(filePath, filename);
  } else {
    // For local assets
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return await downloadFileFromUrl(normalizedPath, filename);
  }
}