console.log("App.js Loaded");

// ===== SUPABASE SETUP =====
const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== LOAD PERSONS =====
async function loadPersons() {
  const { data, error } = await supabaseClient
    .from("persons")
    .select("*")
    .order("id", { ascending: false });

  const container = document.getElementById("list");
  if (!container) return;

  container.innerHTML = "";

  if (error) {
    console.log(error);
    container.innerHTML = "<h3>Error loading data</h3>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<h3>No data found</h3>";
    return;
  }

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">

        <h3>${p.name}</h3>
        <p>Age: ${p.age || ""}</p>
        <p>Missing: ${p.m_district || ""}</p>
        <p>Status: ${p.status}</p>

        <!-- ✅ MORE DETAILS BUTTON -->
        <button onclick='viewDetails(${JSON.stringify(p)})' class="details-btn">
          More Details
        </button>
      </div>
    `;
  });
}

// ===== VIEW DETAILS =====
function viewDetails(p) {
  alert(
    "Name: " + (p.name || "") +
    "\nAge: " + (p.age || "") +
    "\nMobile1: " + (p.mobile1 || "") +
    "\nMobile2: " + (p.mobile2 || "") +
    "\nMissing: " + (p.m_state || "") + ", " + (p.m_district || "") +
    "\nAddress: " + (p.a_state || "") + ", " + (p.a_district || "") +
    "\nColony: " + (p.colony || "") +
    "\nDate: " + (p.date || "") +
    "\nDescription: " + (p.description || "")
  );
}

// ===== REPORT =====
async function submitForm(e) {
  e.preventDefault();

  let imageUrl = "";

  const file = document.getElementById("image").files[0];

  if (file) {
    const fileName = Date.now() + "-" + file.name;

    const { error: uploadError } = await supabaseClient.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      console.log(uploadError);
      alert("Image upload failed");
      return;
    }

    const { data } = supabaseClient.storage
      .from("images")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { error } = await supabaseClient.from("persons").insert([
    {
      name: document.getElementById("name").value || "",
      age: document.getElementById("age").value || "",
      mobile1: document.getElementById("mobile1").value || "",
      mobile2: document.getElementById("mobile2").value || "",
      m_state: document.getElementById("m_state").value || "",
      m_district: document.getElementById("m_district").value || "",
      m_village: document.getElementById("m_village").value || "",
      a_state: document.getElementById("a_state").value || "",
      a_district: document.getElementById("a_district").value || "",
      a_village: document.getElementById("a_village").value || "",
      colony: document.getElementById("colony").value || "",
      date: document.getElementById("date").value || null,
      description: document.getElementById("description").value || "",
      image: imageUrl,
      status: "missing"
    }
  ]);

  if (error) {
    console.log(error);
    alert("Error: " + error.message);
  } else {
    alert("Reported Successfully ✅");
    window.location.href = "index.html";
  }
}

// ===== SEARCH =====
async function searchPersons() {
  const value = document.getElementById("search").value;

  const { data } = await supabaseClient
    .from("persons")
    .select("*")
    .ilike("name", `%${value}%`);

  const container = document.getElementById("list");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<h3>No results</h3>";
    return;
  }

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">

        <h3>${p.name}</h3>
        <p>Status: ${p.status}</p>

        <button onclick='viewDetails(${JSON.stringify(p)})' class="details-btn">
          More Details
        </button>
      </div>
    `;
  });
}
