export type Artist = {
  id: number;
  name: string;
  genre: string;
  era: string | null;
  notable_work: string | null;
  created_at?: string;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at?: string;
};

export type Generation = {
  id: number;
  user_id: string;
  prompt: string;
  caption: string;
  created_at: string;
};

export type VoteValue = -1 | 1;

export type GenerationWithStats = Generation & {
  score: number;
  my_vote: VoteValue | null;
  author_name: string | null;
};
