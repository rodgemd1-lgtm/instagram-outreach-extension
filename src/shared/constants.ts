// Rate limiting defaults
export const DEFAULT_DAILY_LIMIT = 60;
export const DEFAULT_MIN_DELAY_MS = 45_000; // 45 seconds
export const DEFAULT_MAX_DELAY_MS = 120_000; // 2 minutes
export const DEFAULT_ACTIVE_HOURS_START = 8; // 8 AM
export const DEFAULT_ACTIVE_HOURS_END = 22; // 10 PM
export const DAILY_LIMIT_VARIANCE = 0.15; // +/- 15%

// Alarm names
export const ALARM_CAMPAIGN_TICK = 'campaign-tick';
export const ALARM_INBOX_CHECK = 'inbox-check';
export const ALARM_DAILY_RESET = 'daily-reset';

// Alarm intervals (minutes)
export const CAMPAIGN_TICK_INTERVAL = 1;
export const INBOX_CHECK_INTERVAL = 5;
export const DAILY_RESET_INTERVAL = 1440; // 24 hours

// Scraping defaults
export const SCROLL_DELAY_MIN = 800;
export const SCROLL_DELAY_MAX = 2500;
export const SCROLL_AMOUNT_MIN = 200;
export const SCROLL_AMOUNT_MAX = 500;
export const MAX_NO_NEW_ITEMS = 3;
export const SCRAPE_BATCH_SIZE = 50;

// Typing simulation
export const TYPING_DELAY_MIN = 50;
export const TYPING_DELAY_MAX = 180;
export const CLICK_DELAY_MIN = 200;
export const CLICK_DELAY_MAX = 600;

// Campaign execution
export const MAX_RETRY_COUNT = 3;
export const DM_SEND_TIMEOUT = 60_000; // 60 seconds
export const MAX_CAMPAIGN_STEPS = 10;
export const MAX_VARIANTS_PER_STEP = 5;

// Jitter
export const JITTER_FACTOR = 0.2; // +/- 20%
