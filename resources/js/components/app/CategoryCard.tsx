import { Link } from '@inertiajs/react';
import {
    Camera,
    Video,
    Palette,
    Sparkles,
    UtensilsCrossed,
    Music,
    Mic2,
    ImagePlus,
    Building2,
    ClipboardList,
    PersonStanding
} from 'lucide-react';
import type { Category } from '@/data/categories';

const iconMap: Record<string, React.ElementType> = {
    Camera,
    Video,
    Palette,
    Sparkles,
    UtensilsCrossed,
    Music,
    Mic2,
    ImagePlus,
    Building2,
    ClipboardList,
    PersonStanding
};

const CategoryCard = ({ category }: { category: Category }) => {
    const Icon = iconMap[category.icon] || Palette;

    return (
        <Link
            href={`category/${category.slug}`}
            className="group hover:shadow-card-hover flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={24} />
            </div>
            <span className="font-display text-sm font-semibold text-card-foreground">
                {category.name}
            </span>
        </Link>
    );
};

export default CategoryCard;
