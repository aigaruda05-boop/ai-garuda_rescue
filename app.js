const SUPABASE_URL = "PASTE_URL";
const SUPABASE_KEY = "PASTE_KEY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// LOAD DATA
async function loadPersons() {
  const { data } = await supabaseClient
    .from("persons")
    .select("*")
    .order("id", { ascending: false });

  displayData(data);
}

// DISPLAY
function displayData(data) {
  const container = document.getElementById("list");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h3>${p.name}</h3>
        <p>${p.m_district || ''}</p>
      </div>
    `;
  });
}

// SEARCH
async function searchPersons() {
  const value = document.getElementById("search").value;

  const { data } = await supabaseClient
    .from("persons")
    .select("*")
    .ilike("name", `%${value}%`);

  displayData(data);
}

// SUBMIT
async function submitForm(e) {
  e.preventDefault();

  const file = document.getElementById("image").files[0];

  let imageUrl = "";

  if (file) {
    const { data } = await supabaseClient.storage
      .from("images")
      .upload(Date.now() + file.name, file);

    imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;
  }

  await supabaseClient.from("persons").insert([{
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
    image: imageUrl
  }]);

  alert("Reported Successfully");
  window.location.href = "index.html";
}

 
