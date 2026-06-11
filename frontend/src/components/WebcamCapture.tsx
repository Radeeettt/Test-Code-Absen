import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onClear: () => void;
  capturedFile: File | null;
}

type CaptureMode = 'webcam' | 'upload';

export default function WebcamCapture({ onCapture, onClear, capturedFile }: WebcamCaptureProps) {
  const [mode, setMode] = useState<CaptureMode>('webcam');
  const [webcamReady, setWebcamReady] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPreviewUrl(imageSrc);
        onCapture(file);
      });
  }, [onCapture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onCapture(file);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    onClear();
    setWebcamError(null);
    setWebcamReady(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUserMediaError = useCallback((err: string | DOMException) => {
    console.error('Webcam permission or device error:', err);
    setWebcamReady(false);
    setWebcamError(
      'Kamera tidak dapat diakses. Pastikan Anda mengizinkan akses kamera di pengaturan browser Anda, atau hubungkan kamera jika belum terpasang.'
    );
  }, []);

  return (
    <div className="webcam-wrapper">
      <div className="capture-tabs">
        <button
          type="button"
          className={`capture-tab ${mode === 'webcam' ? 'active' : ''}`}
          onClick={() => { setMode('webcam'); handleClear(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          Kamera Langsung
        </button>
        <button
          type="button"
          className={`capture-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => { setMode('upload'); handleClear(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Foto
        </button>
      </div>

      {capturedFile && previewUrl ? (
        <div className="capture-preview">
          <img src={previewUrl} alt="Foto bukti" className="preview-img" />
          <div className="preview-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="18" height="18">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Foto siap: <strong>{capturedFile.name}</strong></span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
            Ganti Foto
          </button>
        </div>
      ) : (
        <>
          {mode === 'webcam' && (
            <div className="webcam-container">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                onUserMedia={() => {
                  setWebcamReady(true);
                  setWebcamError(null);
                }}
                onUserMediaError={handleUserMediaError}
                className="webcam-video"
              />
              {!webcamReady && !webcamError && (
                <div className="webcam-loading">
                  <div className="spinner" />
                  <span>Memuat kamera...</span>
                </div>
              )}
              {webcamError && (
                <div className="webcam-error-box animate-scale-in">
                  <strong>Akses Kamera Gagal</strong>
                  <span>{webcamError}</span>
                  <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Gunakan tab <strong>"Upload Foto"</strong> di atas sebagai alternatif jika kamera bermasalah.
                  </div>
                </div>
              )}
              <button
                type="button"
                className="btn btn-primary capture-btn"
                onClick={handleCapture}
                disabled={!webcamReady}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Ambil Foto
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="upload-text">Klik untuk pilih foto</p>
              <p className="upload-hint">JPG, PNG, atau WebP • Maks 10MB</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}