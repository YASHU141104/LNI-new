// ---- DARK MODE LOGIC ----
const darkBtn = document.getElementById("darkToggleBtn");
function setDarkMode(state) {
  document.body.classList.toggle("dark-mode", state);
  localStorage.setItem("dark-mode", state ? "1" : "");
  darkBtn.textContent = state ? "Light Mode" : "Dark Mode";
}
darkBtn.onclick = () => setDarkMode(!document.body.classList.contains("dark-mode"));
(()=>{ if(localStorage.getItem("dark-mode")) setDarkMode(true); })();

// ---- SUPABASE SETUP ----
const supabase_url = "https://xyiuhejewfyqqcxxiqcd.supabase.co"; // <--- your project
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aXVoZWpld2Z5cXFjeHhpcWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODc3NTMsImV4cCI6MjA3Mzk2Mzc1M30.D2B70xr82QMgA8AoB3Aeq0AgzMeYzW6peZ1D5gpBdyc"; // <-- your anon key
const supabase = window.supabase.createClient(supabase_url, supabase_key);

// ---- FETCH AI-SUMMARIZED NEWS ----
async function getAISummarizedNews(keyword = "") {
  let query = supabase
    .from('news_ai')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  let { data: news, error } = await query;

  if (error) {
    document.getElementById("news-ai-list").innerHTML = "Error loading AI news: " + error.message;
    return;
  }
  if (keyword) {
    const key = keyword.toLowerCase();
    news = news.filter(item =>
      (item.headline && item.headline.toLowerCase().includes(key)) ||
      (item.body && item.body.toLowerCase().includes(key))
    );
  }
  renderAINews(news);
}

// ---- RENDER AI NEWS ----
function renderAINews(news) {
  let html = "";
  news.forEach(item => {
    html += `
      <div class="news-card">
        <div class="news-content">
          <h2>${item.headline || ""}</h2>
          ${item.subheading ? `<h4>${item.subheading}</h4>` : ""}
          <p>${item.body || ""}</p>
          <div class="source">
            <span>Source: </span>
            <a href="${item.source_url}" target="_blank">${item.source_name || "Original Source"}</a>
          </div>
        </div>
      </div>
    `;
  });
  document.getElementById("news-ai-list").innerHTML =
    html || "<p>No AI summaries available yet.</p>";
}

// ---- SEARCH EVENT ----
document.getElementById("searchBar").addEventListener("input", function () {
  const q = this.value.trim();
  getAISummarizedNews(q);
});

// ---- FETCH ON LOAD ----
getAISummarizedNews();
