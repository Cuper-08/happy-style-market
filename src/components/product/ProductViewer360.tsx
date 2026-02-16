import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductViewer360Props {
  images: string[];
  alt: string;
  currentIndex?: number;
  onImageIndexChange?: (index: number) => void;
}

export function ProductViewer360({ images, alt, currentIndex: externalIndex, onImageIndexChange }: ProductViewer360Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = externalIndex ?? internalIndex;
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [autoPlayed, setAutoPlayed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startIndexRef = useRef(0);
  const lastTouchDistRef = useRef(0);
  const autoPlayRef = useRef<number | null>(null);

  const sensitivity = 5;

  // Preload all images
  useEffect(() => {
    if (images.length <= 1) return;
    let loaded = 0;
    images.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === images.length) setImagesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === images.length) setImagesLoaded(true);
      };
      img.src = src;
    });
  }, [images]);

  // Auto-rotate on load to indicate interactivity
  useEffect(() => {
    if (!imagesLoaded || autoPlayed || images.length <= 1) return;
    setAutoPlayed(true);

    const maxFrame = Math.min(4, images.length - 1);
    let frame = 0;
    let direction = 1;
    const interval = setInterval(() => {
      frame += direction;
      if (frame >= maxFrame) direction = -1;
      if (frame <= 0) {
        clearInterval(interval);
        frame = 0;
      }
      setInternalIndex(frame);
      onImageIndexChange?.(frame);
    }, 120);

    autoPlayRef.current = interval as unknown as number;
    return () => clearInterval(interval);
  }, [imagesLoaded, autoPlayed, images.length, onImageIndexChange]);

  // Auto-hide hint after 3s
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, [showHint]);

  const updateIndex = useCallback((deltaX: number) => {
    const steps = Math.floor(deltaX / sensitivity);
    let newIndex = (startIndexRef.current - steps) % images.length;
    if (newIndex < 0) newIndex += images.length;
    setInternalIndex(newIndex);
    onImageIndexChange?.(newIndex);
  }, [images.length, onImageIndexChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setShowHint(false);
    startXRef.current = e.clientX;
    startIndexRef.current = currentIndex;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updateIndex(e.clientX - startXRef.current);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setShowHint(false);
      startXRef.current = e.touches[0].clientX;
      startIndexRef.current = currentIndex;
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      lastTouchDistRef.current = getTouchDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      updateIndex(e.touches[0].clientX - startXRef.current);
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDistance(e.touches);
      if (lastTouchDistRef.current > 0) {
        const delta = dist / lastTouchDistRef.current;
        setScale((prev) => Math.min(3, Math.max(1, prev * delta)));
      }
      lastTouchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistRef.current = 0;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => Math.min(3, Math.max(1, prev - e.deltaY * 0.002)));
  };

  function getTouchDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Single image fallback
  if (images.length <= 1) {
    return (
      <div className="aspect-square rounded-lg overflow-hidden bg-card">
        <img
          src={images[0] || '/placeholder.svg'}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden bg-card select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <img
        src={images[currentIndex] || '/placeholder.svg'}
        alt={`${alt} - ângulo ${currentIndex + 1}`}
        className="h-full w-full object-cover transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${scale})`,
          willChange: 'transform',
        }}
        draggable={false}
      />

      {/* 360 badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm text-foreground px-2.5 py-1.5 rounded-full text-xs font-medium">
        <RotateCw className="h-3.5 w-3.5" />
        360°
      </div>

      {/* Zoom indicator + reset */}
      {scale > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setScale(1); }}
          className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-background/95 transition-colors cursor-pointer"
        >
          <ZoomOut className="h-3.5 w-3.5" />
          Reset {Math.round(scale * 100)}%
        </button>
      )}

      {/* Drag hint - auto-hides after 3s */}
      {showHint && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-full text-sm font-medium shadow-lg">
            <Move className="h-4 w-4" />
            Arraste para girar
          </div>
        </div>
      )}

      {/* Navigation dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-200',
              i === currentIndex
                ? 'w-2 h-2 bg-foreground/90'
                : 'w-1.5 h-1.5 bg-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}
