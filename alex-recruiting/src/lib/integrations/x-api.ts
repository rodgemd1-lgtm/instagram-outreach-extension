import axios from "axios";

const X_API_BASE = "https://api.twitter.com/2";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.X_API_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export interface XUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
  verified?: boolean;
  profile_image_url?: string;
}

export interface XTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  author_id?: string;
}

// Verify a coach's X handle exists and is active
export async function verifyHandle(username: string): Promise<XUser | null> {
  try {
    const response = await axios.get(
      `${X_API_BASE}/users/by/username/${username.replace("@", "")}`,
      {
        headers: getHeaders(),
        params: { "user.fields": "description,public_metrics,verified,profile_image_url" },
      }
    );
    return response.data.data || null;
  } catch {
    return null;
  }
}

// Get a user's followers (to track coach follow-backs)
export async function getFollowers(userId: string, maxResults: number = 100): Promise<XUser[]> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/${userId}/followers`, {
      headers: getHeaders(),
      params: {
        max_results: Math.min(maxResults, 1000),
        "user.fields": "description,public_metrics,verified",
      },
    });
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Get a user's following list (to see which coaches a recruit follows)
export async function getFollowing(userId: string, maxResults: number = 100): Promise<XUser[]> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/${userId}/following`, {
      headers: getHeaders(),
      params: {
        max_results: Math.min(maxResults, 1000),
        "user.fields": "description,public_metrics,verified",
      },
    });
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Search recent tweets by hashtag or keyword
export async function searchTweets(query: string, maxResults: number = 25): Promise<XTweet[]> {
  try {
    const response = await axios.get(`${X_API_BASE}/tweets/search/recent`, {
      headers: getHeaders(),
      params: {
        query,
        max_results: Math.min(maxResults, 100),
        "tweet.fields": "created_at,public_metrics,author_id",
      },
    });
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Post a tweet (requires OAuth 2.0 user context — placeholder for implementation)
export async function postTweet(text: string, mediaId?: string): Promise<{ id: string } | null> {
  try {
    const body: Record<string, unknown> = { text };
    if (mediaId) {
      body.media = { media_ids: [mediaId] };
    }

    const response = await axios.post(`${X_API_BASE}/tweets`, body, {
      headers: getHeaders(),
    });
    return response.data.data || null;
  } catch (error) {
    console.error("Failed to post tweet:", error);
    return null;
  }
}

// Send a DM (requires OAuth 2.0 user context)
export async function sendDM(
  recipientId: string,
  text: string
): Promise<{ id: string } | null> {
  try {
    const response = await axios.post(
      `${X_API_BASE}/dm_conversations/with/${recipientId}/messages`,
      { text },
      { headers: getHeaders() }
    );
    return response.data.data || null;
  } catch (error) {
    console.error("Failed to send DM:", error);
    return null;
  }
}

// Get user's tweet analytics (requires user auth)
export async function getUserTweets(
  userId: string,
  maxResults: number = 20
): Promise<XTweet[]> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/${userId}/tweets`, {
      headers: getHeaders(),
      params: {
        max_results: Math.min(maxResults, 100),
        "tweet.fields": "created_at,public_metrics",
      },
    });
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Check if a specific user follows another (coach follow-back detection)
export async function checkFollowRelationship(
  sourceUserId: string,
  targetUserId: string
): Promise<{ following: boolean; followed_by: boolean }> {
  try {
    const response = await axios.get(
      `${X_API_BASE}/users/${sourceUserId}/following`,
      {
        headers: getHeaders(),
        params: { "user.fields": "id" },
      }
    );
    const following = (response.data.data || []).some(
      (u: XUser) => u.id === targetUserId
    );
    return { following, followed_by: false }; // Need reverse check for followed_by
  } catch {
    return { following: false, followed_by: false };
  }
}
