export type Item = {
  id: number;
  name: string;
  description: string | null;
  size: string | null;
  category: string | null;
  image_path: string | null;
  status: "available" | "reserved";
  created_at: string;
};

export type Claim = {
  id: number;
  item_id: number;
  claimer_name: string;
  contact_info: string;
  claimed_at: string;
};

export function parseImages(imagePath: string | null): string[] {
  if (!imagePath) return [];
  try {
    const parsed = JSON.parse(imagePath);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [imagePath];
}
