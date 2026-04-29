// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";

const aiClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let lastId = null;

// ===== FETCH DETECTIONS =====
async function fetchAIDetections() {
  try {
    const { data, error } = await aiClient
      .from("detections")
      .select("*")
      .order("id", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    if (!data || data.length === 0) return;

    const latest = data[0];

    // New detection check
    if (latest.id !== lastId) {
      lastId = latest.id;

      console.log("🚨 ALERT:", latest.name);

      // Popup alert
      alert("🚨 " + latest.name + " detected!");
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

// Run every 3 seconds
setInterval(fetchAIDetections, 3000);

// Run once initially
fetchAIDetections();
