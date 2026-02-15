import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePublicBanners } from '@/hooks/admin/useAdminBanners';
import { Skeleton } from '@/components/ui/skeleton';

interface Banner {
  id: string;
  image_url?: string;
  image?: string;
  title: string;
  subtitle?: string | null;
  button_text?: string | null;
  buttonText?: string;
  button_link?: string | null;
  buttonLink?: string;
}

const defaultBanners: Banner[] = [
  {
    id: 'default-1',
    image: '/banners/slide-artistas.webp',
    title: 'A Loja Que Veste Os Artistas',
  },
  {
    id: 'default-2',
    image: '/banners/slide-loja-fisica.webp',
    title: 'Loja Física',
  },
  {
    id: 'default-3',
    image: '/banners/slide-frete-gratis.webp',
    title: 'Frete Grátis',
  },
];

interface HeroBannerProps {
  className?: string;
}

export function HeroBanner({ className }: HeroBannerProps) {
  const { data: dbBanners, isLoading } = usePublicBanners();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const banners: Banner[] = dbBanners && dbBanners.length >= 2 ? dbBanners : defaultBanners;
  const isUsingDefaults = !dbBanners || dbBanners.length < 2;

  const getImage = (b: Banner) => b.image_url || b.image || '';
  const getBtnText = (b: Banner) => b.button_text || b.buttonText || '';
  const getBtnLink = (b: Banner) => b.button_link || b.buttonLink || '';

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

  if (isLoading) {
    return <Skeleton className={cn('w-full aspect-[3/2] sm:aspect-[2/1] md:aspect-[3/1] rounded-2xl', className)} />;
  }

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl shadow-lg bg-[#0D0D0D]', className)}>
      <div className="aspect-[3/2] sm:aspect-[2/1] md:aspect-[3/1] relative">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-out',
              index === current
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
            )}
          >
            <img src={getImage(banner)} alt={banner.title} className="h-full w-full object-cover object-center" />
            {!isUsingDefaults && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <div
                      className={cn(
                        'max-w-md space-y-3 md:space-y-5 px-4 md:px-0 transition-all duration-700 delay-200',
                        index === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      )}
                    >
                      <h2 className="text-xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-sm md:text-lg text-white/90 drop-shadow">{banner.subtitle}</p>
                      )}
                      {getBtnText(banner) && getBtnLink(banner) && (
                        <Button
                          asChild
                          size="default"
                          className="h-9 px-4 md:h-11 md:px-6 text-sm md:text-base bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-gold-md transition-all duration-300"
                        >
                          <a href={getBtnLink(banner)}>{getBtnText(banner)}</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
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
