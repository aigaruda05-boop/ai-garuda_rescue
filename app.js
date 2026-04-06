console.log("App.js Loaded");

// ===== SUPABASE SETUP =====
const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== AUTH =====

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert(error.message);
  } else {
    alert("Signup successful! Now login.");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "index.html";
  }
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// ===== LOAD DATA =====

async function loadPersons() {
  const { data } = await supabase
    .from("persons")
    .select("*")
    .order("id", { ascending: false });

  const container = document.getElementById("list");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h3>${p.name}</h3>
        <p>${p.m_district || ""}</p>
        <p>Status: ${p.status}</p>
      </div>
    `;
  });
}

// ===== SEARCH =====

async function searchPersons() {
  const value = document.getElementById("search").value;

  const { data } = await supabase
    .from("persons")
    .select("*")
    .or(`name.ilike.%${value}%,m_district.ilike.%${value}%`);

  const container = document.getElementById("list");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h3>${p.name}</h3>
        <p>Status: ${p.status}</p>
      </div>
    `;
  });
}

// ===== REPORT =====

async function submitForm(e) {
  e.preventDefault();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  let imageUrl = "";

  const file = document.getElementById("image").files[0];

  if (file) {
    const { data, error } = await supabase.storage
      .from("images")
      .upload(Date.now() + file.name, file);

    if (error) {
      alert("Image upload failed");
      return;
    }

    imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;
  }

  const { error } = await supabase.from("persons").insert([{
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    mobile1: document.getElementById("mobile1").value,
    mobile2: document.getElementById("mobile2").value,
    m_state: document.getElementById("m_state").value,
    m_district: document.getElementById("m_district").value,
    m_village: document.getElementById("m_village").value,
    a_state: document.getElementById("a_state").value,
    a_district: document.getElementById("a_district").value,
    a_village: document.getElementById("a_village").value,
    colony: document.getElementById("colony").value,
    date: document.getElementById("date").value,
    description: document.getElementById("description").value,
    image: imageUrl,
    user_id: userData.user.id,
    status: "missing"
  }]);

  if (error) {
    alert(error.message);
  } else {
    alert("Reported Successfully!");
    window.location.href = "index.html";
  }
}

 
