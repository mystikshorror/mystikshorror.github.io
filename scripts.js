// <![CDATA[
var videoPlayers = {};

function initVideoPlayer(containerId, videoList) {
  var container = document.getElementById(containerId);
  if (!container) return;


var html = ''
  + '<div class="playerContainer">'
  + '  <video id="video_' + containerId + '" class="videoElement" width="640" height="360" controls="controls">'
  + '    Your browser does not support video playback.'
  + '  </video>'
  + '</div>';

  container.innerHTML = html;

  var video = container.getElementsByClassName("videoElement")[0];
  var source = container.getElementsByClassName("videoSource")[0];
  var objectPlayer = container.getElementsByClassName("videoObject")[0];


  videoPlayers[containerId] = {
    video: video,
    source: source,
    object: objectPlayer,
    list: videoList
  };


  for (var first in videoList) {
    loadVideo(containerId, first);
    break;
  }
}


function loadVideo(containerId, id) {
  var player = videoPlayers[containerId];
  if (!player) return;

  var file = player.list[id];
  if (!file) return;

  var video = player.video;

  video.pause();
  video.currentTime = 0;

  video.src = file;   // IMPORTANT: direct src assignment
  video.load();

  var playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(function(e) {
      console.log("Autoplay blocked:", e);
    });
  }
}
function playVideo(containerId) {
  var player = videoPlayers[containerId];
  if (player) player.video.play();
}

function pauseVideo(containerId) {
  var player = videoPlayers[containerId];
  if (player) {
    player.video.pause();
    player.video.currentTime = player.video.currentTime;
    player.video.src = player.video.src; // force hard stop (important fix)
  }
}
function stopVideo(containerId) {
  var player = videoPlayers[containerId];
  if (player) {
    player.video.pause();
    player.video.currentTime = 0;
  }
}

// ===== Dark Mode Toggle =====
function toggleDarkMode() {
  var body = document.body;

  if (body.classList.contains("dark")) {
    body.classList.remove("dark");
    try {
      localStorage.setItem("theme", "light");
    } catch (e) {}
  } else {
    body.classList.add("dark");
    try {
      localStorage.setItem("theme", "dark");
    } catch (e) {}
  }
}

// ===== Load Saved Theme (SAFE) =====
function loadTheme() {
  try {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
    }
  } catch (e) {}
}

// Run AFTER page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadTheme);
} else {
  loadTheme();
}



function showAlert()
{
    alert(
        "SIAPA BELAKANG KAU?"
    );
}

function displayDate()
{
    var today = new Date();

    document.getElementById("dateArea").innerHTML =
        today.toDateString();
}

