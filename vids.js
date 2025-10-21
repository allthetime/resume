const videos = [
"https://vid.reid.systems/CQ-1.webm",
"https://vid.reid.systems/CQ-2.webm",
"https://vid.reid.systems/CQ-3.webm",
"https://vid.reid.systems/CQ-4.webm",
"https://vid.reid.systems/CQ-5.webm",
"https://vid.reid.systems/OTS-1.webm",
"https://vid.reid.systems/OTS-2.webm",
"https://vid.reid.systems/OTS-3.webm",
"https://vid.reid.systems/OTS-4.webm",
"https://vid.reid.systems/TRIV-1.webm",
"https://vid.reid.systems/TRIV-2.webm",
"https://vid.reid.systems/TRIV-3.webm",
"https://vid.reid.systems/TRIV-4.webm",
"https://vid.reid.systems/TRIV-5.webm",
"https://vid.reid.systems/TRIV-7.webm"
];

const vids_by_project = videos.reduce((acc, url) => {
    const project = url.split('/').pop().split('-')[0];
    if (!acc[project]) {
        acc[project] = [];
    }
    acc[project].push(url);
    return acc;
}, {});

const mediaSlotsContainers = document.querySelectorAll('.media-slots');

mediaSlotsContainers.forEach(container => {
    const projectId = container.getAttribute('data-project-id');
    const projectVideos = vids_by_project[projectId] || [];

    projectVideos.forEach(videoUrl => {
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.style.width = '150px';
        videoElement.style.height = 'auto';
        videoElement.style.margin = '5px';
        container.appendChild(videoElement);
    });
});
