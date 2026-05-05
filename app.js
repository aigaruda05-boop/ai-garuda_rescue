const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== LOAD HOME DATA =====
async function loadData() {
    const { data } = await supabase.from("persons").select("*");

    const container = document.getElementById("cards");
    if (!container) return;

    container.innerHTML = "";

    data.forEach(p => {
        container.innerHTML += `
        <div class="card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>${p.date}</p>
            <p>${p.colony}</p>
            <button onclick="viewDetails(${p.id})">View Details</button>
        </div>
        `;
    });
}

loadData();

// ===== VIEW DETAILS =====
function viewDetails(id) {
    window.location = "details.html?id=" + id;
}

// ===== LOAD DETAILS =====
async function loadDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    const { data } = await supabase
        .from("persons")
        .select("*")
        .eq("id", id)
        .single();

    const d = document.getElementById("details");
    if (!d) return;

    d.innerHTML = `
    <div class="card">
        <img src="${data.image}">
        <h2>${data.name}</h2>
        <p>Age: ${data.age}</p>
        <p>Mobile: ${data.mobile1}</p>
        <p>State: ${data.m_state}</p>
        <p>District: ${data.m_district}</p>
        <p>Village: ${data.m_village}</p>
        <p>Address: ${data.colony}</p>
        <p>${data.description}</p>
    </div>
    `;
}

loadDetails();

// ===== SUBMIT FORM =====
async function submitForm() {

    const file = document.getElementById("image").files[0];
    const fileName = Date.now() + file.name;

    // upload image
    await supabase.storage.from("images").upload(fileName, file);

    const { data: imgData } = supabase.storage.from("images").getPublicUrl(fileName);

    await supabase.from("persons").insert([{
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        mobile1: document.getElementById("mobile1").value,
        m_state: document.getElementById("m_state").value,
        m_district: document.getElementById("m_district").value,
        m_village: document.getElementById("m_village").value,
        colony: document.getElementById("colony").value,
        description: document.getElementById("description").value,
        image: imgData.publicUrl,
        date: new Date().toISOString().split("T")[0]
    }]);

    alert("Report submitted successfully");
    window.location = "index.html";
}
