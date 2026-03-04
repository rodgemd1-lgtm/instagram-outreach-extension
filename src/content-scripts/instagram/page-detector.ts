export type InstagramPage =
  | 'home'
  | 'profile'
  | 'post'
  | 'dm_inbox'
  | 'dm_conversation'
  | 'dm_new'
  | 'explore'
  | 'unknown';

export interface PageInfo {
  page: InstagramPage;
  username?: string; // For profile pages
  postId?: string; // For post pages
  threadId?: string; // For DM conversations
}

export function detectPage(): PageInfo {
  const path = window.location.pathname;

  if (path === '/') {
    return { page: 'home' };
  }

  if (path === '/direct/inbox/' || path === '/direct/inbox') {
    return { page: 'dm_inbox' };
  }

  if (path === '/direct/new/' || path === '/direct/new') {
    return { page: 'dm_new' };
  }

  const dmMatch = path.match(/^\/direct\/t\/(\d+)\/?$/);
  if (dmMatch) {
    return { page: 'dm_conversation', threadId: dmMatch[1] };
  }

  const postMatch = path.match(/^\/p\/([^/]+)\/?$/);
  if (postMatch) {
    return { page: 'post', postId: postMatch[1] };
  }

  if (path.startsWith('/explore')) {
    return { page: 'explore' };
  }

  // Profile page: /username/ (no special prefix)
  const profileMatch = path.match(/^\/([a-zA-Z0-9._]+)\/?$/);
  if (profileMatch) {
    return { page: 'profile', username: profileMatch[1] };
  }

  return { page: 'unknown' };
}

// SPA Navigation Observer
export class NavigationObserver {
  private currentUrl: string = window.location.href;
  private callbacks: Array<(info: PageInfo) => void> = [];

  init() {
    // Listen for popstate (back/forward)
    window.addEventListener('popstate', () => this.onUrlChange());

    // Override pushState/replaceState
    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState(...args);
      this.onUrlChange();
    };

    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState(...args);
      this.onUrlChange();
    };

    // Fallback: observe title changes
    const titleEl = document.querySelector('title');
    if (titleEl) {
      const observer = new MutationObserver(() => this.onUrlChange());
      observer.observe(titleEl, { childList: true });
    }
  }

  onNavigate(callback: (info: PageInfo) => void) {
    this.callbacks.push(callback);
  }

  private onUrlChange() {
    const newUrl = window.location.href;
    if (newUrl !== this.currentUrl) {
      this.currentUrl = newUrl;
      const pageInfo = detectPage();
      for (const cb of this.callbacks) {
        cb(pageInfo);
      }
    }
  }
}
