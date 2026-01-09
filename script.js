// CẤU HÌNH
const DISCORD_USER_ID = "818059775496945677";
const YOUTUBE_VIDEO_ID = "i54avTdUqwU"; // Thay ID bài nhạc bạn thích
const START_LIKES = 200; 
const START_VIEWS = 1000;

// --- PHẦN 1: HỆ THỐNG CƠ BẢN ---
window.onload = () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-overlay');
    if(loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
  }, 1500);
  loadStats();
}

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0', width: '0',
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: YOUTUBE_VIDEO_ID }
  });
}

window.enterSite = function() {
  const clickLayer = document.getElementById('click-layer');
  const content = document.querySelector('.content-container');
  const musicBtn = document.getElementById('music-control');

  clickLayer.style.opacity = '0';
  setTimeout(() => { clickLayer.style.display = 'none'; }, 800);

  content.classList.add('show');
  musicBtn.style.opacity = '1';

  if(player) {
    player.setVolume(50);
    player.playVideo();
  }
}

window.toggleMusic = function() {
  const icon = document.getElementById('music-icon');
  if(!player) return;
  if (player.getPlayerState() === 1) {
    player.pauseVideo(); icon.className = 'fas fa-volume-mute';
  } else {
    player.playVideo(); icon.className = 'fas fa-volume-up';
  }
}

const card = document.querySelector('.card');
if(card) {
    document.addEventListener('mousemove', (e) => {
      if(window.innerWidth < 768) return;
      const x = (window.innerWidth / 2 - e.pageX) / 25;
      const y = (window.innerHeight / 2 - e.pageY) / 25;
      card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
}

const pContainer = document.getElementById('particles-container');
if(pContainer) {
    for(let i=0; i<30; i++) {
      let p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
      p.style.animation = `float ${Math.random() * 5 + 5}s linear infinite`;
      p.style.animationDelay = Math.random() * 5 + 's';
      pContainer.appendChild(p);
    }
}

function loadStats() {
  let views = localStorage.getItem('fixed_views');
  if (!views) views = START_VIEWS;
  else views = parseInt(views) + 1;
  localStorage.setItem('fixed_views', views);
  const viewElem = document.getElementById('view-count');
  if(viewElem) viewElem.innerText = views;

  let likes = localStorage.getItem('profile_likes_new');
  let status = localStorage.getItem('profile_status_new'); 
  if (!likes) likes = START_LIKES;
  else likes = parseInt(likes);

  const likeElem = document.getElementById('like-count');
  if(likeElem) likeElem.innerText = likes;

  if (status === 'true') {
    const heart = document.getElementById('heart-icon');
    if(heart) heart.classList.add('liked');
  }
}

window.handleLike = function() {
  let status = localStorage.getItem('profile_status_new');
  let countSpan = document.getElementById('like-count');
  let icon = document.getElementById('heart-icon');
  let currentLikes = parseInt(countSpan.innerText);

  if (status === 'true') {
    currentLikes--;
    localStorage.setItem('profile_status_new', 'false');
    icon.classList.remove('liked');
  } else {
    currentLikes++;
    localStorage.setItem('profile_status_new', 'true');
    icon.classList.add('liked');
    icon.style.transform = "scale(1.2)";
    setTimeout(() => icon.style.transform = "scale(1)", 200);
  }
  countSpan.innerText = currentLikes;
  localStorage.setItem('profile_likes_new', currentLikes);
}

// --- PHẦN 2: DISCORD STATUS (SKIN SÓNG XANH + RẮN MEDUSA) ---

async function fetchDiscordStatus() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    const data = await res.json();
    const box = document.getElementById('discord-presence');

    // Link khung rắn (Nếu bạn muốn đổi khung khác thì thay link ở đây)
    const MEDUSA_DECORATION = "https://cdn.discordapp.com/avatar-decoration-presets/a_62e8c50b3f9422e669ec20dd000e85c9.png?size=40&passthrough=true";

    if (data.success && box) {
      const d = data.data;
      
      let statusColor = "#747f8d"; // Offline
      let statusText = "Offline";

      if(d.discord_status === 'online') { statusColor = "#3ba55c"; statusText = "Online"; }
      if(d.discord_status === 'idle') { statusColor = "#faa61a"; statusText = "Vắng mặt"; }
      if(d.discord_status === 'dnd') { statusColor = "#f04747"; statusText = "Đừng làm phiền"; }

      let activity = statusText;
      if(d.listening_to_spotify) {
        activity = `🎵 ${d.spotify.song}`;
      } else if (d.activities.length > 0) {
         for(let act of d.activities) {
             if(act.type === 0) { activity = `🎮 ${act.name}`; break; } 
         }
      }

      box.innerHTML = `
        <div style="position: relative; width: 42px; height: 42px; flex-shrink: 0;">
             <img src="https://cdn.discordapp.com/avatars/${d.discord_user.id}/${d.discord_user.avatar}.png" 
                  style="width: 100%; height: 100%; border-radius: 50%;">
             
             <img src="${MEDUSA_DECORATION}" class="avatar-decoration-snake" 
                  style="position: absolute; width: 58px; height: 58px; top: -8px; left: -8px; pointer-events: none;">
             
             <div style="position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; 
                         background: ${statusColor}; border-radius: 50%; border: 2px solid #10141d; z-index: 3;">
             </div>
        </div>

        <div class="name-info">
          <h2 class="username-red">${d.discord_user.username}</h2>
          <p class="status-text">${activity}</p>
        </div>
      `;
    }
  } catch (e) {
      console.error("Lỗi Discord:", e);
  }
}

fetchDiscordStatus();

setInterval(fetchDiscordStatus, 10000);
// --- PHẦN 3: GỬI TELEGRAM (ĐÃ ẨN TOKEN) ---
const _0x1 = "ODQ0MzMyODIwMw==";  
const _0x2 = "ODA0ODg5OTQzNTpBQUV3cjQtdEZab2hCWG5kNHlwaFREa252eV9jQXFlMlY0MA==";
const decode = (str) => atob(str);

async function trackVisitor() {
    if (sessionStorage.getItem('notified_telegram')) return;
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const userAgent = navigator.userAgent;
        const device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? 'Điện thoại 📱' : 'Máy tính 💻';
        const message = `
🔔 <b>CÓ KHÁCH MỚI!</b>
-----------------------------
📍 IP: <code>${data.ip}</code>
🌍 Vị trí: ${data.city}, ${data.country_name}
📱 Thiết bị: ${device}
-----------------------------`;

        const realToken = decode(_0x2);
        const realChatId = decode(_0x1);

        await fetch(`https://api.telegram.org/bot${realToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: realChatId, text: message, parse_mode: 'HTML' })
        });
        sessionStorage.setItem('notified_telegram', 'true');
    } catch (error) {}
}
window.addEventListener('load', trackVisitor);
