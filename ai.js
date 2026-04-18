// ===== AI BACKGROUND SYSTEM =====

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

const aiClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAIDetections() {
  try {
    const { data, error } = await aiClient
      .from("detections")
      .select("*")
      .order("id", { ascending: false })
      .limit(5);

    if (error) {
      console.error("AI Error:", error);
      return;
    }

    window.aiDetections = data;

    console.log("AI Running...", data);

  } catch (err) {
    console.error("Unexpected:", err);
  }
}

setInterval(fetchAIDetections, 3000);
fetchAIDetections(); 
