import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className={cn('relative w-full overflow-hidden rounded-lg', className)}>
      <div className="aspect-[2/1] md:aspect-[3/1] relative">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-md space-y-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-sm md:text-lg text-muted-foreground">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.buttonText && banner.buttonLink && (
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <a href={banner.buttonLink}>{banner.buttonText}</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={goToNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 rounded-full transition-all',
              index === current ? 'w-6 bg-primary' : 'w-2 bg-foreground/30'
            )}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}
