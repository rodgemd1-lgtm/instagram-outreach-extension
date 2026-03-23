"use client";

import { useEffect, useState, useCallback } from "react";
import { SCPageHeader, SCGlassCard, SCButton, SCBadge, SCPageTransition } from "@/components/sc";
import { PenLine, Calendar, Clock, Eye } from "lucide-react";

interface QueuePost {
  id: string;
  content: string;
  pillar: string;
  status: string;
  scheduledFor: string | null;
  impressions: number;
  engagementRate: number;
}

export default function ContentQueuePage() {
  const [posts, setPosts] = useState<QueuePost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts?status=queued,draft,approved");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts ?? []);
      }
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <SCPageTransition>
      <div className="space-y-6">
        <SCPageHeader
          kicker="Content Pipeline"
          title="CONTENT QUEUE"
          subtitle="Review and edit queued posts before they go live"
        />

        {loading && (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading queue…</div>
        )}

        {!loading && posts.length === 0 && (
          <SCGlassCard>
            <div className="text-center py-12 text-muted-foreground text-sm">
              No posts in queue. Head to{" "}
              <a href="/create" className="underline text-foreground">
                Content Studio
              </a>{" "}
              to create one.
            </div>
          </SCGlassCard>
        )}

        {!loading && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <SCGlassCard key={post.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {post.scheduledFor && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.scheduledFor).toLocaleDateString()}
                        </span>
                      )}
                      {post.impressions > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.impressions.toLocaleString()}
                        </span>
                      )}
                      {post.engagementRate > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.engagementRate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SCBadge variant="default">{post.status}</SCBadge>
                    <a
                      href={`/create?editPostId=${post.id}`}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
                      title="Edit post"
                    >
                      <PenLine className="w-3 h-3" />
                      Edit
                    </a>
                  </div>
                </div>
              </SCGlassCard>
            ))}
          </div>
        )}
      </div>
    </SCPageTransition>
  );
}
