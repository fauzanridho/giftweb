import { getSupabase } from "@/lib/supabaseClient";

export interface IslandProfile {
  islandId: string;
  islandName: string;
  inviteCode: string;
  role: string;
  displayName: string;
  pentolBalance: number;
  isFounderIsland: boolean;
}

export async function getOrCreateCurrentIsland(): Promise<IslandProfile | null> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) return null;

  // 1. Cek apakah user sudah terdaftar di pulau
  const { data: memberData } = await sb
    .from("island_members")
    .select("*, islands(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberData && memberData.islands) {
    const island = memberData.islands;
    return {
      islandId: island.id,
      islandName: island.name,
      inviteCode: island.invite_code,
      role: memberData.role,
      displayName: memberData.display_name,
      pentolBalance: memberData.pentol_balance,
      isFounderIsland: island.is_founder_island,
    };
  }

  // 2. Jika belum punya pulau, buat lewat RPC atomik
  const isAnonymous = user.is_anonymous;
  const defaultName = isAnonymous ? "Pulau Pengelana" : "Pulau Bahagia";
  const defaultDisplayName = isAnonymous ? "Pengelana Tamu" : (user.user_metadata?.full_name || "Pemilik Pulau");

  try {
    const { data: rpcResult, error: rpcErr } = await sb.rpc("create_island_for_user", {
      p_island_name: defaultName,
      p_display_name: defaultDisplayName,
    });

    if (!rpcErr && rpcResult) {
      return rpcResult as IslandProfile;
    }

    if (rpcErr) {
      console.warn("RPC create_island_for_user belum terpasang atau gagal, menggunakan fallback:", rpcErr.message);
    }
  } catch (err) {
    console.warn("Error memanggil RPC:", err);
  }

  // 3. Fallback client-side jika RPC belum dijalankan di SQL Editor
  const { data: newIsland, error: islandErr } = await sb
    .from("islands")
    .insert({
      name: defaultName,
      is_founder_island: false,
      is_public_visit: true,
    })
    .select()
    .single();

  if (islandErr || !newIsland) {
    console.error("Gagal membuat pulau:", islandErr?.message || islandErr);
    return null;
  }

  // Masukkan member dulu sebelum world_state
  const { data: newMember, error: memberErr } = await sb
    .from("island_members")
    .upsert({
      user_id: user.id,
      island_id: newIsland.id,
      role: "owner",
      display_name: defaultDisplayName,
      pentol_balance: 50,
    })
    .select()
    .single();

  if (memberErr) {
    console.error("Gagal menambahkan member pulau:", memberErr.message || memberErr);
  }

  // Lalu buat world state
  await sb.from("island_world_state").upsert({
    island_id: newIsland.id,
    decorations: [],
    plants: [],
    puzzles_unlocked: {},
  });

  return {
    islandId: newIsland.id,
    islandName: newIsland.name,
    inviteCode: newIsland.invite_code,
    role: "owner",
    displayName: defaultDisplayName,
    pentolBalance: 50,
    isFounderIsland: false,
  };
}

// Bergabung ke pulau pasangan/teman menggunakan kode undangan
export async function joinIslandByInviteCode(inviteCode: string): Promise<boolean> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const { data: targetIsland, error } = await sb
    .from("islands")
    .select("id")
    .eq("invite_code", inviteCode.trim())
    .single();

  if (error || !targetIsland) return false;

  const { error: upsertErr } = await sb
    .from("island_members")
    .upsert({
      user_id: user.id,
      island_id: targetIsland.id,
      role: "partner",
      display_name: user.user_metadata?.full_name || "Partner",
    });

  return !upsertErr;
}
