import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Vote, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAppStore(s => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast({ title: 'Đăng nhập thành công!', description: 'Chào mừng bạn trở lại.' });
      navigate('/my-groups');
    } else {
      toast({ title: 'Lỗi đăng nhập', description: 'Email hoặc mật khẩu không đúng.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-accent/6 blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Lá Phiếu 4.0</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">Truy cập hệ thống bầu cử số</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="email@example.com" className="pl-10 bg-muted/50 border-border/50" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10 bg-muted/50 border-border/50" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo: <span className="font-mono text-xs text-foreground">user@vote.vn / user123</span></p>
            <p className="mt-3">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary hover:underline">Đăng ký</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
