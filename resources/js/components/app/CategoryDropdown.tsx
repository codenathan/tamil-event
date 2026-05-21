import { usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Tags, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
}

interface CategoryDropdownProps {
    value: string;
    onChange: (value: string) => void;
    large?: boolean;
    placeholder?: string;
}

const CategoryDropdown = ({
    value,
    onChange,
    large = false,
    placeholder = 'Category',
}: CategoryDropdownProps) => {
    const [open, setOpen] = useState(false);
    const { categories = [] } = usePage<{
        categories?: Category[];
        [key: string]: unknown;
    }>().props;

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div
            className={cn('relative', large ? 'sm:w-56' : 'sm:w-48')}
        >
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                    <Button
                        aria-expanded={open}
                        aria-label="Select category"
                        className={cn(
                            'w-full justify-between rounded-xl border border-input bg-card pl-12 font-body font-normal shadow-none hover:bg-card',
                            large ? 'h-14 text-base' : 'h-11 text-sm',
                            !value && 'text-muted-foreground',
                        )}
                        role="combobox"
                        type="button"
                        variant="outline"
                    >
                        <Tags className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                        <span className="truncate">
                            {value || placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                    side="bottom"
                    avoidCollisions={false}
                >
                    <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                            <CommandEmpty>No categories found.</CommandEmpty>
                            <CommandGroup>
                                {categories.map((cat) => (
                                    <CommandItem
                                        key={cat.id}
                                        keywords={[cat.name]}
                                        onSelect={() => {
                                            onChange(cat.name);
                                            setOpen(false);
                                        }}
                                        value={cat.name}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 size-4',
                                                value === cat.name
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                        {cat.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {value ? (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-1/2 right-10 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear category"
                >
                    <X className="size-4" />
                </button>
            ) : null}
        </div>
    );
};

export default CategoryDropdown;
