const dateE1 = document.getElementById('profile-date');
const DISCORD_ID = 666474255055323158n;
const audio = document.getElementById('bg-audio');
const musicE1 = document.querySelector('.music-icon');
const userE1 = document.querySelector('.user-handle');

musicE1.addEventListener("click", () => {
    if (!audio.paused) {
        audio.pause();
        musicE1.classList.remove('playing');
        return;
    }
    else {
        audio.play();
        audio.volume = 0.12;
        musicE1.classList.add('playing');
        return;
    }

})

musicE1.addEventListener("dblclick", (e) => {
    return e.currentTarget = window.open('https://open.spotify.com/track/5NtD9lIVAJLvxrF7VA6Wja?si=7171fff654b04de9', '_blank');
})

userE1.addEventListener("click", () => {
    const user = userE1.textContent;
    const result = user.slice(1);
    return copyToClipboard(result);
})

if (dateE1) {
    const td = new Date();
    dateE1.textContent = td.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}

async function updateLanStat() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const playerContainer = document.getElementById('player-container');

    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);

        const { data } = await res.json();

        if (data && data.listening_to_spotify) {
            const spotify = data.spotify;

            statusText.textContent = 'now playing . . .';
            statusDot.className = 'status-pulse-live';

            playerContainer.innerHTML = `
                    <div class="spotify-track-card">
          <img src="${spotify.album_art_url}" alt="Album Art" class="track-album-art">
          <div class="track-details">
            <p class="track-title">${spotify.song}</p>
            <p class="track-artist">${spotify.artist}</p>
          </div>
        </div>
            `;
        } else {
            statusText.textContent = 'resting';
            statusDot.className = 'status-pulse-resting';

            playerContainer.innerHTML = `
                    <div class="player-resting">
          <span class="resting-icon">💤</span>
          <p class="resting-text">resting</p>
        </div>
            `;
        }
    } catch (err) {
        console.error(err);
    }
}

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error("Clipboard API failed, trying fallback...", err);
        }
    }

    fallbackCopyTextToClipboard(text);
}

updateLanStat();
setInterval(updateLanStat, 10000);