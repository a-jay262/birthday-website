// Main application for 24th Birthday
document.addEventListener('DOMContentLoaded', function() {
    // State variables
    const BIRTHDAY_AGE = 24;
    let allWishes = [];
    let openedWishes = new Set();
    let currentWishIndex = null;
    let isMusicPlaying = false;
    let welcomeSlideIndex = 0;
    
    // Get DOM elements
    const welcomeMessages = document.getElementById('welcome-messages');
    const mainContainer = document.getElementById('main-container');
    const continueBtn = document.getElementById('continue-btn');
    const envelopesGrid = document.getElementById('envelopes-grid');
    const randomWishBtn = document.getElementById('random-wish-btn');
    const resetBtn = document.getElementById('reset-btn');
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const openedCount = document.getElementById('opened-count');
    const progressFill = document.getElementById('progress-fill');
    const wishPopup = document.getElementById('wish-popup');
    const closePopup = document.getElementById('close-popup');
    const wishNumber = document.getElementById('wish-number');
    const popupWishText = document.getElementById('popup-wish-text');
    const sharePopupBtn = document.getElementById('share-popup-btn');
    const nextPopupBtn = document.getElementById('next-popup-btn');
    
    // Initialize the page
    init();
    
    function init() {
        // Create background elements
        createBalloons(20);
        createStars(50);
        
        // Load wishes
        loadWishes();
        
        // Generate envelopes
        generateEnvelopes();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up welcome slides
        setupWelcomeSlides();
    }
    
    function setupEventListeners() {
        // Continue button
        continueBtn.addEventListener('click', handleContinue);
        
        // Random wish button
        randomWishBtn.addEventListener('click', handleRandomWish);
        
        // Reset button
        resetBtn.addEventListener('click', handleReset);
        
        // Music toggle
        musicToggle.addEventListener('click', toggleMusic);
        
        // Popup close button
        closePopup.addEventListener('click', closeWishPopup);
        
        // Close popup when clicking outside
        wishPopup.addEventListener('click', function(e) {
            if (e.target === wishPopup) {
                closeWishPopup();
            }
        });
        
        // Share popup button
        sharePopupBtn.addEventListener('click', handleShareWish);
        
        // Next wish button
        nextPopupBtn.addEventListener('click', handleNextWish);
        
        // Close popup with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && wishPopup.classList.contains('active')) {
                closeWishPopup();
            }
        });
        
        // Fix for music
        bgMusic.addEventListener('error', function(e) {
            console.log('Audio error:', e);
        });
        
        // Mark user interaction for audio
        document.addEventListener('click', function initAudio() {
            bgMusic.userInteracted = true;
            document.removeEventListener('click', initAudio);
        });
    }
    
    function setupWelcomeSlides() {
        const welcomeSlides = document.querySelectorAll('.welcome-slide');
        const dots = document.querySelectorAll('.dot');
        
        // Auto advance welcome slides
        setInterval(() => {
            if (welcomeMessages.style.display !== 'none') {
                nextWelcomeSlide();
            }
        }, 4000);
        
        // Click dots to navigate
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showWelcomeSlide(index);
            });
        });
        
        function nextWelcomeSlide() {
            welcomeSlideIndex = (welcomeSlideIndex + 1) % welcomeSlides.length;
            showWelcomeSlide(welcomeSlideIndex);
        }
        
        function showWelcomeSlide(index) {
            welcomeSlides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            welcomeSlides[index].classList.add('active');
            dots[index].classList.add('active');
            welcomeSlideIndex = index;
        }
    }
    
    function handleContinue() {
        // Hide welcome messages
        welcomeMessages.style.opacity = '0';
        welcomeMessages.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            welcomeMessages.style.display = 'none';
            mainContainer.style.display = 'block';
            
            // Show main content
            setTimeout(() => {
                mainContainer.style.opacity = '1';
                createConfetti(200);
                playCelebrationSound();
            }, 100);
        }, 500);
    }
    
    async function loadWishes() {
        try {
            const response = await fetch('wishes.json');
            const wishesData = await response.json();
            
            // Get wishes for age 24
            if (wishesData[BIRTHDAY_AGE]) {
                allWishes = wishesData[BIRTHDAY_AGE];
            } else {
                // Fallback wishes
                allWishes = Array.from({length: 24}, (_, i) => 
                    `Birthday wish ${i + 1} for your 24th birthday! 🎉`
                );
            }
        } catch (error) {
            console.error('Error loading wishes:', error);
            // Fallback to default wishes
            allWishes = Array.from({length: 24}, (_, i) => 
                `Happy 24th Birthday! This is wish number ${i + 1} of 24. 🎂`
            );
        }
    }
    
    function generateEnvelopes() {
        envelopesGrid.innerHTML = '';
        
        for (let i = 1; i <= 24; i++) {
            const envelope = document.createElement('div');
            envelope.className = 'envelope';
            envelope.dataset.index = i - 1;
            
            envelope.innerHTML = `
                <div class="envelope-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="envelope-number">${i}</div>
                <div class="envelope-label">Wish ${i}</div>
            `;
            
            envelope.addEventListener('click', () => handleEnvelopeClick(i - 1));
            envelopesGrid.appendChild(envelope);
        }
    }
    
    function handleEnvelopeClick(index) {
        const envelope = document.querySelector(`.envelope[data-index="${index}"]`);
        
        // Mark as opened if not already
        if (!openedWishes.has(index)) {
            openedWishes.add(index);
            envelope.classList.add('open');
            envelope.innerHTML = `
                <div class="envelope-icon">
                    <i class="fas fa-envelope-open"></i>
                </div>
                <div class="envelope-number">${index + 1}</div>
                <div class="envelope-label">Opened!</div>
            `;
            
            updateProgress();
            
            // Celebrate if all envelopes are opened
            if (openedWishes.size === 24) {
                setTimeout(() => {
                    createConfetti(300);
                    playCelebrationSound();
                    showMessage("🎉 Amazing! You've opened all 24 birthday wishes! 🎉");
                }, 500);
            }
        }
        
        // Show the wish
        showWishPopup(index);
        createConfetti(50);
        playEnvelopeSound();
    }
    
    function showWishPopup(index) {
        if (index < 0 || index >= allWishes.length) {
            index = 0;
        }
        
        currentWishIndex = index;
        const wish = allWishes[index];
        
        // Update popup content
        wishNumber.textContent = `Wish ${index + 1} of 24`;
        popupWishText.textContent = wish;
        
        // Show popup
        wishPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeWishPopup() {
        wishPopup.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function handleRandomWish() {
        if (allWishes.length === 0) return;
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * allWishes.length);
        } while (randomIndex === currentWishIndex && allWishes.length > 1);
        
        showWishPopup(randomIndex);
        createConfetti(30);
    }
    
    function handleNextWish() {
        if (allWishes.length === 0) return;
        
        let nextIndex = (currentWishIndex + 1) % allWishes.length;
        
        // If next wish hasn't been opened yet, mark it as opened
        if (!openedWishes.has(nextIndex)) {
            openedWishes.add(nextIndex);
            const envelope = document.querySelector(`.envelope[data-index="${nextIndex}"]`);
            if (envelope) {
                envelope.classList.add('open');
                envelope.innerHTML = `
                    <div class="envelope-icon">
                        <i class="fas fa-envelope-open"></i>
                    </div>
                    <div class="envelope-number">${nextIndex + 1}</div>
                    <div class="envelope-label">Opened!</div>
                `;
            }
            updateProgress();
        }
        
        showWishPopup(nextIndex);
        createConfetti(20);
    }
    
    function handleShareWish() {
        const wish = allWishes[currentWishIndex];
        
        if (!wish) return;
        
        const shareText = `Check out my ${BIRTHDAY_AGE}th birthday wish #${currentWishIndex + 1}: "${wish}"`;
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: `My ${BIRTHDAY_AGE}th Birthday Wish`,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => showMessage('Wish copied to clipboard! 📋'))
                .catch(() => showMessage('Failed to copy to clipboard.'));
        }
    }
    
    function handleReset() {
        if (confirm("Are you sure you want to reset all envelopes?")) {
            openedWishes.clear();
            generateEnvelopes();
            updateProgress();
            closeWishPopup();
            createConfetti(100);
            showMessage('All envelopes have been reset! 🎉');
        }
    }
    
    function updateProgress() {
        const opened = openedWishes.size;
        const progress = (opened / 24) * 100;
        
        openedCount.textContent = opened;
        progressFill.style.width = `${progress}%`;
        
        // Change color based on progress
        if (progress < 33) {
            progressFill.style.background = 'linear-gradient(to right, #ff6b8b, #ff9a9e)';
        } else if (progress < 66) {
            progressFill.style.background = 'linear-gradient(to right, #ff9a00, #ffd166)';
        } else {
            progressFill.style.background = 'linear-gradient(to right, #06d6a0, #0cb48c)';
        }
    }
    
    function toggleMusic() {
        if (!bgMusic.userInteracted) {
            showMessage('Click the music button again to play 🎵');
            bgMusic.userInteracted = true;
            return;
        }
        
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-play"></i><span class="music-text">Play Birthday Music</span>';
            isMusicPlaying = false;
        } else {
            bgMusic.volume = 0.5;
            bgMusic.play()
                .then(() => {
                    musicToggle.innerHTML = '<i class="fas fa-pause"></i><span class="music-text">Pause Music</span>';
                    isMusicPlaying = true;
                })
                .catch(() => {
                    showMessage('Click the music button again to play 🎵');
                });
        }
    }
    
    // Background elements functions
    function createBalloons(count) {
        const balloonColors = ['#ff6b8b', '#6a5af9', '#4facfe', '#00f2fe', '#06d6a0', '#ffd166'];
        const container = document.querySelector('.balloons-container');
        
        for (let i = 0; i < count; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            
            const size = Math.random() * 30 + 40;
            const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 20;
            const delay = Math.random() * 15;
            
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.2}px`;
            balloon.style.background = color;
            balloon.style.left = `${left}%`;
            balloon.style.animationDuration = `${duration}s`;
            balloon.style.animationDelay = `${delay}s`;
            
            container.appendChild(balloon);
        }
    }
    
    function createStars(count) {
        const container = document.querySelector('.twinkling-stars');
        
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            
            container.appendChild(star);
        }
    }
    
    function createConfetti(count = 150) {
        const container = document.querySelector('.confetti-container');
        const colors = ['#ff6b8b', '#6a5af9', '#4facfe', '#00f2fe', '#06d6a0', '#ffd166'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode === container) {
                    container.removeChild(confetti);
                }
            }, 5000);
        }
    }
    
    function playCelebrationSound() {
        // Simple celebration sound using beep
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 523.25;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 300);
        } catch (e) {
            // Audio context not supported
        }
    }
    
    function playEnvelopeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 659.25;
            oscillator.type = 'triangle';
            gainNode.gain.value = 0.2;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        } catch (e) {
            // Audio context not supported
        }
    }
    
    function showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #06d6a0;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
});