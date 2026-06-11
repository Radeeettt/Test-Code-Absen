import { useState } from 'react';
import { BASE_URL } from '../api/api';

interface PhotoViewerProps {
  src: string | null | undefined;
  alt?: string;
  label?: string;
}

export default function PhotoViewer({ src, alt = 'Foto', label }: PhotoViewerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!src) {
    return (
      <div className="photo-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>Tidak ada foto</span>
      </div>
    );
  }

  const fullSrc = src.startsWith('http') ? src : `${BASE_URL}${src}`;

  return (
    <>
      <div className="photo-thumb-wrapper">
        {label && <span className="photo-label">{label}</span>}
        {imgError ? (
          <div className="photo-placeholder small">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="3" x2="21" y2="21" />
            </svg>
            <span>Error</span>
          </div>
        ) : (
          <img
            src={fullSrc}
            alt={alt}
            className="photo-thumb"
            onClick={() => setLightboxOpen(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {lightboxOpen && !imgError && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img src={fullSrc} alt={alt} className="lightbox-img" />
          </div>
        </div>
      )}
    </>
  );
}
