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
 * Leave empty or paste your deployed Web App URL here.
 */
export const DEFAULT_FOLDER_SYNC_API_URL = '';

/**
 * Ready-to-deploy Google Apps Script snippet for automatic folder sync
 */
export const GOOGLE_APPS_SCRIPT_SNIPPET = `function doGet(e) {
  // 1. Paste your Google Drive Folder ID below (from the folder URL)
  var FOLDER_ID = "YOUR_FOLDER_ID_HERE";
  
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
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
          category: "College",
          driveIdOrUrl: "https://lh3.googleusercontent.com/d/" + file.getId(),
          driveUrl: file.getUrl(),
          tags: ["DriveSync", "Memories"]
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

export const MEMORIES_DATA: MemoryItem[] = [
  {
    id: 'mem-1',
    title: '48-Hour Hackathon Victory',
    caption: 'Surviving on black coffee, cold pizza, and FastAPI async workers. Built an automated disaster relief coordination pipeline before the 8:00 AM demo bell.',
    date: 'OCT 2024',
    location: 'Kathmandu, Nepal',
    category: 'Hackathons',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'wide',
    tags: ['Hackathon', 'FastAPI', 'All-Nighter', 'Team']
  },
  {
    id: 'mem-2',
    title: 'Engineering Lab & Project Defense',
    caption: 'Presenting our distributed microservices architecture and load-testing benchmarks during the final semester capstone project defense.',
    date: 'JUL 2024',
    location: 'College of Information Technology',
    category: 'College',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'square',
    tags: ['Defense', 'Capstone', 'College', 'Engineering']
  },
  {
    id: 'mem-3',
    title: 'Kathmandu Python Developers Meetup',
    caption: 'Discussing Python 3.12 GIL removal, uvloop performance, and asynchronous backend patterns with the local open-source developer community.',
    date: 'DEC 2024',
    location: 'Lalitpur, Nepal',
    category: 'Meetups',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'wide',
    tags: ['Python', 'Community', 'TechTalk', 'Networking']
  },
  {
    id: 'mem-4',
    title: 'Campus Quad & Study Circle',
    caption: 'Between lectures: debating algorithms, whiteboard sessions, and debugging tricky pointer issues under the campus trees.',
    date: 'MAY 2023',
    location: 'Campus Lawn',
    category: 'Campus Life',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'tall',
    tags: ['Friends', 'Campus', 'StudyGroup', 'College']
  },
  {
    id: 'mem-5',
    title: 'Himalayan Ridge Trek Post-Exams',
    caption: 'Unplugging from screens and servers for 4 days in the high Himalayas. The best way to recharge mental RAM after grueling semester finals.',
    date: 'NOV 2023',
    location: 'Langtang Valley, Nepal',
    category: 'Travel',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'tall',
    tags: ['Trekking', 'Himalayas', 'Recharge', 'Nepal']
  },
  {
    id: 'mem-6',
    title: 'Late Night Library Coding Session',
    caption: 'Midnight at the college central library with headphones on, writing raw SQL migrations and tuning query execution plans.',
    date: 'JAN 2024',
    location: 'Central Academic Library',
    category: 'College',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'square',
    tags: ['Midnight', 'Library', 'Postgres', 'DeepWork']
  },
  {
    id: 'mem-7',
    title: 'Inter-College Tech Fest Exhibition',
    caption: 'Demonstrating real-time AI speech processing and backend queuing to visiting students and faculty at the annual tech exhibition.',
    date: 'FEB 2024',
    location: 'Auditorium Hall',
    category: 'Hackathons',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'wide',
    tags: ['Exhibition', 'TechFest', 'LiveDemo', 'AI']
  },
  {
    id: 'mem-8',
    title: 'Graduation & Convocation Day',
    caption: 'Four years of rigorous algorithms, distributed theory, and lifelong friendships summed up in one unforgettable afternoon.',
    date: 'AUG 2024',
    location: 'Convocation Grounds',
    category: 'College',
    driveIdOrUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'square',
    tags: ['Graduation', 'Convocation', 'Bachelors', 'Milestone']
  }
];
