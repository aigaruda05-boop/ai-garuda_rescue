const SUPABASE_URL = "https://zzhpdcrmxiqmughywqhg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aHBkY3JteGlxbXVnaHl3cWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODQyMTQsImV4cCI6MjA5MDE2MDIxNH0.ANrTGX6cjssM8xlLe0APznv_b3X657S3pCahZCOY9ko";


const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== LOAD DATA (HOME) =====
async function loadData() {
    try {
        const { data, error } = await supabase
            .from("persons")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.log("❌ Load error:", error);
            return;
        }

        const container = document.getElementById("cards");
        if (!container) return;

        container.innerHTML = "";

        data.forEach(p => {
            container.innerHTML += `
            <div class="card">
                <img src="${p.image || 'https://via.placeholder.com/200'}">
                <h3>${p.name}</h3>
                <p>${p.date || ''}</p>
                <p>${p.colony || ''}</p>
                <button onclick="viewDetails(${p.id})">View Details</button>
            </div>
            `;
        });

        console.log("✅ Data loaded");

    } catch (err) {
        console.log("❌ Crash:", err);
    }
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

    const { data, error } = await supabase
        .from("persons")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.log("❌ Details error:", error);
        return;
    }

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


// ===== SUBMIT FORM (FIXED) =====
async function submitForm() {
    try {
        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const mobile1 = document.getElementById("mobile1").value;
        const m_state = document.getElementById("m_state").value;
        const m_district = document.getElementById("m_district").value;
        const m_village = document.getElementById("m_village").value;
        const colony = document.getElementById("colony").value;
        const description = document.getElementById("description").value;

        const fileInput = document.getElementById("image");
        const file = fileInput.files[0];

        let imageUrl = "";

        // 🔥 FIX: allow submit even without image
        if (file) {
            const fileName = Date.now() + "_" + file.name;

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(fileName, file);

            if (uploadError) {
                console.log("❌ Upload error:", uploadError);
                alert("Image upload failed");
                return;
            }

            const { data } = supabase.storage
                .from("images")
                .getPublicUrl(fileName);

            imageUrl = data.publicUrl;
        }

        // 🔥 INSERT DATA
        const { error } = await supabase.from("persons").insert([{
            name,
            age,
            mobile1,
            m_state,
            m_district,
            m_village,
            colony,
            description,
            image: imageUrl,
            date: new Date().toISOString().split("T")[0]
        }]);

        if (error) {
            console.log("❌ Insert error:", error);
            alert("Insert failed");
            return;
        }

        alert("✅ Submitted successfully!");
        window.location.href = "index.html";

    } catch (err) {
       console.log("crash;",err);
    }
  }
