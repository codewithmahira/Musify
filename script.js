let currentSong = new Audio();
let currentTrackName = ""; // To keep track of the current song name
let songs = []; // Moved songs to global scope

async function getSongs() {
    try {
        let a = await fetch("http://127.0.0.1:5500/songs/");
        let response = await a.text();
        console.log(response);

        let songUL = document.querySelector(".songList ul");

        // Clear the old list first
        songUL.innerHTML = "";

        let div = document.createElement('div');
        div.innerHTML = response;
        let as = div.getElementsByTagName('a');
        songs = []; // Reset songs array

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                let songName = decodeURIComponent(element.href.split("/").pop());
                songs.push(songName);

                let li = document.createElement("li");
                li.innerHTML = `
                    <img class="invert" src="music.svg" alt="Music Icon">
                    <div class="info">
                        <div>${songName}</div>
                        <div>Unknown Artist</div>
                    </div>
                    <img class="play-icon" src="play.svg" alt="Play">
                `;

                li.addEventListener("click", () => {
                    console.log(songName);
                    playMusic(songName);
                });

                songUL.appendChild(li);
            }
        }

        return songs;
    } catch (error) {
        console.error("Error fetching or parsing songs:", error);
    }
}

// Play music function
function playMusic(track) {
    currentTrackName = track;
    currentSong.src = "/songs/" + track;
    currentSong.play();

    const playButton = document.getElementById("play");
    playButton.src = "pause.svg";

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Format seconds into mm:ss
function formatTime(time) {
    if (isNaN(time)) return "00:00";
    let mins = Math.floor(time / 60);
    let secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Setup when DOM is loaded
window.addEventListener("DOMContentLoaded", async () => {
    await getSongs();

    const playButton = document.getElementById("play");

    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "pause.svg";
            document.querySelector(".songinfo").innerHTML = currentTrackName;
        } else {
            currentSong.pause();
            playButton.src = "play.svg";
        }
    });

    // Update time and circle
    currentSong.ontimeupdate = () => {
        let current = formatTime(currentSong.currentTime);
        let total = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${current} / ${total}`;

        let progressPercent = (currentSong.currentTime / currentSong.duration) * 100;
        if (!isNaN(progressPercent)) {
            document.querySelector(".circle").style.left = `${progressPercent}%`;
        }
    };

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const percent = e.offsetX / seekbar.clientWidth;
        currentSong.currentTime = percent * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Previous song button
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentTrackName);
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    // Next song button
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentTrackName);
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        }
    });
});
