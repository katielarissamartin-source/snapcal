import { supabase } from './supabase';

export type Prompt = { id: number; text: string };

function utcDayOfYear(): number {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - start) / 86_400_000);
}

// Every prompt is public and identical for the whole group, so "today's
// prompt" is just a deterministic pick from the bank — no scheduler needed,
// and it matches `posts.post_date`'s UTC-day default.
export async function getTodaysPrompt(): Promise<Prompt | null> {
  const { count } = await supabase.from('prompts').select('*', { count: 'exact', head: true });
  if (!count) return null;

  const index = utcDayOfYear() % count;
  const { data, error } = await supabase
    .from('prompts')
    .select('id, text')
    .order('id', { ascending: true })
    .range(index, index)
    .single();

  if (error) return null;
  return data;
}
