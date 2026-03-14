import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Vote, LayoutDashboard, LogOut, Menu, X, Users, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Users, label: 'Nhóm của tôi', path: '/my-groups' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, groups, fetchData, isLoading } = useAppStore();

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show user's groups in sidebar
  const myGroups = groups.filter(g => g.ownerId === user?.id);

  return (
    <div className="min-h-screen flex">
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 h-screen w-64 glass-strong z-50 flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="./logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold">Lá Phiếu 4.0</span>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(n => (
            <Link
              key={n.path}
              to={n.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                location.pathname === n.path
                  ? 'gradient-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <n.icon className="w-4.5 h-4.5" />
              {n.label}
            </Link>
          ))}

          {myGroups.length > 0 && (
            <div className="pt-4">
              <div className="px-4 text-xs text-muted-foreground font-medium mb-2">Nhóm bầu cử</div>
              {myGroups.map(g => (
                <Link
                  key={g.id}
                  to={`/group/${g.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all',
                    location.pathname === `/group/${g.id}`
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="truncate">{g.name}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border/50">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 relative">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <header className="h-14 glass-strong flex items-center px-4 lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold">Lá Phiếu 4.0</span>
        </header>
        <main className="relative z-10">{children}</main>
      </div>
    </div>
  );
}
