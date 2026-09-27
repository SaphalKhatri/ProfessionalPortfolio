import { MemoryItem } from '../types/portfolio';

/**
 * Utility to seamlessly parse Google Drive URLs or IDs into high-speed embeddable image URLs.
 * Works with:
 * 1. Full Drive view links: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * 2. Short links: https://drive.google.com/open?id=FILE_ID
 * 3. Direct IDs: "1vABC123xyz..."
 * 4. Regular image URLs: Unsplash, Cloudinary, local paths, etc.
 */
export function resolveDriveImageUrl(input: string): string {
  if (!input) return '';

  const trimmed = input.trim();

  // If already a direct lh3 or thumbnail URL
  if (trimmed.includes('lh3.googleusercontent.com') || trimmed.includes('drive.google.com/thumbnail')) {
    return trimmed;
  }

  // Check for drive.google.com/file/d/<ID>
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Check for id=<ID> parameter
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }

  // If it's a bare Drive file ID (alphanumeric with hyphens/underscores, usually ~25-45 chars, no slashes)
  if (!trimmed.includes('/') && trimmed.length >= 20) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  // Standard web URL (Unsplash, local asset, etc.)
  return trimmed;
}

/**
 * Public Google Drive Folder Link (Replace this with your own public Google Drive folder anytime!)
 */
export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/YOUR_PUBLIC_FOLDER_ID';

/**
 * Optional default Google Apps Script Web App URL for automatic 1-folder sync.
 * Reads from VITE_DRIVE_SYNC_API_URL in your .env / production environment (hidden from GitHub).
 */
export const DEFAULT_FOLDER_SYNC_API_URL = (import.meta.env.VITE_DRIVE_SYNC_API_URL as string) || '';

/**
 * Ready-to-deploy Google Apps Script snippet for automatic folder sync
 */
export const GOOGLE_APPS_SCRIPT_SNIPPET = `function doGet(e) {
  // 1. Paste your Google Drive Folder ID or full URL below:
  var FOLDER_INPUT = "YOUR_FOLDER_ID_HERE";
  
  try {
    // Automatically extracts the ID even if you pasted the full Google Drive link
    var match = FOLDER_INPUT.match(/[-\\w]{25,}/);
    var folderId = match ? match[0] : FOLDER_INPUT.trim();
    
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var results = [];
    
    while (files.hasNext()) {
      var file = files.next();
      var mime = file.getMimeType();
      
      // Filter for images only (jpg, png, webp, heic, etc.)
      if (mime.indexOf("image/") === 0) {
        var cleanTitle = file.getName().replace(/\\.[^/.]+$/, "").replace(/[-_]/g, " ");
        var created = file.getDateCreated();
        var dateStr = Utilities.formatDate(created, "GMT", "MMM yyyy").toUpperCase();
        
        results.push({
          id: file.getId(),
          title: cleanTitle,
          caption: "Uploaded to Google Drive: " + file.getName(),
          date: dateStr,
          location: "Google Drive Folder",
          category: "Bites & Brew",
          driveIdOrUrl: "https://lh3.googleusercontent.com/d/" + file.getId(),
          driveUrl: file.getUrl(),
          tags: ["Food", "BitesAndBrew", "DriveSync"]
        });
      }
    }
    
    var output = ContentService.createTextOutput(JSON.stringify({ status: "success", count: results.length, data: results }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (err) {
    var errorOutput = ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}`;

export const MEMORIES_DATA: MemoryItem[] = [];
