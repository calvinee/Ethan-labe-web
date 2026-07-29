'use client';

import { Bookmark, Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <div className="reading-progress" style={{ width: `${progress}%` }} />;
}

export function ArticleActions({
  title,
  likes,
  comments,
  saves,
}: {
  title: string;
  likes: number;
  comments: number;
  saves: number;
}) {
  const [shared, setShared] = useState(false);

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    }
  };

  return (
    <div className="magazine-article-actions">
      <button type="button"><Heart size={18} /> {likes}</button>
      <button type="button"><MessageCircle size={18} /> {comments}</button>
      <button type="button"><Repeat2 size={18} /> {saves}</button>
      <button type="button" onClick={share}><Share2 size={18} /> {shared ? '已复制' : '分享'}</button>
      <button type="button" aria-label="收藏文章"><Bookmark size={18} /></button>
    </div>
  );
}
