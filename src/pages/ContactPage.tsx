import React, { useState } from 'react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Download, 
  Clock, 
  MapPin, 
  Shield, 
  CheckCircle2
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 700);
  };

  const handleDownloadCV = () => {
    const cvContent = `# Saphal Kumar Khatri
Backend & Python Developer | Kathmandu, Nepal
Email: ${PERSONAL_INFO.email}
GitHub: ${PERSONAL_INFO.github}
LinkedIn: ${PERSONAL_INFO.linkedin}
Website: ${PERSONAL_INFO.currentSite}

## Summary
Backend-focused developer specializing in Python, FastAPI, Django REST Framework, and PostgreSQL. Experienced in building machine learning APIs with scikit-learn, database-first caching architectures with Google Gemini AI, and asynchronous task queues using Celery and Redis.

## Core Technical Skills
- Backend: Python 3.12, FastAPI, Django, Django REST Framework, AsyncIO, uvloop, Celery
- Databases: PostgreSQL, Supabase, Redis, SQLAlchemy, SQLite
- AI & ML: scikit-learn (TF-IDF, Cosine Similarity), Google Gemini API, NumPy, Pandas
- DevOps & Tools: Docker, Docker Compose, Git, GitHub Actions, Linux/Bash, Postman
- Frontend: React, TypeScript, Tailwind CSS, HTML5, CSS3

## Key Projects
1. Movie-Recommendation API (FastAPI, scikit-learn, TF-IDF, Cosine Similarity)
   - Real-time content-based recommendation engine with sub-15ms inference latency.
   - https://github.com/SaphalKhatri/movie-recommendation-api

2. Coffee_Recipe_gemini-API (FastAPI, PostgreSQL, Google Gemini AI)
   - Intelligent recipe generation REST API with database-first caching pattern.
   - https://github.com/SaphalKhatri/coffee_recipe-gemini-api

3. Async-Task Engine & Ingestion Pipeline (Python 3.12, Celery, Redis, Docker)
   - Distributed task execution pipeline with dead-letter queue retries and high throughput.

4. Portfolio Web & Admin Service (React, TypeScript, FastAPI backend)
   - Production portfolio with password-guarded administration endpoints.

## Education
Bachelor in Computer / Information Engineering Student, Kathmandu, Nepal
`;

    const blob = new Blob([cvContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Saphal_Kumar_Khatri_Resume.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs mb-3">
          <Send className="w-3.5 h-3.5" />
          <span>contact_dispatcher.py</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#f0f6fc] tracking-tight">
          Get in Touch & Opportunities
        </h1>
        <p className="text-sm md:text-base text-[#8b949e] mt-2 max-w-3xl leading-relaxed">
          I am currently open to backend software engineering positions, internships, and collaborative open-source systems development. Feel free to send an email, dispatch a message, or connect on LinkedIn.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Direct Email */}
        <div className="p-5 rounded-xl border border-[#22272e] bg-[#161b22]/50 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6e7681]">
              Primary Inquiries
            </span>
            <Mail className="w-4 h-4 text-sky-400" />
          </div>
          <h3 className="text-sm font-semibold text-[#f0f6fc] font-serif mb-1">
            Direct Email
          </h3>
          <p className="text-xs font-mono text-[#8b949e] mb-4 truncate">
            {PERSONAL_INFO.email}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmail}
              className="text-xs font-mono px-3 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white flex items-center gap-1.5 transition-colors border border-[#30363d]"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Email</span>
                </>
              )}
            </button>
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="text-xs font-mono px-3 py-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 flex items-center gap-1.5 transition-colors border border-sky-500/30"
            >
              <span>Mail Client</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Location & Timezone */}
        <div className="p-5 rounded-xl border border-[#22272e] bg-[#161b22]/50 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6e7681]">
              Base & Coordinates
            </span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-[#f0f6fc] font-serif mb-1">
            Kathmandu, Nepal
          </h3>
          <p className="text-xs font-mono text-[#8b949e] mb-4">
            UTC +05:45 (Nepal Standard Time)
          </p>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open for Remote & Relocation</span>
          </div>
        </div>

        {/* Resume Download */}
        <div className="p-5 rounded-xl border border-[#22272e] bg-[#161b22]/50 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6e7681]">
              Credentials
            </span>
            <Download className="w-4 h-4 text-sky-400" />
          </div>
          <h3 className="text-sm font-semibold text-[#f0f6fc] font-serif mb-1">
            Resume / CV Document
          </h3>
          <p className="text-xs font-mono text-[#8b949e] mb-4">
            Markdown / Plain text format
          </p>
          <button
            onClick={handleDownloadCV}
            className="text-xs font-mono px-3 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white flex items-center gap-1.5 transition-colors border border-[#30363d]"
          >
            <Download className="w-3 h-3" />
            <span>Download Resume.md</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Form & Social Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 rounded-xl border border-[#22272e] bg-[#161b22]/50 p-6 md:p-8">
          <h2 className="text-xl font-serif font-bold text-[#f0f6fc] tracking-tight mb-1">
            Dispatch a Direct Message
          </h2>
          <p className="text-xs text-[#8b949e] font-mono mb-6">
            Sends directly to Saphal's inbox via client-side mail protocol.
          </p>

          {submitted ? (
            <div className="p-5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-mono text-xs flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Message Dispatched Successfully!</p>
                <p className="text-[#a2abb5] mt-0.5">Thank you for reaching out. I will respond to your email as soon as possible.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8b949e] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Mercer"
                    className="w-full bg-[#0d1117] border border-[#22272e] rounded-lg px-3.5 py-2 text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-sky-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8b949e] mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full bg-[#0d1117] border border-[#22272e] rounded-lg px-3.5 py-2 text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-sky-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8b949e] mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Backend Engineer Position / Software Internship"
                  className="w-full bg-[#0d1117] border border-[#22272e] rounded-lg px-3.5 py-2 text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-sky-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8b949e] mb-1.5">
                  Message Content
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Hi Saphal, I came across your portfolio and backend projects..."
                  className="w-full bg-[#0d1117] border border-[#22272e] rounded-lg p-3.5 text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-sky-500/60 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-[#0d1117] transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Profiles & Verification Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#22272e] bg-[#161b22]/50 p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-[#f0f6fc]">
              Verified Profiles
            </h3>

            <div className="space-y-2.5">
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#22272e] hover:border-sky-500/40 text-xs font-mono text-[#c9d1d9] group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Github className="w-4 h-4 text-white" />
                  <span>github.com/SaphalKhatri</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-sky-400" />
              </a>

              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#22272e] hover:border-sky-500/40 text-xs font-mono text-[#c9d1d9] group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4 text-sky-400" />
                  <span>LinkedIn Profile</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-sky-400" />
              </a>

              <a
                href={PERSONAL_INFO.currentSite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#0d1117] border border-[#22272e] hover:border-sky-500/40 text-xs font-mono text-[#c9d1d9] group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>khatrisaphal.com.np</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-sky-400" />
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-[#22272e] bg-[#161b22]/30 p-5 text-xs font-mono text-[#8b949e] space-y-2">
            <div className="flex items-center gap-2 text-[#f0f6fc] font-semibold">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>GPG Fingerprint</span>
            </div>
            <p className="text-[11px] text-[#6e7681] break-all bg-[#0d1117] p-2.5 rounded border border-[#22272e]">
              4F98 2A01 E590 BC3D 1A77 82E0 4C81 92AA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
