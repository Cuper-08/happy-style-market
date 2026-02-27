import { useState, ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileHeader } from '@/components/admin/AdminMobileHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DialogTitle } from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdminOrManager, isLoading } = useAdminAuth();
  const { setIsAdminTheme } = useTheme();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set admin theme when entering admin area
  useEffect(() => {
    setIsAdminTheme(true);
    return () => setIsAdminTheme(false);
  }, [setIsAdminTheme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrManager) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      {isMobile && (
        <AdminMobileHeader onMenuToggle={() => setMobileMenuOpen(true)} />
      )}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Menu de navegação admin</DialogTitle>
            <AdminSidebar
              collapsed={false}
              onToggle={() => {}}
              isMobile={true}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          isMobile 
            ? 'pt-14' 
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        )}
      >
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
