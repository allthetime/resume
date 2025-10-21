document.addEventListener('DOMContentLoaded', function() {
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
    "https://vid.reid.systems/TRIV-7.webm",
    "https://vid.reid.systems/CASCA-1.mp4"
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

        // Create scroll wrapper
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'video-scroll-wrapper';
        
        // Create scroll container
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'video-scroll-container';
        
        // Create navigation arrows
        const leftArrow = document.createElement('button');
        leftArrow.className = 'video-nav-arrow left';
        leftArrow.innerHTML = '‹';
        leftArrow.onclick = () => {
            scrollContainer.scrollBy({ left: -160, behavior: 'smooth' });
        };
        
        const rightArrow = document.createElement('button');
        rightArrow.className = 'video-nav-arrow right';
        rightArrow.innerHTML = '›';
        rightArrow.onclick = () => {
            scrollContainer.scrollBy({ left: 160, behavior: 'smooth' });
        };

        projectVideos.forEach((videoUrl, index) => {
            const videoWrapper = document.createElement('div');
            videoWrapper.className = 'video-thumbnail';
            
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.preload = 'metadata';
            videoElement.muted = true;
            videoElement.playsInline = true; // Critical for iOS
            videoElement.setAttribute('playsinline', ''); // Alternative attribute for older iOS
            
            // Add loading state
            videoWrapper.classList.add('loading');
            
            let thumbnailLoaded = false;
            
            // iOS-friendly thumbnail loading
            const loadThumbnail = async () => {
                if (thumbnailLoaded) return;
                
                try {
                    videoWrapper.classList.remove('loading');
                    
                    // For iOS, we need to load and briefly play the video to show a frame
                    if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
                        thumbnailLoaded = true;
                        
                        // Try to seek to a frame - wrapped in try/catch for iOS
                        try {
                            videoElement.currentTime = 0.1;
                        } catch (e) {
                            // On iOS, try playing then immediately pausing
                            try {
                                await videoElement.play();
                                videoElement.pause();
                            } catch (playErr) {
                                // If play fails, at least we tried
                                console.log('Thumbnail generation limited on this device');
                            }
                        }
                    }
                } catch (e) {
                    console.log('Thumbnail load attempt:', e);
                }
            };
            
            // Multiple event listeners for cross-browser compatibility
            videoElement.addEventListener('loadedmetadata', loadThumbnail);
            videoElement.addEventListener('loadeddata', loadThumbnail);
            videoElement.addEventListener('canplay', loadThumbnail);
            
            // Fallback: Remove loading state after timeout
            setTimeout(() => {
                if (!thumbnailLoaded) {
                    videoWrapper.classList.remove('loading');
                    loadThumbnail();
                }
            }, 2000);
            
            // Handle errors
            videoElement.addEventListener('error', () => {
                console.error('Failed to load video:', videoUrl);
                videoWrapper.classList.add('error');
                videoWrapper.classList.remove('loading');
            });
            
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            
            const playButton = document.createElement('div');
            playButton.className = 'circle-button play-button';
            playButton.textContent = '▶';
            
            overlay.appendChild(playButton);
            videoWrapper.appendChild(videoElement);
            videoWrapper.appendChild(overlay);
            
            // Click handler to open modal
            videoWrapper.onclick = () => {
                openVideoModal(projectVideos, index);
            };
            
            scrollContainer.appendChild(videoWrapper);
        });
        
        scrollWrapper.appendChild(leftArrow);
        scrollWrapper.appendChild(scrollContainer);
        scrollWrapper.appendChild(rightArrow);
        container.appendChild(scrollWrapper);
        
        // Check if scrolling is needed and hide/show arrows accordingly
        function updateArrowVisibility() {
            const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth;
            leftArrow.style.display = hasOverflow ? 'flex' : 'none';
            rightArrow.style.display = hasOverflow ? 'flex' : 'none';
        }
        
        updateArrowVisibility();
        window.addEventListener('resize', updateArrowVisibility);
    });

    // Modal functionality
    function openVideoModal(videos, startIndex) {
        let currentIndex = startIndex;
        let autoplayEnabled = true;
        
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        const closeBtn = document.querySelector('.modal-close');
        const prevBtn = document.querySelector('.modal-nav.prev');
        const nextBtn = document.querySelector('.modal-nav.next');
        const counter = document.querySelector('.modal-counter');
        
        // Ensure playsInline is set for iOS
        modalVideo.playsInline = true;
        modalVideo.setAttribute('playsinline', '');
        
        function loadVideo(index) {
            currentIndex = index;
            modalVideo.src = videos[index];
            modalVideo.controls = false;
            modalVideo.load(); // Force reload to ensure it's fresh
            
            // Show loading state
            modal.classList.add('loading');
            
            // Wait for video to be ready before playing
            const canPlayHandler = () => {
                modal.classList.remove('loading');
                modalVideo.play().catch(err => {
                    console.error('Play failed:', err);
                    modalVideo.controls = true;
                });
                modalVideo.removeEventListener('canplay', canPlayHandler);
            };
            
            modalVideo.addEventListener('canplay', canPlayHandler);
            
            counter.textContent = `${index + 1} / ${videos.length}`;
            
            // Update button states
            prevBtn.style.opacity = index === 0 ? '0.3' : '1';
            nextBtn.style.opacity = index === videos.length - 1 ? '0.3' : '1';
        }
        
        // Show controls when video pauses or ends
        function handleVideoPause() {
            modalVideo.controls = true;
        }
        
        function handleVideoPlay() {
            modalVideo.controls = false;
        }
        
        // Show controls when video ends
        function handleVideoEnd() {
            modalVideo.controls = true;
        }
        
        // Show controls on hover/touch
        let controlsTimeout;
        function showControls() {
            modalVideo.controls = true;
            clearTimeout(controlsTimeout);
            
            // Hide controls after 3 seconds if video is playing
            if (!modalVideo.paused) {
                controlsTimeout = setTimeout(() => {
                    if (!modalVideo.paused) {
                        modalVideo.controls = false;
                    }
                }, 3000);
            }
        }
        
        modalVideo.addEventListener('ended', handleVideoEnd);
        modalVideo.addEventListener('pause', handleVideoPause);
        modalVideo.addEventListener('play', handleVideoPlay);
        modalVideo.addEventListener('mousemove', showControls);
        modalVideo.addEventListener('touchstart', showControls);
        modalVideo.addEventListener('click', showControls);
        
        loadVideo(currentIndex);
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            modalVideo.removeEventListener('ended', handleVideoEnd);
            modalVideo.removeEventListener('pause', handleVideoPause);
            modalVideo.removeEventListener('play', handleVideoPlay);
            modalVideo.removeEventListener('mousemove', showControls);
            modalVideo.removeEventListener('touchstart', showControls);
            modalVideo.removeEventListener('click', showControls);
            clearTimeout(controlsTimeout);
            setTimeout(() => {
                modal.style.display = 'none';
                modalVideo.pause();
                modalVideo.src = '';
            }, 300);
        };
        
        prevBtn.onclick = () => {
            autoplayEnabled = false;
            if (currentIndex > 0) {
                loadVideo(currentIndex - 1);
            }
        };
        
        nextBtn.onclick = () => {
            autoplayEnabled = false;
            if (currentIndex < videos.length - 1) {
                loadVideo(currentIndex + 1);
            }
        };
        
        // Keyboard navigation
        function handleKeydown(e) {
            if (e.key === 'Escape') closeBtn.onclick();
            if (e.key === 'ArrowLeft') {
                autoplayEnabled = false;
                prevBtn.onclick();
            }
            if (e.key === 'ArrowRight') {
                autoplayEnabled = false;
                nextBtn.onclick();
            }
        }
        
        document.addEventListener('keydown', handleKeydown);
        
        // Cleanup on close
        const originalClose = closeBtn.onclick;
        closeBtn.onclick = () => {
            document.removeEventListener('keydown', handleKeydown);
            originalClose();
        };
        
        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeBtn.onclick();
            }
        };
    }

});
