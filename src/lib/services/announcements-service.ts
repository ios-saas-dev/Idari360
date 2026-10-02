import { createClient } from "@/lib/supabase/client";
import { Announcement } from "@/lib/supabase/types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  // date formatlama (mock datadaki gibi tr-TR)
  return data.map((ann: any) => ({
    ...ann,
    date: ann.date || new Date(ann.created_at).toLocaleDateString("tr-TR"),
  })) as Announcement[];
}

export async function createAnnouncement(
  title: string,
  content: string
): Promise<Announcement | null> {
  const supabase = createClient();
  const newAnn = {
    title,
    content,
    date: new Date().toLocaleDateString("tr-TR"),
  };

  const { data, error } = await supabase
    .from("announcements")
    .insert([newAnn])
    .select()
    .single();

  if (error) {
    console.error("Error creating announcement:", error);
    return null;
  }

  return {
    ...data,
    date: data.date || new Date(data.created_at).toLocaleDateString("tr-TR"),
  } as Announcement;
}
