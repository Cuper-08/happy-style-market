import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

// Icon mapping
import { Footprints, Shirt, Watch } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  tenis: Footprints,
  roupas: Shirt,
  acessorios: Watch,
};

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = iconMap[category.slug] || Footprints;

  return (
    <Link
      to={`/categoria/${category.slug}`}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-secondary hover:bg-primary/20 transition-all duration-300 group',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="text-sm font-medium text-center">{category.name}</span>
    </Link>
  );
}

interface CategoryGridProps {
  categories: Category[];
  className?: string;
}

export function CategoryGrid({ categories, className }: CategoryGridProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
