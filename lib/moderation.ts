import { supabase } from './supabase';

export async function reportPost(postId: string, reporterId: string, reason: string) {
  const { error } = await supabase.from('reports').insert({ post_id: postId, reporter_id: reporterId, reason });
  if (error) throw error;
}

export async function blockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
  if (error) throw error;
}
