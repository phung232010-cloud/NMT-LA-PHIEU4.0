import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Vote, Trash2, Copy, QrCode, ExternalLink, Eye, EyeOff, Globe, ShieldCheck, KeyRound, X, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MyGroups() {
  const { groups, user, adminKeys, createGroup, deleteGroup, adminDeleteGroup, toggleGroupVisibility, createAdminKey, revokeAdminKey } = useAppStore();
  const isAdmin = user?.isAdmin ?? false;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adminDeleteId, setAdminDeleteId] = useState<string | null>(null);
  const [showAdminKeys, setShowAdminKeys] = useState(false);
  const [newAdminKey, setNewAdminKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const myGroups = groups.filter(g => g.ownerId === user?.id);
  const publicGroups = groups.filter(g => g.isPublic);

  const getVoteUrl = (groupId: string) => {
    return window.location.href.split('#')[0].split('?')[0] + '#/vote/' + groupId;
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createGroup(newName, newDesc);
    if (id) {
      toast({ title: 'Tạo nhóm thành công!' });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      navigate(`/group/${id}`);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGroup(deleteId);
      setDeleteId(null);
      toast({ title: 'Đã xóa nhóm bầu cử' });
    }
  };

  const handleAdminDelete = () => {
    if (adminDeleteId) {
      const ok = adminDeleteGroup(adminDeleteId);
      if (ok) {
        toast({ title: 'Đã xóa nhóm (Admin)' });
      } else {
        toast({ title: 'Không có quyền xóa!', variant: 'destructive' });
      }
      setAdminDeleteId(null);
    }
  };

  const handleCreateAdminKey = () => {
    if (!newAdminKey.trim()) return;
    const ok = createAdminKey(newAdminKey.trim());
    if (ok) {
      toast({ title: 'Tạo admin key thành công!' });
      setNewAdminKey('');
    } else {
      toast({ title: 'Key đã tồn tại!', variant: 'destructive' });
    }
  };

  const copyLink = (groupId: string) => {
    navigator.clipboard.writeText(getVoteUrl(groupId));
    toast({ title: 'Đã copy link!' });
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isAdmin ? '🛡️ Nhóm bầu cử của tôi (Admin)' : 'Nhóm bầu cử của tôi'}
            </h1>
            <p className="text-muted-foreground">
              Tạo và quản lý các cuộc bầu cử
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowAdminKeys(true)}>
                <KeyRound className="w-4 h-4 mr-2" /> Quản lý Keys
              </Button>
            )}
            <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Tạo nhóm mới
            </Button>
          </div>
        </motion.div>

        {/* My groups - both admin and regular users */}
        {myGroups.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-12 text-center mb-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có nhóm nào</h3>
            <p className="text-muted-foreground text-sm mb-4">Tạo nhóm bầu cử đầu tiên của bạn</p>
            <Button className="gradient-primary border-0 text-primary-foreground" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Tạo nhóm
            </Button>
          </motion.div>
        )}

        {myGroups.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {myGroups.map((g, i) => {
              const totalVotes = g.candidates.reduce((s, c) => s + c.voteCount, 0);
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-6 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{g.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{g.description || 'Không có mô tả'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${g.isPublic ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {g.isPublic ? 'Công khai' : 'Ẩn'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {g.candidates.length} ứng viên</span>
                    <span className="flex items-center gap-1"><Vote className="w-3.5 h-3.5" /> {totalVotes} phiếu</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/group/${g.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Quản lý
                      </Button>
                    </Link>
                    <Link to={`/dashboard/${g.id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => toggleGroupVisibility(g.id)} title={g.isPublic ? 'Ẩn nhóm' : 'Công khai nhóm'}>
                      {g.isPublic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyLink(g.id)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowQR(g.id)}>
                      <QrCode className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(g.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Public groups */}
        {publicGroups.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Nhóm bầu cử công khai</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {publicGroups.map((g, i) => {
                const totalVotes = g.candidates.reduce((s, c) => s + c.voteCount, 0);
                const hasVoted = user ? !!g.votes[user.id] : false;
                return (
                  <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass rounded-2xl p-6">
                    <h3 className="font-semibold text-lg mb-1">{g.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{g.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <span>{g.candidates.length} ứng viên</span>
                      <span>{totalVotes} phiếu</span>
                      {hasVoted && <span className="text-green-600">✓ Đã bầu</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/vote/${g.id}`} className="flex-1">
                        <Button size="sm" className="gradient-primary border-0 text-primary-foreground w-full">
                          <Vote className="w-3.5 h-3.5 mr-2" /> Bỏ phiếu
                        </Button>
                      </Link>
                      <Link to={`/dashboard/${g.id}`}>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => setAdminDeleteId(g.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Create group dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-strong border-border/50">
          <DialogHeader><DialogTitle>Tạo nhóm bầu cử mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Tên nhóm bầu cử" value={newName} onChange={e => setNewName(e.target.value)} className="bg-muted/50" />
            <Textarea placeholder="Mô tả (tùy chọn)..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-muted/50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleCreate} className="gradient-primary border-0 text-primary-foreground">Tạo nhóm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR dialog */}
      <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
        <DialogContent className="glass-strong border-border/50 max-w-sm">
          <DialogHeader><DialogTitle className="text-center">Mã QR bầu cử</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {showQR && (
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={getVoteUrl(showQR)} size={200} />
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">Quét mã QR để truy cập trang bầu cử</p>
            {showQR && (
              <Button variant="outline" size="sm" onClick={() => copyLink(showQR)}>
                <Copy className="w-3.5 h-3.5 mr-2" /> Copy link
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete own group confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhóm bầu cử?</AlertDialogTitle>
            <AlertDialogDescription>Toàn bộ dữ liệu bầu cử sẽ bị xóa. Không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin delete confirm */}
      <AlertDialog open={!!adminDeleteId} onOpenChange={() => setAdminDeleteId(null)}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhóm công khai (Admin)?</AlertDialogTitle>
            <AlertDialogDescription>Bạn đang dùng quyền admin để xóa nhóm này. Không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleAdminDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Keys Management */}
      <Dialog open={showAdminKeys} onOpenChange={setShowAdminKeys}>
        <DialogContent className="glass-strong border-border/50">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Quản lý Admin Keys</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Nhập key mới..." value={newAdminKey} onChange={e => setNewAdminKey(e.target.value)} className="bg-muted/50" />
              <Button onClick={handleCreateAdminKey} className="gradient-primary border-0 text-primary-foreground shrink-0">Tạo</Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="font-mono text-sm font-semibold">THANGCYRUS</p>
                  <p className="text-xs text-muted-foreground">Master Key — không thể hủy</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Master</span>
              </div>
              {adminKeys.map(k => (
                <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-mono text-sm">{k.key}</p>
                    <p className="text-xs text-muted-foreground">Tạo: {new Date(k.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { revokeAdminKey(k.id); toast({ title: 'Đã hủy key' }); }} className="text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {adminKeys.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có admin key phụ nào</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
