export interface BookEmbed {
  title: string;
  author: string;
}

export interface ReadingContext {
  situation?: string;
  motivation?: string;
  reading_style?: string;
}

export interface Reading {
  id: string;
  user_id: string;
  book: BookEmbed;
  read_count: number;
  status: "reading" | "completed";
  start_date: string;
  completed_date?: string;
  reading_context?: ReadingContext;
  latest_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  reading_id: string;
  session_type: "before_reading" | "during_reading" | "after_reading";
  started_at: string;
  ended_at?: string;
  summary?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  input_type: "text" | "voice";
  created_at: string;
}

export interface Insight {
  id: string;
  content: string;
  type: "learning" | "impression" | "question" | "connection";
  session_ref?: string;
  created_at: string;
}

export interface UserProfile {
  life_stage?: string;
  situation?: string;
  challenges: string[];
  values: string[];
  reading_motivation?: string;
}

export interface ProfileData {
  user_id: string;
  name?: string;
  email?: string;
  current_profile: UserProfile;
  created_at?: string;
}

// --- 心境データ (Mood) ---

export interface MoodMetrics {
  energy: number; // 1-5: 活力・エネルギー
  positivity: number; // 1-5: 気分のポジティブさ
  clarity: number; // 1-5: 思考の明晰さ
  motivation: number; // 1-5: モチベーション
  openness: number; // 1-5: 開放性
}

export interface MoodData {
  id: string;
  reading_id: string;
  mood_type: "before" | "after";
  metrics: MoodMetrics;
  note?: string;
  dominant_emotion?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface MoodComparison {
  reading_id: string;
  before_mood?: MoodData;
  after_mood?: MoodData;
  changes?: {
    energy: number;
    positivity: number;
    clarity: number;
    motivation: number;
    openness: number;
  };
}

export interface MoodCreateInput {
  mood_type: "before" | "after";
  metrics: MoodMetrics;
  note?: string;
  dominant_emotion?: string;
}
