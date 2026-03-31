const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "sb_publishable_d0BTr8vU0tNDpjNyJ1-SbQ_mcMOgJvK";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= AUTH =================

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert(error.message);
  } else {
    alert("Account created! Now login.");
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

// ================= LOAD =================

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

// ================= SEARCH =================

async function searchPersons() {
  const value = document.getElementById("search").value;

  const { data } = await supabase
    .from("persons")
    .select("*")
    .or(`name.ilike.%${value}%,m_district.ilike.%${value}%`);

  displayCustom(data);
}

function displayCustom(data) {
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

// ================= REPORT =================

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

// ================= MY REPORTS =================

async function loadMyReports() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    window.location.href = "login.html";
    return;
  }

  const { data } = await supabase
    .from("persons")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("id", { ascending: false });

  const container = document.getElementById("list");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<h3>No reports yet</h3>";
    return;
  }

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h3>${p.name}</h3>
        <p>Status: ${p.status}</p>

        <button onclick="markFound(${p.id})">Mark Found</button>
        <button onclick="deletePerson(${p.id})">Delete</button>
      </div>
    `;
  });
}

// ================= DELETE =================

async function deletePerson(id) {
  await supabase.from("persons").delete().eq("id", id);
  alert("Deleted");
  location.reload();
}

// ================= MARK FOUND =================

async function markFound(id) {
  await supabase.from("persons")
    .update({ status: "found" })
    .eq("id", id);

  alert("Marked as found");
  location.reload();
}

 
