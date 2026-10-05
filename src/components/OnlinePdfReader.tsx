import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  FileText,
  Search,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Check,
  Compass,
} from 'lucide-react';
import { toMyanmarDigits } from '../utils/islamicTimes';

interface OnlinePdfReaderProps {
  pdfUrl: string;
  initialPage?: number;
  bookTitle: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onClose?: () => void;
}

export const OnlinePdfReader: React.FC<OnlinePdfReaderProps> = ({
  pdfUrl,
  initialPage = 1,
  bookTitle,
  onPageChange,
  onClose,
}) => {
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<'custom' | 'width'>('width');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [jumpInput, setJumpInput] = useState<string>(String(initialPage));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any | null>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, []);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const initPdf = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (!pdfjs) {
        // Retry shortly if script is still downloading from CDN
        setTimeout(initPdf, 300);
        return;
      }

      pdfjs.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const loadingTask = pdfjs.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });

      loadingTask.promise
        .then((doc: any) => {
          if (isCancelled) return;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoading(false);
          const startingPage = Math.min(Math.max(1, initialPage), doc.numPages);
          setCurrentPage(startingPage);
          setJumpInput(String(startingPage));
        })
        .catch((err: any) => {
          if (isCancelled) return;
          console.error('PDF.js document loading error:', err);
          setLoadError(
            'PDF ဖိုင်ကို တိုက်ရိုက်ဆွဲတင်ဖတ်ရှုရန် အခက်အခဲရှိနေပါသည်။ (ဖိုင်ပျက်စီးနေခြင်း သို့မဟုတ် ဒိုမိန်းကန့်သတ်ချက် ဖြစ်နိုင်ပါသည်။ အောက်ရှိ စာသားမုဒ် သို့မဟုတ် PDF Download ခလုတ်ဖြင့် ဖတ်ရှုနိုင်ပါသည်)'
          );
          setIsLoading(false);
        });
    };

    initPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl, initialPage]);

  // Render Page Callback
  const renderPage = useCallback(
    (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel ongoing render if any
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      setIsRendering(true);

      pdfDoc
        .getPage(pageNum)
        .then((page: any) => {
          const canvas = canvasRef.current;
          if (!canvas) {
            setIsRendering(false);
            return;
          }
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsRendering(false);
            return;
          }

          const dpr = window.devicePixelRatio || 1;

          // Determine scale
          let targetScale = scale;
          if (fitMode === 'width' && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth - 48; // padding
            const unscaledViewport = page.getViewport({ scale: 1.0, rotation });
            targetScale = Math.max(0.6, containerWidth / unscaledViewport.width);
          }

          const viewport = page.getViewport({ scale: targetScale * dpr, rotation });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / dpr}px`;
          canvas.style.height = `${viewport.height / dpr}px`;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };

          const renderTask = page.render(renderContext);
          renderTaskRef.current = renderTask;

          renderTask.promise
            .then(() => {
              setIsRendering(false);
              renderTaskRef.current = null;
              if (onPageChange) {
                onPageChange(pageNum, pdfDoc.numPages);
              }
            })
            .catch((err: any) => {
              if (err?.name !== 'RenderingCancelledException') {
                console.warn('PDF render error:', err);
              }
              setIsRendering(false);
            });
        })
        .catch((err: any) => {
          console.error('GetPage error:', err);
          setIsRendering(false);
        });
    },
    [pdfDoc, scale, rotation, fitMode, onPageChange]
  );

  // Trigger render on page/scale/rotation changes
  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= numPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation, fitMode, renderPage, numPages]);

  // Page Controls
  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setJumpInput(String(prev));
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setJumpInput(String(next));
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpInput, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      setCurrentPage(p);
    } else {
      setJumpInput(String(currentPage));
    }
  };

  const zoomIn = () => {
    setFitMode('custom');
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setFitMode('custom');
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const toggleFitWidth = () => {
    if (fitMode === 'width') {
      setFitMode('custom');
      setScale(1.0);
    } else {
      setFitMode('width');
    }
  };

  const rotatePage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages]);

  return (
    <div className="flex flex-col h-full w-full bg-stone-900 text-stone-100 rounded-xl overflow-hidden select-none">
      {/* 1. TOP PDF TOOLBAR */}
      <div className="px-3 sm:px-5 py-2.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-2 flex-wrap text-xs font-myanmar z-10 shadow-md">
        {/* Left: Page Navigator & Jump */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="စာမျက်နှာ အကြမ်းဖျင်းဇယား (Page Drawer)"
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
              showThumbnails
                ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">စာမျက်နှာများ</span>
          </button>

          <div className="h-4 w-px bg-stone-800 mx-1 hidden sm:block" />

          {/* Previous Page */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isLoading}
            title="ရှေ့တစ်မျက်နှာ (Left Arrow)"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-stone-800 text-stone-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Counter & Direct Jump Input */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
            <span className="text-stone-400 text-xs hidden md:inline">စာမျက်နှာ</span>
            <input
              type="text"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onBlur={() => setJumpInput(String(currentPage))}
              className="w-11 px-1.5 py-0.5 text-center bg-stone-900 border border-stone-700 rounded text-amber-300 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <span className="text-stone-400 font-mono text-xs">
              / {numPages ? toMyanmarDigits(numPages) : '--'}
            </span>
          </form>

          {/* Next Page */}
          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages || isLoading}
            title="နောက်တစ်မျက်နှာ (Right Arrow)"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-stone-800 text-stone-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom, Fit, Rotate & Download Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Out */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5 || isLoading}
            title="ချုံ့မည် (Zoom Out)"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-stone-300 w-12 text-center hidden sm:inline-block">
            {fitMode === 'width' ? 'Auto' : `${Math.round(scale * 100)}%`}
          </span>

          {/* Zoom In */}
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0 || isLoading}
            title="ချဲ့မည် (Zoom In)"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fit to Width */}
          <button
            onClick={toggleFitWidth}
            title={fitMode === 'width' ? 'မူလအရွယ်အစား' : 'မျက်နှာပြင် အပြည့်ညှိမည် (Fit to Width)'}
            className={`px-2 py-1 rounded-lg border text-[11px] transition-colors hidden sm:flex items-center gap-1 ${
              fitMode === 'width'
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-semibold'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>အပြည့်ညှိ</span>
          </button>

          {/* Rotate 90 deg */}
          <button
            onClick={rotatePage}
            title="၉၀ ဒီဂရီ လှည့်မည် (Rotate 90°)"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Download PDF button */}
          <a
            href={pdfUrl}
            download={`${bookTitle}.pdf`}
            target="_blank"
            rel="noreferrer"
            title="မူရင်း PDF ဖိုင်အား စက်ထဲသို့ ဒေါင်းလုဒ် ရယူရန်"
            className="p-1.5 rounded-lg bg-violet-900 hover:bg-violet-800 text-violet-200 transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Download</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN VIEWER WORKSPACE (CANVAS + THUMBNAILS DRAWER) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Page Thumbnails Sidebar */}
        {showThumbnails && numPages > 0 && (
          <div className="w-48 sm:w-56 bg-stone-950 border-r border-stone-800 flex flex-col shrink-0 z-10 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-stone-800 flex items-center justify-between text-xs font-semibold text-stone-300 font-myanmar">
              <span>စာမျက်နှာ စာရင်း ({toMyanmarDigits(numPages)})</span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-stone-500 hover:text-stone-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    setJumpInput(String(p));
                  }}
                  className={`w-full p-2 rounded-lg text-left text-xs font-myanmar flex items-center justify-between transition-all ${
                    currentPage === p
                      ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>စာမျက်နှာ {toMyanmarDigits(p)}</span>
                  </span>
                  {currentPage === p && (
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Central Scrollable Canvas Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-start bg-stone-900/90 relative"
        >
          {/* Loading Spinner Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 z-20 space-y-3">
              <div className="w-9 h-9 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-300 font-myanmar">
                PDF စာမျက်နှာများကို ဖတ်ရှုစနစ်သို့ ဆွဲတင်နေပါသည်...
              </p>
            </div>
          )}

          {/* Load Error Banner */}
          {loadError && (
            <div className="max-w-md my-auto p-6 bg-stone-950 border border-rose-800/80 rounded-2xl text-center space-y-3 text-xs font-myanmar">
              <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-800">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm text-rose-200">
                PDF ဖိုင်ကို တိုက်ရိုက် မဖွင့်နိုင်ပါ
              </h4>
              <p className="text-stone-400 leading-relaxed">{loadError}</p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF အသစ်ဖွင့် / ဒေါင်းလုဒ်ရယူရန်</span>
                </a>
              </div>
            </div>
          )}

          {/* Real PDF HTML5 Canvas */}
          {!loadError && (
            <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white border border-stone-700/80 transition-all">
              <canvas ref={canvasRef} className="block mx-auto max-w-full" />
              {isRendering && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-stone-950/70 backdrop-blur-xs text-amber-300 rounded text-[10px] font-myanmar flex items-center gap-1">
                  <div className="w-2.5 h-2.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                  <span>တင်ဆက်နေဆဲ...</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Page Navigator Overlay at Bottom of Canvas */}
          {!isLoading && !loadError && numPages > 1 && (
            <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-stone-950/80 backdrop-blur-md rounded-full border border-stone-800 text-xs font-myanmar shadow-xl">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="text-stone-300 hover:text-white disabled:opacity-30"
              >
                ◀ ယခင်မျက်နှာ
              </button>
              <span className="font-mono text-amber-300 font-bold px-2">
                {currentPage} / {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="text-stone-300 hover:text-white disabled:opacity-30"
              >
                နောက်မျက်နှာ ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
