const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------- LOAD PERSONS ----------------------

async function loadPersons() {
  const container = document.getElementById("persons-container");
  if (!container) return;

  const { data, error } = await supabase.from("persons").select("*");

  container.innerHTML = "";

  data.forEach(person => {
    container.innerHTML += `
      <div class="card">
        <img src="${person.photo_url}" />
        <h3>${person.name}</h3>
        <p>Missing Date: ${new Date(person.created_at).toLocaleDateString()}</p>
        <p>${person.address}</p>
        <a href="details.html?id=${person.id}" class="details-btn">See More</a>
      </div>
    `;
  });
}

// ---------------------- SUBMIT FORM ----------------------

const form = document.getElementById("reportForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("photo").files[0];

    // upload image
    const { data: imgData } = await supabase.storage
      .from("photos")
      .upload(`public/${Date.now()}-${file.name}`, file);

    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${imgData.path}`;

    // insert data
    await supabase.from("persons").insert([{
      name: document.getElementById("name").value,
      age: document.getElementById("age").value,
      phone: document.getElementById("phone").value,
      last_seen: document.getElementById("last_seen").value,
      address: document.getElementById("address").value,
      description: document.getElementById("description").value,
      photo_url: imageUrl
    }]);

    alert("Reported successfully!");
    window.location.href = "index.html";
  });
}

// ---------------------- DETAILS PAGE ----------------------

async function loadDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const { data } = await supabase
    .from("persons")
    .select("*")
    .eq("id", id)
    .single();

  const container = document.getElementById("details");

  container.innerHTML = `
    <img src="${data.photo_url}" class="detail-img"/>
    <h2>${data.name}</h2>
    <p><b>Age:</b> ${data.age}</p>
    <p><b>Phone:</b> ${data.phone}</p>
    <p><b>Last Seen:</b> ${data.last_seen}</p>
    <p><b>Address:</b> ${data.address}</p>
    <p><b>Description:</b> ${data.description}</p>
  `;
}

// ---------------------- INIT ----------------------

loadPersons();
loadDetails();
