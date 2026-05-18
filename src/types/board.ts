// ── DB から取得する型 ────────────────────────────────────────
export interface Team {
  id: string
  name: string
  slug: string
  league: string
  logo_url: string | null
  is_active: boolean
}

export interface PostSummary {
  id: string
  team_id: string
  title: string
  likes: number
  dislikes: number
  comment_count: number
  is_popular: boolean
  created_at: string
}

export interface PostDetail extends PostSummary {
  content: string
}

export interface BoardComment {
  id: string
  post_id: string
  content: string
  created_at: string
}

// ── API Request 型 ───────────────────────────────────────────
export interface CreatePostBody {
  team_id: string
  title: string
  content: string
  anon_id: string
}

export interface CreateCommentBody {
  content: string
  anon_id: string
}

export interface VoteBody {
  vote_type: 'like' | 'dislike'
  anon_id: string
}

// ── API Response 型 ──────────────────────────────────────────
export interface ApiError {
  error: string
  code:
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'TEAM_NOT_FOUND'
    | 'SERVER_ERROR'
}

export interface TeamsResponse         { teams: Team[] }
export interface PostsResponse         { posts: PostSummary[]; total: number }
export interface PostDetailResponse    { post: PostDetail; comments: BoardComment[] }
export interface CreatePostResponse    { post: { id: string } }
export interface CreateCommentResponse { comment: { id: string } }
export interface VoteResponse {
  vote_type: 'like' | 'dislike'
  likes: number
  dislikes: number
}
