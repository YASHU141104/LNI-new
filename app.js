// DARK MODE
const darkBtn = document.getElementById("darkToggleBtn");
function setDarkMode(state) {
  document.body.classList.toggle("dark-mode", state);
  localStorage.setItem("dark-mode", state ? "1" : "");
  darkBtn.textContent = state ? "Light Mode" : "Dark Mode";
}
darkBtn.onclick = () => setDarkMode(!document.body.classList.contains("dark-mode"));
(()=>{ if(localStorage.getItem("dark-mode")) setDarkMode(true); })();

// High Court List
const highCourtList = [
  "Allahabad High Court", "Andhra Pradesh High Court", "Bombay High Court", "Calcutta High Court", "Chhattisgarh High Court", "Delhi High Court", "Gauhati High Court", "Gujarat High Court", "Himachal Pradesh High Court", "Jammu & Kashmir High Court", "Jharkhand High Court", "Karnataka High Court", "Kerala High Court", "Madhya Pradesh High Court", "Madras High Court", "Manipur High Court", "Meghalaya High Court", "Orissa High Court", "Patna High Court", "Punjab & Haryana High Court", "Rajasthan High Court", "Sikkim High Court", "Telangana High Court", "Tripura High Court", "Uttarakhand High Court"
];
let selectedTab = "all";
let selectedHC = null;

function setTab(cat, hcName=null) {
  selectedTab = cat;
  selectedHC = cat==="high"?hcName:null;
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.classList.toggle("active",btn.dataset.category===cat));
  renderHighCourtTabs(cat==="high"?hcName:null);
  renderApp();
}

function renderHighCourtTabs(active=null) {
  const hctabs = document.getElementById("highCourtTabs");
  if(selectedTab!=="high") { hctabs.style.display = "none"; return; }
  hctabs.style.display='flex';
  let html = '';
  highCourtList.forEach(hc=>{
    html += `<button class="hc-btn${active===hc?' active':''}" data-hc="${hc}">${hc}</button>`;
  });
  hctabs.innerHTML = html;
  hctabs.querySelectorAll(".hc-btn").forEach(btn=>
    btn.onclick = ()=>{ setTab("high",btn.dataset.hc);}
  );
}
document.getElementById("categoryTabs").querySelectorAll(".tab-btn").forEach(btn=>
  btn.onclick=()=>setTab(btn.dataset.category)
);

// SUPABASE SETUP (Set your own values below)
const supabase_url = "https://xyiuhejewfyqqcxxiqcd.supabase.co";
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5aXVoZWpld2Z5cXFjeHhpcWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODc3NTMsImV4cCI6MjA3Mzk2Mzc1M30.D2B70xr82QMgA8AoB3Aeq0AgzMeYzW6peZ1D5gpBdyc";
const supabase = window.supabase.createClient(supabase_url, supabase_key);

let allNews = [];
let currentSearch = "";

function setStatus(msg) { document.getElementById("statusMsg").textContent = msg || ""; }
function cleanDesc(desc) {
  if (!desc) return "";
  const text = desc.replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
  return text.length > 180 ? text.slice(0, 180)+"..." : text;
}
function formatPubDate(pubdate) {
  if (!pubdate) return "";
  let d = new Date(pubdate);
  return d.toLocaleString();
}

// Filtering for Tabs & Search
function filterNews(all, searchStr) {
  let filtered = all;
  // Tabs
  if(selectedTab==="supreme") {
    filtered = filtered.filter(item=>item.title?.toLowerCase().includes("supreme court"));
  }
  else if(selectedTab==="high") {
    filtered = filtered.filter(item=>item.title?.toLowerCase().includes("high court"));
    if(selectedHC)
      filtered = filtered.filter(item=>item.title?.toLowerCase().includes(selectedHC.toLowerCase()));
  }
  else if(selectedTab==="other") {
    filtered = filtered.filter(item=>
      !item.title?.toLowerCase().includes("high court") &&
      !item.title?.toLowerCase().includes("supreme court")
    );
  }
  // Search
  if(searchStr) {
    const q = searchStr.toLowerCase();
    filtered = filtered.filter(item=>
      (item.title?.toLowerCase().includes(q)) ||
      (item.description?.toLowerCase().includes(q))
    );
  }
  return filtered.sort((a,b)=>new Date(b.pubdate)-new Date(a.pubdate));
}

// Render
function renderApp() {
  const filtered = filterNews(allNews, currentSearch);
  let html = '';
  filtered.forEach(item=>{
    html += `<div class='news-card'>
      <div class='news-content'>
        <h2>${item.title||""}</h2>
        <div style="font-size:0.85em; color:#666;">${formatPubDate(item.pubdate)}</div>
        <p>${cleanDesc(item.description)}</p>
        <div><a href="${item.link}" target="_blank">Read full news</a></div>
      </div>
    </div>`;
  });
  document.getElementById("law-news").innerHTML = html || "<p>No news found.</p>";
}

async function getAllNews() {
  setStatus("Loading news...");
  let { data: news, error } = await supabase
    .from("news_ai") // Make sure your Supabase table name matches
    .select("*")
    .order("pubdate",{ascending:false})
    .limit(200);
  if(error) setStatus("Supabase error: "+error.message);
  allNews = news||[];
  renderApp();
}
document.getElementById("searchBar").addEventListener("input",function(){
  currentSearch = this.value.trim();
  renderApp();
});

getAllNews();
renderHighCourtTabs();

