// Centralized selector registry. Update this file when Instagram changes its DOM.
// Priority: data-testid > aria-label > href/role > structural position > text content

export const SELECTORS = {
  // Dialog
  DIALOG: 'div[role="dialog"]',
  DIALOG_CLOSE: 'div[role="dialog"] button[aria-label="Close"]',
  DIALOG_SCROLLABLE: 'div[role="dialog"] div[style*="overflow"]',

  // Profile page
  FOLLOWERS_LINK: (username: string) => `a[href="/${username}/followers/"]`,
  FOLLOWING_LINK: (username: string) => `a[href="/${username}/following/"]`,
  PROFILE_HEADER: 'header section',
  PROFILE_NAME: 'header section h2, header section span[dir="auto"]',
  PROFILE_BIO: 'header section div > span',

  // User rows inside follower/following dialogs
  USER_ROW: 'div[role="dialog"] div[role="button"]',
  USER_LINK: 'a[role="link"]',
  USER_NAME_SPAN: 'span',

  // DM / Direct
  DM_NEW_MESSAGE: 'a[href="/direct/new/"], svg[aria-label="New message"]',
  DM_SEARCH_INPUT: 'input[placeholder="Search..."], input[name="queryBox"]',
  DM_SEND_BUTTON: 'button[type="submit"], div[role="button"]:has-text("Send")',
  DM_MESSAGE_INPUT: 'textarea[placeholder], div[contenteditable="true"][role="textbox"]',
  DM_CONVERSATION_LIST: 'div[role="listbox"], div[role="list"]',
  DM_CONVERSATION_ITEM: 'a[href*="/direct/t/"]',

  // Post page
  LIKES_SECTION: 'section a[href*="liked_by"], button span',
  COMMENTS_LIST: 'ul',
  LOAD_MORE_COMMENTS: 'button svg[aria-label="Load more comments"]',

  // Error states
  RATE_LIMIT_BANNER: 'div[role="alert"]',
  ACTION_BLOCKED_TEXT: 'Action Blocked',
  TRY_AGAIN_TEXT: 'Try Again Later',

  // Login
  LOGIN_INPUT: 'input[name="username"]',
};

// Fallback strategies
export function findByText(text: string, tag = '*'): Element | null {
  const xpath = `//${tag}[contains(text(), '${text}')]`;
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue as Element | null;
}

export function findByAriaLabel(label: string): Element | null {
  return document.querySelector(`[aria-label="${label}"]`);
}

export function findClickableByText(text: string): Element | null {
  const buttons = document.querySelectorAll('button, a, div[role="button"]');
  for (const el of buttons) {
    if (el.textContent?.trim() === text) return el;
  }
  return null;
}
