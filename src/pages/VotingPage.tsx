import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Vote as VoteIcon, Trophy, TrendingUp, Users, XCircle, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['hsl(250, 80%, 62%)', 'hsl(190, 90%, 50%)', 'hsl(160, 70%, 45%)', 'hsl(38, 92%, 55%)', 'hsl(340, 75%, 55%)'];

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
        >
          <Star className={`w-5 h-5 ${(hover || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

export default function VotingPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, user, vote, unvote, rateCandidate } = useAppStore();
  const { toast } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showUnvote, setShowUnvote] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRatings, setShowRatings] = useState<string | null>(null);

  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy nhóm bầu cử</h2>
          <Link to="/my-groups" className="text-primary hover:underline">Quay lại</Link>
        </div>
      </AppLayout>
    );
  }

  const candidates = group.candidates;
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);
  const leader = sorted[0];
  const hasVoted = user ? !!group.votes[user.id] : false;
  const votedCandidateId = user ? group.votes[user.id] : undefined;
  const ratings = group.ratings || [];

  const getAvgRating = (candidateId: string) => {
    const cRatings = ratings.filter(r => r.candidateId === candidateId);
    if (cRatings.length === 0) return 0;
    return cRatings.reduce((s, r) => s + r.rating, 0) / cRatings.length;
  };

  const handleVote = () => {
    if (!confirmId || !groupId) return;
    const ok = vote(groupId, confirmId);
    if (ok) {
      toast({ title: 'Bỏ phiếu thành công!', description: 'Cảm ơn bạn đã tham gia.' });
    } else {
      toast({ title: 'Không thể bỏ phiếu', description: 'Bạn đã bỏ phiếu rồi.', variant: 'destructive' });
    }
    setConfirmId(null);
  };

  const handleUnvote = () => {
    if (!groupId) return;
    const ok = unvote(groupId);
    if (ok) {
      toast({ title: 'Đã hủy bầu chọn', description: 'Bạn có thể bầu cho ứng viên khác.' });
    }
    setShowUnvote(false);
  };

  const handleRate = () => {
    if (!ratingTarget || !groupId || ratingValue === 0) return;
    rateCandidate(groupId, ratingTarget, ratingValue, ratingComment);
    toast({ title: 'Đã đánh giá!' });
    setRatingTarget(null);
    setRatingValue(0);
    setRatingComment('');
  };

  // Rating chart data
  const ratingChartData = sorted.map(c => ({
    name: c.name.split(' ').pop(),
    rating: Math.round(getAvgRating(c.id) * 10) / 10,
    reviews: ratings.filter(r => r.candidateId === c.id).length,
  }));

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">{group.name}</h1>
          <p className="text-muted-foreground mb-8">{group.description || 'Chọn ứng viên bạn tin tưởng. Bạn có thể đổi phiếu bầu.'}</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Ứng viên', value: candidates.length },
            { icon: VoteIcon, label: 'Tổng phiếu', value: totalVotes },
            { icon: Trophy, label: 'Dẫn đầu', value: leader?.name.split(' ').pop() || '-' },
            { icon: TrendingUp, label: 'Tỷ lệ', value: totalVotes > 0 ? `${Math.round((leader?.voteCount / totalVotes) * 100)}%` : '0%' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <div className="text-xl font-bold">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {hasVoted && (
          <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm">Bạn đã bầu cho: <strong>{candidates.find(c => c.id === votedCandidateId)?.name}</strong></span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowUnvote(true)} className="border-destructive/50 text-destructive hover:bg-destructive/10">
              <XCircle className="w-4 h-4 mr-2" /> Hủy bầu chọn
            </Button>
          </div>
        )}

        {/* Candidate grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <AnimatePresence>
            {sorted.map((c, i) => {
              const pct = totalVotes > 0 ? (c.voteCount / totalVotes) * 100 : 0;
              const isVoted = votedCandidateId === c.id;
              const avgRating = getAvgRating(c.id);
              const ratingCount = ratings.filter(r => r.candidateId === c.id).length;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all ${i === 0 ? 'ring-1 ring-primary/30' : ''} ${isVoted ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  {i === 0 && !isVoted && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold gradient-primary text-primary-foreground">
                      #1 Dẫn đầu
                    </div>
                  )}
                  {isVoted && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white">
                      ✓ Đã chọn
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shrink-0 text-xl font-bold text-primary-foreground overflow-hidden">
                      {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" /> : c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{c.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                      {/* Rating display */}
                      <div className="flex items-center gap-2 mt-2">
                        <StarRating value={Math.round(avgRating)} readonly />
                        <span className="text-xs text-muted-foreground">
                          {avgRating > 0 ? `${avgRating.toFixed(1)}/5` : 'Chưa có'} ({ratingCount} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{c.voteCount} phiếu</span>
                      <span className="font-medium">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div className="h-full rounded-full gradient-primary" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1 gradient-primary border-0 text-primary-foreground"
                      disabled={!user || hasVoted}
                      onClick={() => setConfirmId(c.id)}
                    >
                      {isVoted ? 'Đã bầu chọn' : hasVoted ? 'Đã bỏ phiếu' : 'Bỏ phiếu'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setRatingTarget(c.id); setRatingValue(0); setRatingComment(''); }} title="Đánh giá">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowRatings(c.id)} title="Xem đánh giá">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Rating summary chart */}
        {ratings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-lg">Tổng quan đánh giá ứng viên</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingChartData}>
                <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 5]} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value}/5`, 'Đánh giá TB']}
                />
                <Bar dataKey="rating" radius={[8, 8, 0, 0]}>
                  {ratingChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Vote confirm */}
      <AlertDialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận bỏ phiếu</AlertDialogTitle>
            <AlertDialogDescription>Bạn có thể thay đổi phiếu bầu sau. Bạn có chắc chắn?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleVote} className="gradient-primary border-0 text-primary-foreground">Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unvote confirm */}
      <AlertDialog open={showUnvote} onOpenChange={setShowUnvote}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy bầu chọn?</AlertDialogTitle>
            <AlertDialogDescription>Phiếu bầu sẽ bị hủy. Bạn có thể bầu cho ứng viên khác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnvote} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hủy bầu chọn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate candidate dialog */}
      <Dialog open={!!ratingTarget} onOpenChange={() => setRatingTarget(null)}>
        <DialogContent className="glass-strong border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Đánh giá ứng viên: {candidates.find(c => c.id === ratingTarget)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Đánh giá sao</label>
              <StarRating value={ratingValue} onChange={setRatingValue} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nhận xét</label>
              <Textarea
                placeholder="Viết nhận xét về ứng viên..."
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                className="bg-muted/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingTarget(null)}>Hủy</Button>
            <Button onClick={handleRate} disabled={ratingValue === 0} className="gradient-primary border-0 text-primary-foreground">Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View ratings dialog */}
      <Dialog open={!!showRatings} onOpenChange={() => setShowRatings(null)}>
        <DialogContent className="glass-strong border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Đánh giá: {candidates.find(c => c.id === showRatings)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto py-2">
            {ratings.filter(r => r.candidateId === showRatings).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Chưa có đánh giá nào</p>
            ) : (
              ratings.filter(r => r.candidateId === showRatings).map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{r.userName}</span>
                    <StarRating value={r.rating} readonly />
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
