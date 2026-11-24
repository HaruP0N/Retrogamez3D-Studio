import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "images";

async function sign<T extends { image_path: string | null }>(rows: T[]) {
  const paths = rows.map((r) => r.image_path).filter((p): p is string => !!p);
  if (!paths.length) return rows.map((r) => ({ ...r, image_url: null as string | null }));
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 7);
  const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return rows.map((r) => ({ ...r, image_url: (r.image_path && map.get(r.image_path)) || null }));
}

export const productsQuery = (all = false) =>
  queryOptions({
    queryKey: ["products", all],
    queryFn: async () => {
      let q = supabase.from("products").select("*").order("sort_order").order("created_at");
      if (!all) q = q.eq("visible", true);
      const { data, error } = await q;
      if (error) throw error;
      return sign(data);
    },
  });

export const galleryQuery = () =>
  queryOptions({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return sign(data);
    },
  });

export async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export const utilizables = (f: { nuevo: number; medio: number }) => f.nuevo + f.medio;
