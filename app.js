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

        <button onclick="goDetails(${p.id})" class="details-btn">
          More Details
        </button>
      </div>
    `;
  });
}

// ===== REDIRECT TO DETAILS PAGE =====
function goDetails(id) {
  window.location.href = "details.html?id=" + id;
}

// ===== LOAD DETAILS PAGE =====
async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const { data, error } = await supabaseClient
    .from("persons")
    .select("*")
    .eq("id", id)
    .single();

  const container = document.getElementById("details");

  if (!container) return;

  if (error) {
    console.log(error);
    container.innerHTML = "<h3>Error loading details</h3>";
    return;
  }

  container.innerHTML = `
    <div style="max-width:500px;margin:auto;text-align:center;">
      <img src="${data.image || ''}" style="width:100%;border-radius:10px;">

      <h2>${data.name}</h2>
      <p>Age: ${data.age || ""}</p>

      <p><b>Missing Location:</b> ${data.m_state || ""}, ${data.m_district || ""}</p>
      <p><b>Address:</b> ${data.a_state || ""}, ${data.a_district || ""}</p>

      <p><b>Mobile 1:</b> ${data.mobile1 || ""}</p>
      <p><b>Mobile 2:</b> ${data.mobile2 || ""}</p>

      <p><b>Date:</b> ${data.date || ""}</p>
      <p>${data.description || ""}</p>
    </div>
  `;
}

// ===== REPORT FORM =====
async function submitForm(e) {
  e.preventDefault();

  let imageUrl = "";

  const file = document.getElementById("image").files[0];

  // Upload image
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

  // Insert into DB
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

  if (!container) return;

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

        <button onclick="goDetails(${p.id})" class="details-btn">
          More Details
        </button>
      </div>
    `;
  });
}

// ===== AUTO LOAD =====
window.onload = function () {
  if (document.getElementById("list")) {
    loadPersons();
  }

  if (document.getElementById("details")) {
    loadDetails();
  }
};
