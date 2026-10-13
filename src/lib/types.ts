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
