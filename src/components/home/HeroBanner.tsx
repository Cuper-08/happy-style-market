import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

const defaultBanners: Banner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&h=600&fit=crop',
    title: 'Novos Tênis Esportivos',
    subtitle: 'Preços exclusivos de atacado',
    buttonText: 'Ver Coleção',
    buttonLink: '/categoria/tenis',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
    title: 'Moda Esportiva',
    subtitle: 'As melhores marcas em um só lugar',
    buttonText: 'Explorar',
    buttonLink: '/produtos',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
    title: 'Até 40% OFF',
    subtitle: 'Promoção por tempo limitado',
    buttonText: 'Aproveitar',
    buttonLink: '/produtos',
  },
];

interface HeroBannerProps {
  banners?: Banner[];
  className?: string;
}

export function HeroBanner({ banners = defaultBanners, className }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((current + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length, current, goToSlide]);

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl shadow-lg', className)}>
      <div className="aspect-[2/1] md:aspect-[3/1] relative">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-out',
              index === current 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            )}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
            {/* Subtle gradient overlay - less opacity for vibrant images */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div 
                  className={cn(
                    'max-w-md space-y-3 md:space-y-5 px-4 md:px-0 transition-all duration-700 delay-200',
                    index === current 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                  )}
                >
                  <h2 className="text-xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-sm md:text-lg text-white/90 drop-shadow">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.buttonText && banner.buttonLink && (
                    <Button 
                      asChild 
                      size="default"
                      className="h-9 px-4 md:h-11 md:px-6 text-sm md:text-base bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-gold-md transition-all duration-300"
                    >
                      <a href={banner.buttonLink}>{banner.buttonText}</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 rounded-full transition-all duration-500',
              index === current 
                ? 'w-8 bg-primary shadow-gold-sm' 
                : 'w-2 bg-foreground/30 hover:bg-foreground/50'
            )}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
