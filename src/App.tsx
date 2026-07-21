import { useEffect, useState } from 'react';
import { Apple, Monitor, Terminal, FileText, Check, ArrowDownToLine, Loader2, ChevronDown } from 'lucide-react';
import './index.css';

interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

interface ReleaseData {
  tag_name: string;
  published_at: string;
  body: string;
  assets: ReleaseAsset[];
}

export default function App() {
  const [releases, setReleases] = useState<ReleaseData[]>([]);
  const [selectedReleaseIndex, setSelectedReleaseIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repoOwner = "geeksmanin";
  const repoName = "portlabel-release";

  useEffect(() => {
    async function fetchReleases() {
      try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases`);
        if (!response.ok) {
          throw new Error('Failed to fetch release information');
        }
        const data = await response.json();
        setReleases(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to retrieve version history');
      } finally {
        setLoading(false);
      }
    }
    fetchReleases();
  }, []);

  const release = releases[selectedReleaseIndex] || null;

  const formatBytes = (bytes: number, decimals = 1) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const renderMarkdown = (markdown: string) => {
    const formatted = markdown
      .replace(/### (.*)/g, '<h4 style="color:white;margin-top:1rem;margin-bottom:0.5rem;font-weight:600;">$1</h4>')
      .replace(/## (.*)/g, '<h3 style="color:white;margin-top:1.5rem;margin-bottom:0.75rem;font-weight:700;">$1</h3>')
      .replace(/# (.*)/g, '<h2 style="color:white;margin-top:2rem;margin-bottom:1rem;font-weight:800;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*)/g, '<li>$1</li>')
      .replace(/`([^`]+)`/g, '<code style="background-color:rgba(255,255,255,0.06);padding:0.2rem 0.4rem;border-radius:4px;font-size:0.9em;color:#f43f5e;">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      .replace(/<\/ul>\s*<ul>/g, '');
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  let macArmAsset: any = null;
  let macIntelAsset: any = null;
  let winAsset: any = null;
  let linuxDebAsset: any = null;

  if (release?.assets) {
    release.assets.forEach(asset => {
      const name = asset.name.toLowerCase();
      if (name.includes('darwin') || name.includes('mac')) {
        if (name.includes('arm64')) {
          macArmAsset = asset;
        } else if (name.includes('amd64')) {
          macIntelAsset = asset;
        }
      }
      if (name.includes('win') || name.includes('windows')) {
        winAsset = asset;
      }
      if (name.endsWith('.deb') || name.includes('linux')) {
        linuxDebAsset = asset;
      }
    });
  }

  const fallbackLink = `https://github.com/${repoOwner}/${repoName}/releases/tag/${release?.tag_name || 'latest'}`;

  return (
    <>
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      <div className="container">
        <header>
          <div className="logo-container">
            <svg className="logo-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 010 18M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M3.284 9.753a9.002 9.002 0 0117.432 0M3.284 9.753L21 9.753M3.284 14.247a9.003 9.003 0 0117.432 0M3.284 14.247L21 14.247" />
            </svg>
          </div>
          <h1>PortLabel</h1>
          <p className="subtitle">Experience a new era of enterprise workflow. Clean, blazingly fast, and fully integrated desktop application for your organization.</p>
          
          <div className="header-controls">
            <div className="version-tag">
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <div className="pulse-dot"></div>
              )}
              <span>
                {loading && "Loading version history..."}
                {!loading && error && "Unable to check versions"}
                {!loading && !error && release && (
                  selectedReleaseIndex === 0 
                    ? `Latest Stable: ${release.tag_name}` 
                    : `Version: ${release.tag_name}`
                )}
              </span>
            </div>

            {!loading && !error && releases.length > 0 && (
              <div className="selector-wrapper">
                <ChevronDown className="selector-chevron" size={16} />
                <select 
                  id="version-select"
                  className="version-select"
                  value={selectedReleaseIndex}
                  onChange={(e) => setSelectedReleaseIndex(Number(e.target.value))}
                >
                  {releases.map((rel, idx) => (
                    <option key={rel.tag_name} value={idx}>
                      {rel.tag_name} {idx === 0 ? ' [Stable]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        <div className="download-grid">
          {/* macOS Card */}
          <div className="download-card mac">
            <div className="card-header">
              <div className="os-icon">
                <Apple size={24} />
              </div>
              <div className="os-info">
                <h3>macOS</h3>
                <p>Apple Silicon (M1/M2/M3) & Intel</p>
              </div>
            </div>
            <ul className="features-list">
              <li><Check size={18} /> Native M1/M2/M3 ARM64 support</li>
              <li><Check size={18} /> Universal & standalone options</li>
              <li><Check size={18} /> Automatic OTA background updates</li>
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
              <a href={(macArmAsset || macIntelAsset) ? (macArmAsset || macIntelAsset).browser_download_url : fallbackLink} className="btn-download btn-mac">
                <ArrowDownToLine size={20} />
                {macArmAsset ? `Download for macOS (Apple Silicon ARM64 - ${formatBytes(macArmAsset.size)})` : macIntelAsset ? `Download for macOS (Intel x64 - ${formatBytes(macIntelAsset.size)})` : 'Download for macOS (Universal)'}
              </a>
              {macIntelAsset && macArmAsset && (
                <a href={macIntelAsset.browser_download_url} className="btn-download btn-mac" style={{ opacity: 0.9, backgroundColor: '#4f46e5' }}>
                  <ArrowDownToLine size={20} />
                  Download for macOS (Intel x64 - {formatBytes(macIntelAsset.size)})
                </a>
              )}
            </div>
          </div>

          {/* Windows Card */}
          <div className="download-card windows">
            <div className="card-header">
              <div className="os-icon">
                <Monitor size={24} />
              </div>
              <div className="os-info">
                <h3>Windows</h3>
                <p>Windows 10 / 11 (64-bit)</p>
              </div>
            </div>
            <ul className="features-list">
              <li><Check size={18} /> Optimized for x64 architecture</li>
              <li><Check size={18} /> Single-file portable deployment</li>
              <li><Check size={18} /> Direct background patching</li>
            </ul>
            <a href={winAsset ? winAsset.browser_download_url : fallbackLink} className="btn-download btn-win" style={{ marginTop: 'auto' }}>
              <ArrowDownToLine size={20} />
              {winAsset ? `Download for Windows (${formatBytes(winAsset.size)})` : 'Download for Windows (x64)'}
            </a>
          </div>

          {/* Linux Card */}
          <div className="download-card linux">
            <div className="card-header">
              <div className="os-icon">
                <Terminal size={24} />
              </div>
              <div className="os-info">
                <h3>Linux</h3>
                <p>Ubuntu, Debian, and Mint</p>
              </div>
            </div>
            <ul className="features-list">
              <li><Check size={18} /> Native DEB packaging (APT)</li>
              <li><Check size={18} /> Portable AppImage format</li>
              <li><Check size={18} /> Full system dark theme matching</li>
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
              <a href={linuxDebAsset ? linuxDebAsset.browser_download_url : fallbackLink} className="btn-download" style={{ backgroundColor: '#e11d48', color: '#fff' }}>
                <ArrowDownToLine size={20} />
                {linuxDebAsset ? `Download DEB (${formatBytes(linuxDebAsset.size)})` : 'Download DEB Package'}
              </a>
            </div>
          </div>
        </div>

        <div className="release-section">
          <div className="section-title">
            <FileText size={24} />
            Release Notes ({release?.tag_name})
          </div>
          <div className="release-content">
            {loading && "Fetching release notes..."}
            {!loading && error && <p style={{ color: '#ef4444' }}>Failed to retrieve release notes.</p>}
            {!loading && !error && release && renderMarkdown(release.body)}
          </div>
        </div>

        <footer>
          <p>&copy; 2026 Geeksman Inc. | Releases distributed via GitHub</p>
        </footer>
      </div>
    </>
  );
}
