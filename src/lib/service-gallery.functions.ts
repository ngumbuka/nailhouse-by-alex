import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "service-gallery";
const SIGN_TTL = 60 * 60 * 24 * 365; // 1 year

async function signMany(client: any, paths: string[]) {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const { data, error } = await client.storage.from(BUCKET).createSignedUrls(paths, SIGN_TTL);
  if (error) throw new Error(error.message);
  for (const it of data ?? []) {
    if (it?.path && it?.signedUrl) map.set(it.path, it.signedUrl);
  }
  return map;
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const listServiceGallery = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string().min(1) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("service_gallery_images")
      .select("id, slug, url, storage_path, caption, sort")
      .eq("slug", data.slug)
      .order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    const paths = (rows ?? [])
      .map((r) => r.storage_path)
      .filter((p): p is string => !!p);
    const signed = await signMany(supabaseAdmin, paths);
    return (rows ?? []).map((r) => ({
      ...r,
      url: r.storage_path && signed.get(r.storage_path) ? signed.get(r.storage_path)! : r.url,
    }));
  });

export const adminListServiceGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("service_gallery_images")
      .select("*")
      .order("slug", { ascending: true })
      .order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    const paths = (rows ?? [])
      .map((r) => r.storage_path)
      .filter((p): p is string => !!p);
    const signed = await signMany(supabaseAdmin, paths);
    return (rows ?? []).map((r) => ({
      ...r,
      url: r.storage_path && signed.get(r.storage_path) ? signed.get(r.storage_path)! : r.url,
    }));
  });

export const adminRegisterServiceGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        storagePath: z.string().min(1),
        caption: z.string().max(200).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(data.storagePath, SIGN_TTL);
    if (sErr) throw new Error(sErr.message);
    const { data: maxRow } = await supabaseAdmin
      .from("service_gallery_images")
      .select("sort")
      .eq("slug", data.slug)
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSort = (maxRow?.sort ?? -1) + 1;
    const { error } = await supabaseAdmin.from("service_gallery_images").insert({
      slug: data.slug,
      storage_path: data.storagePath,
      url: signed.signedUrl,
      caption: data.caption ?? null,
      sort: nextSort,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateServiceGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        sort: z.number().int().optional(),
        caption: z.string().max(200).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {};
    if (data.sort !== undefined) patch.sort = data.sort;
    if (data.caption !== undefined) patch.caption = data.caption;
    const { error } = await supabaseAdmin
      .from("service_gallery_images")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteServiceGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("service_gallery_images")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from(BUCKET).remove([row.storage_path]);
    }
    const { error } = await supabaseAdmin
      .from("service_gallery_images")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
