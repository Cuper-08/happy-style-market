import { Link } from 'react-router-dom';

const categories = [
  { name: 'Malas', image: '/categories/malas.png', link: '/categoria/malas' },
  { name: 'Bolsas', image: '/categories/bolsas.png', link: '/categoria/bolsas' },
  { name: 'Grifes', image: '/categories/grifes.png', link: '/categoria/importados' },
  { name: 'Meias', image: '/categories/meias.png', link: '/categoria/meias' },
  { name: 'Bonés', image: '/categories/bones.png', link: '/categoria/bone' },
  { name: 'Tênis', image: '/categories/tenis.png', link: '/categoria/tenis' },
];

export function CategoryMarquee() {
  const items = [...categories, ...categories];

  return (
    <section className="py-6 md:py-8 space-y-4">
      <h2 className="text-center text-lg md:text-xl font-bold tracking-wide text-foreground">
        NAVEGUE POR CATEGORIAS
      </h2>
      <div className="overflow-hidden">
        <div className="flex animate-marquee-categories">
          {items.map((cat, i) => (
            <Link
              key={i}
              to={cat.link}
              className="flex-shrink-0 flex flex-col items-center mx-3 md:mx-5 group"
            >
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-border bg-card shadow-sm group-hover:shadow-md transition-shadow">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="mt-2 text-sm md:text-base font-semibold text-foreground">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
