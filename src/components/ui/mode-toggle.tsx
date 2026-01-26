import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  collapsed?: boolean;
}

export function ModeToggle({ collapsed = false }: ModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative overflow-hidden',
            collapsed ? 'mx-auto' : 'w-full justify-start gap-3 px-3'
          )}
        >
          <Sun className={cn(
            'h-5 w-5 transition-all duration-300',
            resolvedTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
          )} />
          <Moon className={cn(
            'absolute h-5 w-5 transition-all duration-300',
            resolvedTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0',
            collapsed ? '' : 'left-3'
          )} />
          {!collapsed && (
            <span className="ml-5">
              {theme === 'light' ? 'Tema Claro' : theme === 'dark' ? 'Tema Escuro' : 'Sistema'}
            </span>
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn(theme === 'light' && 'bg-accent')}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn(theme === 'dark' && 'bg-accent')}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn(theme === 'system' && 'bg-accent')}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
