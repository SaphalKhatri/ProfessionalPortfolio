export type PageId = 'about' | 'projects' | 'skills' | 'memories' | 'bug-smasher' | 'api-explorer' | 'contact';

export interface MemoryItem {
  id: string;
  title: string;
  caption: string;
  date: string;
  location?: string;
  category: 'College' | 'Hackathons' | 'Campus Life' | 'Meetups' | 'Travel';
  driveIdOrUrl: string;
  aspectRatio?: 'tall' | 'wide' | 'square';
  tags?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  category: 'Machine Learning & AI' | 'FastAPI & AI Integration' | 'Distributed Systems & Tasks' | 'Full Stack & APIs';
  description: string[];
  techStack: string[];
  metrics: { label: string; value: string }[];
  githubUrl: string;
  liveDemoUrl?: string;
  architectureHighlights: string[];
  endpointsSample?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    samplePayload?: object;
    sampleResponse: object;
  }[];
}

export interface SkillCategory {
  title: string;
  subtitle: string;
  skills: {
    name: string;
    level: string;
    description: string;
    icon?: string;
  }[];
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Project' | 'Education';
  bullets: string[];
  technologies: string[];
}

export interface EngineeringPrinciple {
  id: string;
  title: string;
  tagline: string;
  invariant: string;
  description: string;
  rules: string[];
}

