console.log("App.js Loaded");

// ===== SUPABASE SETUP =====
const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== LOGIN =====
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  } else {
    alert("Login success");
    window.location.href = "index.html";
  }
}

// ===== SIGNUP =====
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signUp({ email, password });

  if (error) {
    alert(error.message);
  } else {
    alert("Signup success");
  }
}

// ===== LOAD DATA =====
async function loadPersons() {
  const { data, error } = await client
    .from("persons")
    .select("*")
    .order("id", { ascending: false });

  console.log("DATA:", data);

  const container = document.getElementById("list");
  if (!container) return;

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<h3>No data found</h3>";
    return;
  }

  data.forEach(p => {
    container.innerHTML += `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <h3>${p.name}</h3>
        <p>Status: ${p.status}</p>
      </div>
    `;
  });
}

// ===== REPORT =====
async function submitForm(e) {
  e.preventDefault();

  const { data: userData } = await client.auth.getUser();

  if (!userData.user) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  const { error } = await client.from("persons").insert([{
    name: document.getElementById("name").value,
    status: "missing",
    user_id: userData.user.id
  }]);

  if (error) {
    alert(error.message);
  } else {
    alert("Report added");
    window.location.href = "index.html";
  }
}

// ===== SEARCH =====
async function searchPersons() {
  const value = document.getElementById("search").value;

  const { data } = await client
    .from("persons")
    .select("*")
    .ilike("name", `%${value}%`);

  const container = document.getElementById("list");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <h3>${p.name}</h3>
        <p>Status: ${p.status}</p>
      </div>
    `;
  });
}
