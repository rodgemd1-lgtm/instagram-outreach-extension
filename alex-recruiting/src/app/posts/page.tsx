"use client";

import { PostQueue } from "@/components/post-queue";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post Queue</h1>
        <p className="text-sm text-slate-500">Alex-drafted posts awaiting parent approval — approve, edit, or reject before publishing</p>
      </div>
      <PostQueue />
    </div>
  );
}
