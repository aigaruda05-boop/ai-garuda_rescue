const SUPABASE_URL = "YOUR_URL";
const SUPABASE_KEY = "YOUR_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= AUTH =================

// SIGNUP
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await supabase.auth.signUp({ email, password });
  alert("Account created!");
}

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    window.location.href = "index.html";
  } else {
    alert("Login failed");
  }
}

// LOGOUT
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// ================= LOAD =================

async function loadPersons() {
  const { data } = await supabase
    .from("persons")
    .select("*")
    .order("id", { ascending: false });

  displayData(data);
}

function displayData(data) {
  const container = document.getElementById("list");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h3>${p.name}</h3>
        <p>${p.m_district || ''}</p>
        <p>Status: ${p.status}</p>

        <button onclick="viewDetails(${p.id})">View</button>
      </div>
    `;
  });
}

// ================= SEARCH =================

async function searchPersons() {
  const value = document.getElementById("search").value;

  const { data } = await supabase
    .from("persons")
    .select("*")
    .or(`name.ilike.%${value}%,m_district.ilike.%${value}%`);

  displayData(data);
}

// ================= ADD =================

async function submitForm(e) {
  e.preventDefault();

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    alert("Please login first");
    return;
  }

  const file = document.getElementById("image").files[0];
  let imageUrl = "";

  if (file) {
    const { data } = await supabase.storage
      .from("images")
      .upload(Date.now() + file.name, file);

    imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;
  }

  await supabase.from("persons").insert([{
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
    user_id: user.user.id,
    status: "missing"
  }]);

  alert("Reported!");
  window.location.href = "index.html";
}

// ================= DETAILS =================

async function viewDetails(id) {
  localStorage.setItem("personId", id);
  window.location.href = "details.html";
}

// ================= DETAILS PAGE =================

async function loadDetails() {
  const id = localStorage.getItem("personId");

  const { data } = await supabase
    .from("persons")
    .select("*")
    .eq("id", id)
    .single();

  document.getElementById("details").innerHTML = `
    <h2>${data.name}</h2>
    <img src="${data.image}" width="200">
    <p>${data.description}</p>
    <p>Status: ${data.status}</p>
    <button onclick="markFound(${data.id})">Mark Found</button>
    <button onclick="deletePerson(${data.id})">Delete</button>
  `;
}

// ================= DELETE =================

async function deletePerson(id) {
  await supabase.from("persons").delete().eq("id", id);
  alert("Deleted");
  window.location.href = "index.html";
}

// ================= MARK FOUND =================

async function markFound(id) {
  await supabase.from("persons")
    .update({ status: "found" })
    .eq("id", id);

  alert("Marked as found");
  location.reload();
}

 
