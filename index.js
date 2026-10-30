const dateE1 = document.getElementById('profile-date');
const DISCORD_ID = '666474255055323158';
const audio = document.getElementById('bg-audio');
const musicE1 = document.querySelector('.music-icon');
const userE1 = document.querySelector('.user-handle');
const toastContainer = document.querySelector('.toast-container');
let notiGuard = false;
const mouseFollow = document.querySelector('.ambient-glow');
const mouseBear = document.querySelector('.mouse-bear');
const mouseIcon = document.querySelector('.mouse-f');
const bearImg = document.querySelector('.mouse-f img');
let currentPlaybackState = null;
let lastX = 0;
let lastY = 0;
let idleTimer;
let wanderInterval;
let tiltTimeOut;
let currentDirection = 'right';

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

window.addEventListener('pointermove', (e) => {
    mouseFollow.style.opacity = '1';
    mouseBear.style.opacity = '1';
    mouseIcon.classList.remove('idle');
    mouseFollow.classList.remove('wandering');
    mouseBear.classList.remove('wandering');
    const x = e.clientX;
    const y = e.clientY;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        mouseIcon.classList.add('idle');
        startWondering();


    }, 4500);

    mouseFollow.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    mouseBear.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;

    if (x < lastX) {
        bearImg.style.transform = 'scaleX(-1) rotate(-15deg)';
        currentDirection = 'left';
    }
    else if (x > lastX) {
        bearImg.style.transform = 'scaleX(1) rotate(15deg)';
        currentDirection = 'right';
    }
    lastX = x;
    lastY = y;

    clearTimeout(tiltTimeOut);
    tiltTimeOut = setTimeout(() => {
        bearImg.style.transform = 'rotate(0deg)';
        if (currentDirection === 'right') {
            bearImg.style.transform = 'scaleX(1) rotate(0)';
        }
        else if (currentDirection === 'left') {
            bearImg.style.transform = 'scaleX(-1) rotate(0)';
        }
    }, 100);

    stopWandering();
})

function startWondering() {
    mouseFollow.classList.add('wandering');
    mouseBear.classList.add('wandering');
    wanderInterval = setInterval(() => {

        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;

        const targetX = lastX + offsetX;
        const targetY = lastY + offsetY;

        mouseFollow.style.transform = `translate(calc(${targetX}px - 50%), calc(${targetY}px - 50%))`;
        mouseBear.style.transform = `translate(calc(${targetX}px - 50%), calc(${targetY}px - 50%))`;

        if (offsetX < 0) {
            bearImg.style.transform = 'scaleX(-1) rotate(-12deg)';

        }
        else {
            bearImg.style.transform = 'scaleX(1) rotate(12deg)';

        }

        setTimeout(() => {
            const face = offsetX < 0 ? 'scaleX(-1)' : 'scaleX(1)';
            bearImg.style.transform = `${face} rotate(0deg)`
        }, 2000);
    }, 3500);

}

function stopWandering() {
    mouseFollow.classList.remove('wandering');
    mouseBear.classList.remove('wandering');
    clearInterval(wanderInterval);
}

document.documentElement.addEventListener('pointerleave', () => {
    mouseFollow.style.opacity = '0';
    mouseBear.style.opacity = '0';
})

window.addEventListener("mousedown", () => mouseIcon.classList.add("mouse-active"));
window.addEventListener("mouseup", () => mouseIcon.classList.remove("mouse-active"));

musicE1.addEventListener("dblclick", () => {
    if (notiGuard) return;
    createCToast("Open Spotify?", () => {
        window.open('https://open.spotify.com/track/5NtD9lIVAJLvxrF7VA6Wja?si=7171fff654b04de9', '_blank');
    });
});

userE1.addEventListener("click", () => {
    if (notiGuard) return;
    const user = userE1.textContent;
    const result = user.slice(1);
    createToast("Copied to clipboard!");
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
            const trackId = data.spotify.track_id;

            if (currentPlaybackState !== trackId) {
                currentPlaybackState = trackId;

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
            }
        } else {

            if (currentPlaybackState !== 'resting') {
                currentPlaybackState = 'resting';
                statusText.textContent = 'Sleeping . . .';
                statusDot.className = 'status-pulse-resting';

                playerContainer.innerHTML = `
  <div class="player-resting-card">
    <img src="public/status/resting-banner.jpg" alt="Sleeping" class="resting-banner-img">
    <div class="resting-banner-overlay">
    </div>
  </div>
`;
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }

    } catch (err) {
        console.error("Clipboard api failed.", err)
    }
}

function createToast(message) {
    if (notiGuard) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
    <span id="toast">${message}</span>
    `
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show')
    }, 10);

    notiGuard = true;

    return setTimeout(() => {
        toast.classList.remove('show');
        notiGuard = false;
        setTimeout(() => toast.remove(), 250);

    }, 3000);



}

function createCToast(message, onConfirm) {
    const cToast = document.createElement('div');
    cToast.className = 'toast-conf';
    cToast.innerHTML = `
            <span id="c-message">${message}</span>
        <button class="t-btn confirm">Confirm</button>
        <button class="t-btn cancel">Cancel</button>
    `;
    toastContainer.appendChild(cToast);
    setTimeout(() => {
        cToast.classList.add('show');
    }, 10);

    notiGuard = true;
    const confirmBtn = cToast.querySelector('.confirm');
    const cancelBtn = cToast.querySelector('.cancel');

    const closeToast = () => {
        cToast.classList.remove('show');
        setTimeout(() => {
            cToast.remove();

        }, 250);
    }

    cancelBtn.addEventListener('click', () => {
        closeToast();
        notiGuard = false;
    });

    confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        notiGuard = false
        closeToast();
    })

}


updateLanStat();
setInterval(updateLanStat, 10000);