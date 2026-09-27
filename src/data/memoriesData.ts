import { MemoryItem } from '../types/portfolio';

/**
 * Utility to seamlessly parse Google Drive URLs or IDs into high-speed embeddable image URLs.
 * Works with:
 * 1. Full Drive view links: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * 2. Short links: https://drive.google.com/open?id=FILE_ID
 * 3. Direct IDs: "1vABC123xyz..."
 * 4. Regular image URLs: Unsplash, Cloudinary, local paths, etc.
 */
/**
 * Resolves a Google Drive link or ID to a reliable, universally viewable direct thumbnail image URL.
 * Works on any phone, browser, incognito session, or device without requiring a Google login.
 */
export function resolveDriveImageUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If already a direct thumbnail or Google User Content link
  if (trimmed.includes('lh3.googleusercontent.com') || trimmed.includes('drive.google.com/thumbnail')) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // drive.google.com/thumbnail?id=...&sz=w1600 is the most reliable endpoint across mobile devices
    // as it does not enforce Google workspace or cookie requirements on public files.
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }

  // Standard web URL (Unsplash, Cloudinary, local asset, etc.)
  return trimmed;
}

/**
 * Returns alternative candidate URLs for a Drive image to use as fallback in onError.
 */
export function getDriveImageFallbackUrls(input: string): string[] {
  const fileId = extractDriveFileId(input);
  if (!fileId) return [];
  return [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${fileId}`
  ];
}

/**
 * Extracts Drive File ID if present
 */
export function extractDriveFileId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  if (!trimmed.includes('/') && trimmed.length >= 20) return trimmed;
  return null;
}

/**
 * Helper to get video embed preview link for Google Drive or direct video
 */
export function resolveDriveVideoPreviewUrl(input: string): string {
  const fileId = extractDriveFileId(input);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return input;
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
      
      // Filter for images and videos
      var isImage = mime.indexOf("image/") === 0;
      var isVideo = mime.indexOf("video/") === 0;

      if (isImage || isVideo) {
        var cleanTitle = file.getName().replace(/\\.[^/.]+$/, "").replace(/[-_]/g, " ");
        var desc = file.getDescription() || "";
        var created = file.getDateCreated();
        var dateStr = Utilities.formatDate(created, "GMT", "MMM yyyy").toUpperCase();
        
        // Use universally viewable thumbnail link that works on all mobile & desktop browsers
        var mediaUrl = isVideo 
          ? ("https://drive.google.com/file/d/" + file.getId() + "/preview")
          : ("https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600");

        results.push({
          id: file.getId(),
          title: cleanTitle,
          caption: desc || ("Captured in Google Drive: " + file.getName()),
          date: dateStr,
          location: "Kathmandu, Nepal",
          category: "Bites & Brew",
          mediaType: isVideo ? "video" : "image",
          driveIdOrUrl: mediaUrl,
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
};`;

export const MEMORIES_DATA: MemoryItem[] = [];
