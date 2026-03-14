import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Vote, Shield, BarChart3, Zap, Users, TrendingUp, ArrowRight, CheckCircle2, QrCode, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

const features = [
  { icon: Shield, title: 'Bảo mật cao', desc: 'Mỗi phiếu bầu được bảo vệ, minh bạch và công bằng.' },
  { icon: QrCode, title: 'Chia sẻ QR Code', desc: 'Tạo nhóm bầu cử, chia sẻ bằng link hoặc mã QR.' },
  { icon: Zap, title: 'Realtime', desc: 'Cập nhật kết quả tức thì, không delay.' },
  { icon: Users, title: 'Tự tạo nhóm', desc: 'Mỗi người dùng có thể tạo nhóm bầu cử riêng.' },
];

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '< 50ms', label: 'Latency' },
  { value: '10K+', label: 'Users' },
  { value: '4.0', label: 'Version' },
];

export default function Landing() {
  const { groups } = useAppStore();
  const publicGroups = groups.filter(g => g.isPublic);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="./logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold">Lá Phiếu 4.0</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Tính năng</a>
            {publicGroups.length > 0 && <a href="#public-groups" className="hover:text-foreground transition-colors">Bầu cử công khai</a>}
            <a href="#stats" className="hover:text-foreground transition-colors">Thống kê</a>
            <a href="#about" className="hover:text-foreground transition-colors">Giới thiệu</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground">Bắt đầu</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with background image */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[100px] animate-pulse-slow" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Hệ thống đang hoạt động
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              <span className="gradient-text">Lá Phiếu 4.0</span>
              <br />
              Trí tuệ số, <span className="gradient-text">Trách nhiệm thật</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Cổng thông tin & bầu cử số hóa. Tạo nhóm bầu cử riêng, chia sẻ bằng link hoặc QR Code.
              Minh bạch, nhanh chóng, chính xác tuyệt đối.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="gradient-primary border-0 text-primary-foreground px-8 text-base glow-primary">
                  Tham gia ngay <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              {publicGroups.length > 0 && (
                <a href="#public-groups">
                  <Button size="lg" variant="outline" className="px-8 text-base border-border/50">
                    Xem bầu cử công khai
                  </Button>
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            id="stats"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Public Groups Section */}
      {publicGroups.length > 0 && (
        <section id="public-groups" className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <Globe className="w-3 h-3" /> Công khai
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Các cuộc bầu cử <span className="gradient-text">đang diễn ra</span></h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Mọi người đều có thể tham gia bình chọn cho các nhóm này.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicGroups.map((g, i) => {
                const totalVotes = g.candidates.reduce((s, c) => s + c.voteCount, 0);
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-6 hover:border-primary/30 transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:glow-primary transition-shadow">
                        <Vote className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="text-xs font-medium px-2 py-1 rounded-md bg-success/10 text-success">Active</div>
                    </div>
                    <h3 className="font-bold text-xl mb-2 line-clamp-1">{g.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">{g.description || 'Không có mô tả'}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">{g.candidates.length}</span> ứng viên · <span className="font-bold text-foreground">{totalVotes}</span> phiếu
                      </div>
                      <Link to={`/vote/${g.id}`}>
                        <Button size="sm" className="gradient-primary border-0 text-primary-foreground">
                          Bỏ phiếu
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng <span className="gradient-text">vượt trội</span></h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Mỗi người dùng đều có thể tạo nhóm bầu cử, quản lý ứng viên và chia sẻ.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 gradient-hero">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="gradient-text">Chạm là chọn</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Lá Phiếu 4.0 - Hệ thống bầu cử số thế hệ mới. Tạo nhóm, thêm ứng viên, 
                  chia sẻ QR Code và theo dõi kết quả real-time.
                </p>
                <ul className="space-y-3">
                  {['Tạo nhóm bầu cử không giới hạn', 'Chia sẻ bằng link hoặc QR Code', 'Quản lý ứng viên dễ dàng', 'Thay đổi phiếu bầu linh hoạt'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/hero-bg.png" alt="Lá Phiếu 4.0" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Vote className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Lá Phiếu 4.0</span>
          </div>
          <p>© 2024 Lá Phiếu 4.0 — Trí tuệ số, Trách nhiệm thật.</p>
        </div>
      </footer>
    </div>
  );
}
