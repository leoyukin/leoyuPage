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
let progressInterval = null;
let currentTrackStart = null;
let currentPlaybackState = null;
let lastX = 0;
let lastY = 0;
let idleTimer;
let wanderInterval;
let tiltTimeOut;
let currentDirection = 'right';
const WAVE_HEIGHTS = [
    30, 50, 75, 40, 85, 100, 60, 45, 70, 90,
    55, 80, 100, 65, 40, 75, 95, 60, 85, 70,
    50, 65, 40, 25
];
const cThoughts = [
    "fahh . . .",
    "bluff . . .",
    "damn i love her . . .",
    "huh . . . ?",
    "uff . . .",
    "hhhh . . .",
    "wait . . . !",
    "so what are you . . .",
    "what are you so afraid of . . . ?"
];

const PROFILE_LEOYU = {
    name: "Leoyu",
    handle: "@ayoyuta",
    pfp: "public/pfp+banner/pfp7.jpg",
    banner: "public/pfp+banner/banner1.jpg"
};

const PROFILE_LILLY = {
    name: "Lilly",
    handle: "@denied",
    pfp: "public/pfp+banner/pfp33.jpg",
    banner: "public/pfp+banner/banner5.gif"
}

let isAlter = false;
let alterTimeout = null;
let switchCooldown = false;

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
            const startTime = spotify.timestamps.start;
            const endTime = spotify.timestamps.end;

            if (currentPlaybackState !== trackId) {
                currentPlaybackState = trackId;

                statusText.textContent = 'now playing';
                statusText.classList.add('py');
                statusDot.className = 'status-pulse-live';

                playerContainer.innerHTML = `
                    <div class="spotify-track-card">
            <img src="${spotify.album_art_url}" alt="Album Art" class="track-album-art album-backdrop">
                  <div class="album-sleeve">
          <img src="${spotify.album_art_url}" alt="Album Art" class="track-album-art">
      </div>
          <div class="track-details">
            <p class="track-title">${spotify.song}</p>
            <p class="track-artist">${spotify.artist}</p>
        <!-- Progress Bar & Timestamps -->
        <div class="track-progress-container">
                 <div class="track-waveform" id="track-waveform">
                         ${generateWaveformHTML()}
            </div>
            <div class="progress-times">
                <span id="time-current">0:00</span>
                <span id="time-total">0:00</span>
            </div>
        </div>
    </div>
</div>
            `;
                if (!currentTrackStart || Math.abs(currentTrackStart - startTime) > 1500) {
                    currentTrackStart = startTime;
                    startProgressTimer(startTime, endTime);
                }
            }
        } else {

            if (currentPlaybackState !== 'resting') {
                currentPlaybackState = 'resting';
                currentTrackStart = null;
                statusText.textContent = 'Sleeping . . .';
                statusDot.className = 'status-pulse-resting';
                if (progressInterval) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }

                playerContainer.innerHTML = `
  <div class="player-resting-card">
    <img src="public/status/resting-banner.gif" alt="Sleeping" class="resting-banner-img">
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

function startProgressTimer(starTime, endTime) {
    if (progressInterval)
        clearInterval(progressInterval);

    const currentTime = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const totalDuration = endTime - starTime;

    if (timeTotal) timeTotal.textContent = formatTime(totalDuration);

    const update = () => {
        const now = Date.now();

        const elapsed = Math.max(0, Math.min(now - starTime, totalDuration));
        const progressRatio = elapsed / totalDuration;

        const bars = document.querySelectorAll('.wave-bar');
        const activeIndex = Math.floor(progressRatio * bars.length);

        bars.forEach((bar, index) => {
            if (index < activeIndex) {
                bar.classList.add('played');
                bar.classList.remove('current');
            } else if (index === activeIndex) {
                bar.classList.add('played', 'current');
            } else {
                bar.classList.remove('played', 'current');
            }
        });

        if (currentTime) currentTime.textContent = formatTime(elapsed);
        if (elapsed >= totalDuration) {
            clearInterval(progressInterval);
        }
    };
    update();
    progressInterval = setInterval(update, 1000);
}


function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function generateWaveformHTML() {
    return WAVE_HEIGHTS
        .map(h => `<span class="wave-bar" style="height: ${h}%"></span>`)
        .join('');
}

function initStatusSlideshow() {
    const slides = document.querySelectorAll('.status-slide');
    if (slides.length <= 1) return;

    let currenSlideIndex = 0;

    slides.forEach((slide) => {
        slide.addEventListener('animationend', () => {
            slide.classList.remove('active');

            currenSlideIndex = (currenSlideIndex + 1) % slides.length;

            slides[currenSlideIndex].classList.add('active');
        });
    });
}

function initThoughtLoop() {
    const thoughtSpan = document.querySelector('.thought-bubble span');

    if (!thoughtSpan || cThoughts.length <= 1) return;

    let thoughtIndex = 0;

    setInterval(() => {
        thoughtSpan.classList.add('fade-out');

        setTimeout(() => {
            thoughtIndex = (thoughtIndex + 1) % cThoughts.length;
            thoughtSpan.textContent = cThoughts[thoughtIndex];
            thoughtSpan.classList.remove('fade-out')
        }, 400);

    }, 8000);
}


function applyProfile(data) {
    const userName = document.querySelector('.user-name');
    const userHandle = document.querySelector('.user-handle');
    const avatarImg = document.querySelector('.avatar-img');
    const bannerImg = document.querySelector('.banner-img');

    if (userName) userName.textContent = data.name;
    if (userHandle) userHandle.textContent = data.handle;
    if (avatarImg) avatarImg.src = data.pfp;
    if (bannerImg) bannerImg.src = data.banner;
}


function initPersonaSwitch() {
    const switchBtn = document.getElementById('persona-switch-btn');
    if (!switchBtn) return;

    switchBtn.addEventListener('click', () => {
        if (alterTimeout) clearTimeout(alterTimeout);
        if (switchCooldown) return;

        switchCooldown = true;
        switchBtn.classList.add('cooldown');

        setTimeout(() => {
            switchCooldown = false;
            switchBtn.classList.remove('cooldown');
        }, 2500);

        if (!isAlter) {
            isAlter = true;
            applyProfile(PROFILE_LILLY);
            switchBtn.classList.add('active');
            document.body.classList.add('persona-lilly');

            playSfx();
            triggerGlitch("ス イ ッ チ");

            alterTimeout = setTimeout(() => {
                isAlter = false;
                applyProfile(PROFILE_LEOYU);
                switchBtn.classList.remove('active')
                document.body.classList.remove('persona-lilly');
            }, 12000);
        }
        else {
            isAlter = false;
            applyProfile(PROFILE_LEOYU);
            switchBtn.classList.remove('active');
            document.body.classList.remove('persona-lilly');
        }

    })
}

function triggerGlitch(text) {
    const overlay = document.getElementById('screen-g');
    const label = document.getElementById('screen-p-text');
    if (!overlay || !label) return;

    label.textContent = text;
    overlay.classList.add('active');
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 1280);
}

function playSfx() {
    const sfx = document.getElementById('switch-sfx');
    if (sfx) {
        sfx.currentTime = 0;
        sfx.volume = 0.35;
        sfx.play().catch(err => console.log("Audio play error:", err));
    }
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const hidePreloader = () => {
        preloader.classList.add('loaded');
        setTimeout(() => {
            preloader.remove();
        }, 700);
    }

    window.addEventListener('load', () => {
        setTimeout((hidePreloader, 300));
    });

    setTimeout(hidePreloader, 1800);
}

initStatusSlideshow();
initPreloader();
initThoughtLoop();
updateLanStat();
initPersonaSwitch();
setInterval(updateLanStat, 10000);