import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, RotateCcw, Users, Vote, Copy, QrCode, ImagePlus, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function GroupManage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, user, addCandidate, deleteCandidate, resetVotes } = useAppStore();
  const { toast } = useToast();
  const [showReset, setShowReset] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const group = groups.find(g => g.id === groupId);
  const isOwner = group && user && group.ownerId === user.id;
  // Cách tạo link thông minh nhất để tránh lỗi 404 trên GitHub Pages
  const voteUrl = window.location.href.split('#')[0].split('?')[0] + '#/vote/' + groupId;

  if (!group) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy nhóm</h2>
          <Link to="/my-groups" className="text-primary hover:underline">Quay lại</Link>
        </div>
      </AppLayout>
    );
  }

  if (!isOwner) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Bạn không phải trưởng nhóm</h2>
          <Link to="/my-groups" className="text-primary hover:underline">Quay lại</Link>
        </div>
      </AppLayout>
    );
  }

  const totalVotes = group.candidates.reduce((s, c) => s + c.voteCount, 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newName.trim() || !groupId) return;
    addCandidate(groupId, newName, newDesc, newImageUrl);
    setShowAdd(false);
    setNewName('');
    setNewDesc('');
    setNewImageUrl('');
    setImagePreview('');
    toast({ title: 'Đã thêm ứng viên mới' });
  };

  const handleDelete = () => {
    if (deleteId && groupId) {
      deleteCandidate(groupId, deleteId);
      setDeleteId(null);
      toast({ title: 'Đã xóa ứng viên' });
    }
  };

  const handleReset = () => {
    if (groupId) {
      resetVotes(groupId);
      setShowReset(false);
      toast({ title: 'Đã reset tất cả phiếu bầu' });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(voteUrl);
    toast({ title: 'Đã copy link bầu cử!' });
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/my-groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">{group.name}</h1>
              <p className="text-muted-foreground text-sm">{group.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy link
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQR(true)}>
                <QrCode className="w-4 h-4 mr-2" /> QR Code
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Ứng viên', value: group.candidates.length },
            { icon: Vote, label: 'Tổng phiếu', value: totalVotes },
            { icon: Share2, label: 'Người bầu', value: Object.keys(group.votes).length },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4">
              <s.icon className="w-4 h-4 text-muted-foreground mb-2" />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button size="sm" className="gradient-primary border-0 text-primary-foreground" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm ứng viên
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowReset(true)} className="border-destructive/50 text-destructive hover:bg-destructive/10">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset phiếu
          </Button>
        </div>

        {/* Candidates */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">Danh sách ứng viên</h3>
          {group.candidates.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Chưa có ứng viên. Hãy thêm ứng viên đầu tiên!</p>
          ) : (
            <div className="space-y-3">
              {[...group.candidates].sort((a, b) => b.voteCount - a.voteCount).map(c => {
                const pct = totalVotes > 0 ? (c.voteCount / totalVotes * 100) : 0;
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center font-bold text-primary-foreground text-sm shrink-0 overflow-hidden">
                      {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" /> : c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.voteCount} phiếu · {pct.toFixed(1)}%</div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add candidate dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-strong border-border/50">
          <DialogHeader><DialogTitle>Thêm ứng viên mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Tên ứng viên" value={newName} onChange={e => setNewName(e.target.value)} className="bg-muted/50" />
            <Textarea placeholder="Mô tả..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-muted/50" />
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              <Button type="button" variant="outline" className="w-full border-dashed border-2 h-24 flex flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <><ImagePlus className="w-6 h-6 text-muted-foreground" /><span className="text-sm text-muted-foreground">Upload ảnh ứng viên</span></>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button onClick={handleAdd} className="gradient-primary border-0 text-primary-foreground">Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="glass-strong border-border/50 max-w-sm">
          <DialogHeader><DialogTitle className="text-center">Mã QR bầu cử</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={voteUrl} size={200} />
            </div>
            <p className="text-sm text-muted-foreground text-center">Chia sẻ mã QR để mọi người bầu cử</p>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="w-3.5 h-3.5 mr-2" /> Copy link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ứng viên?</AlertDialogTitle>
            <AlertDialogDescription>Không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirm */}
      <AlertDialog open={showReset} onOpenChange={setShowReset}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset tất cả phiếu bầu?</AlertDialogTitle>
            <AlertDialogDescription>Toàn bộ phiếu sẽ về 0. Không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
