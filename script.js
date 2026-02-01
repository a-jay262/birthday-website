// Main application for 24th Birthday
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const welcomeMessages = document.getElementById('welcome-messages');
    const mainContainer = document.getElementById('main-container');
    const continueBtn = document.getElementById('continue-btn');
    const envelopesGrid = document.getElementById('envelopes-grid');
    const wishDisplay = document.getElementById('wish-display');
    const selectedWishContainer = document.getElementById('selected-wish-container');
    const newWishBtn = document.getElementById('new-wish-btn');
    const shareBtn = document.getElementById('share-btn');
    const resetBtn = document.getElementById('reset-btn');
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const openedCount = document.getElementById('opened-count');
    const progressFill = document.getElementById('progress-fill');
    const balloonsContainer = document.querySelector('.balloons-container');
    const confettiContainer = document.getElementById('confetti-container');
    const twinklingStars = document.querySelector('.twinkling-stars');
    
    // State variables
    const BIRTHDAY_AGE = 24; // Fixed age for this celebration
    let allWishes = [];
    let openedWishes = new Set();
    let currentWishIndex = null;
    let isMusicPlaying = false;
    let welcomeSlideIndex = 0;
    let welcomeSlides = document.querySelectorAll('.welcome-slide');
    let dots = document.querySelectorAll('.dot');
    
    // Initialize the page
    init();
    
    function init() {
        // Create background elements
        createBalloons(20);
        createStars(50);
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up welcome slides
        setupWelcomeSlides();
        
        // Load wishes from JSON file
        loadWishes();
        
        // Generate envelopes
        generateEnvelopes();
        
        // Update progress
        updateProgress();
    }
    
    function setupEventListeners() {
        // Continue button
        continueBtn.addEventListener('click', handleContinue);
        
        // New wish button
        newWishBtn.addEventListener('click', handleRandomWish);
        
        // Share button
        shareBtn.addEventListener('click', handleShareWish);
        
        // Reset button
        resetBtn.addEventListener('click', handleReset);
        
        // Music toggle
        musicToggle.addEventListener('click', toggleMusic);
        
        // Fix for music autoplay issues
        bgMusic.addEventListener('ended', function() {
            this.currentTime = 0;
            if (isMusicPlaying) {
                this.play().catch(e => console.log('Music play error:', e));
            }
        });
        
        bgMusic.addEventListener('error', function(e) {
            console.log('Audio error:', e);
            // Fallback to alternative source if needed
        });
        
        // Add user interaction requirement for audio
        document.addEventListener('click', function() {
            if (!bgMusic.userInteracted) {
                bgMusic.userInteracted = true;
            }
        }, { once: true });
    }
    
    function setupWelcomeSlides() {
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
    }
    
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
    
    function handleContinue() {
        // Hide welcome messages with fade out
        welcomeMessages.style.opacity = '0';
        welcomeMessages.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            welcomeMessages.style.display = 'none';
            mainContainer.style.display = 'block';
            
            // Trigger entrance animation
            setTimeout(() => {
                mainContainer.style.opacity = '1';
                createConfetti(200); // Big celebration on entry
                playCelebrationSound();
                
                // Try to play music after user interaction
                setTimeout(() => {
                    if (!isMusicPlaying) {
                        toggleMusic();
                    }
                }, 1000);
            }, 100);
        }, 500);
    }
    
    // Load wishes from JSON file
    async function loadWishes() {
        try {
            const response = await fetch('wishes.json');
            const wishesData = await response.json();
            
            // Get wishes for age 24 or default
            if (wishesData[BIRTHDAY_AGE]) {
                allWishes = wishesData[BIRTHDAY_AGE];
            } else {
                allWishes = wishesData.default;
            }
            
            console.log(`Loaded ${allWishes.length} wishes for ${BIRTHDAY_AGE}th birthday`);
            
        } catch (error) {
            console.error('Error loading wishes:', error);
            // Fallback to default wishes
            allWishes = [
                "Happy 24th Birthday! Your journey is just getting started.",
                "24 looks amazing on you! Wishing you a year filled with joy.",
                "Cheers to 24 years of being incredible!",
                "May your 24th year be your best one yet!",
                "24 candles, 24 wishes, all for you!",
                "Welcome to 24 - it's going to be amazing!",
                "Another year wiser, another year more wonderful!",
                "24 is just the beginning of your greatest adventures!",
                "Happy Birthday to someone who gets better every year!",
                "24 years of making the world brighter!",
                "May all your birthday wishes come true!",
                "Here's to 24 more years of happiness!",
                "You're not getting older, you're getting better!",
                "24 and thriving! Keep shining bright!",
                "Wishing you 24 times the happiness today!",
                "Happy Birthday to an amazing 24-year-old!",
                "May your 24th year be filled with blessings!",
                "Cheers to you on your special day!",
                "24 looks perfect on you!",
                "Another year, another reason to celebrate you!",
                "May your birthday be as special as you are!",
                "24 years of wonderful you!",
                "Here's to making more amazing memories!",
                "Happy Birthday! Today is all about you!"
            ];
        }
    }
    
    // Generate 24 envelopes
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
    
    // Handle envelope click
    function handleEnvelopeClick(index) {
        const envelope = document.querySelector(`.envelope[data-index="${index}"]`);
        
        // If already opened, just show the wish
        if (openedWishes.has(index)) {
            showWish(index);
            return;
        }
        
        // Mark as opened
        openedWishes.add(index);
        
        // Update envelope appearance
        envelope.classList.add('open');
        envelope.innerHTML = `
            <div class="envelope-icon">
                <i class="fas fa-envelope-open"></i>
            </div>
            <div class="envelope-number">${index + 1}</div>
            <div class="envelope-label">Opened!</div>
        `;
        
        // Show the wish
        showWish(index);
        
        // Create confetti
        createConfetti(50);
        
        // Play sound
        playEnvelopeSound();
        
        // Update progress
        updateProgress();
        
        // Celebrate if all envelopes are opened
        if (openedWishes.size === 24) {
            setTimeout(() => {
                createConfetti(300);
                playCelebrationSound();
                alert("🎉 Amazing! You've opened all 24 birthday wishes! 🎉");
            }, 500);
        }
    }
    
    // Show wish at specific index
    function showWish(index) {
        if (index < 0 || index >= allWishes.length) {
            index = Math.floor(Math.random() * allWishes.length);
        }
        
        currentWishIndex = index;
        const wish = allWishes[index];
        
        // Create wish element
        const wishElement = document.createElement('div');
        wishElement.className = 'wish-text';
        wishElement.innerHTML = `
            <div class="wish-age">Wish ${index + 1} of 24</div>
            <div class="wish-content">${wish}</div>
        `;
        
        // Clear and display
        wishDisplay.innerHTML = '';
        wishDisplay.appendChild(wishElement);
        
        // Add animation
        wishElement.style.animation = 'none';
        setTimeout(() => {
            wishElement.style.animation = 'fadeInUp 0.8s ease';
        }, 10);
    }
    
    // Handle random wish
    function handleRandomWish() {
        if (allWishes.length === 0) return;
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * allWishes.length);
        } while (randomIndex === currentWishIndex && allWishes.length > 1);
        
        showWish(randomIndex);
        createConfetti(30);
    }
    
    // Handle share wish
    function handleShareWish() {
        const wishElement = document.querySelector('.wish-content');
        
        if (!wishElement) {
            showMessage('No wish to share. Please open an envelope first!');
            return;
        }
        
        const wishText = wishElement.textContent;
        const shareText = `Check out my ${BIRTHDAY_AGE}th birthday wish #${currentWishIndex + 1}: "${wishText}" - Celebrate with me!`;
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: `My ${BIRTHDAY_AGE}th Birthday Wish`,
                text: shareText,
                url: window.location.href
            })
            .then(() => console.log('Share successful'))
            .catch(error => console.log('Error sharing:', error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    showMessage('Wish copied to clipboard! 📋', true);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    showMessage('Failed to copy to clipboard. Please try again.');
                });
        }
    }
    
    // Handle reset
    function handleReset() {
        if (confirm("Are you sure you want to reset all envelopes? This will close all opened wishes.")) {
            openedWishes.clear();
            generateEnvelopes();
            updateProgress();
            
            // Reset wish display
            wishDisplay.innerHTML = `
                <div class="default-message">
                    <i class="fas fa-envelope-open-text"></i>
                    <h3>Click an envelope to reveal a birthday wish</h3>
                    <p>You have 24 special messages waiting for you!</p>
                </div>
            `;
            
            createConfetti(100);
            showMessage('All envelopes have been reset! 🎉', true);
        }
    }
    
    // Update progress
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
    
    // Toggle background music
    function toggleMusic() {
        if (!bgMusic.userInteracted) {
            bgMusic.userInteracted = true;
        }
        
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-play"></i><span class="music-text">Play Birthday Music</span>';
            musicToggle.style.background = 'linear-gradient(to right, var(--primary-color), var(--secondary-color))';
        } else {
            // Set volume
            bgMusic.volume = 0.5;
            
            // Play with promise to handle autoplay restrictions
            const playPromise = bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Music started successfully
                    musicToggle.innerHTML = '<i class="fas fa-pause"></i><span class="music-text">Pause Music</span>';
                    musicToggle.style.background = 'linear-gradient(to right, #06d6a0, #0cb48c)';
                    isMusicPlaying = true;
                }).catch(error => {
                    // Autoplay prevented
                    console.log('Autoplay prevented:', error);
                    showMessage('Click the music button again to play background music 🎵');
                    musicToggle.innerHTML = '<i class="fas fa-play"></i><span class="music-text">Play Birthday Music</span>';
                    isMusicPlaying = false;
                });
            }
        }
    }
    
    // Create floating balloons
    function createBalloons(count) {
        const balloonColors = [
            '#ff6b8b', '#6a5af9', '#4facfe', '#00f2fe', '#06d6a0',
            '#ffd166', '#ff9a00', '#c779d0', '#feac5e', '#a8edea'
        ];
        
        for (let i = 0; i < count; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            
            const size = Math.random() * 30 + 40;
            const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 20;
            const delay = Math.random() * 15;
            const rotation = Math.random() * 30 - 15;
            
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.2}px`;
            balloon.style.background = `radial-gradient(circle at 30% 30%, ${color}, ${darkenColor(color, 20)})`;
            balloon.style.left = `${left}%`;
            balloon.style.setProperty('--rotation', `${rotation}deg`);
            balloon.style.animationDuration = `${duration}s`;
            balloon.style.animationDelay = `${delay}s`;
            
            const string = document.createElement('div');
            string.className = 'balloon-string';
            
            balloon.appendChild(string);
            balloonsContainer.appendChild(balloon);
        }
    }
    
    // Create twinkling stars
    function createStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 2;
            
            star.style.top = `${top}%`;
            star.style.left = `${left}%`;
            star.style.animationDelay = `${delay}s`;
            star.style.animationDuration = `${duration}s`;
            
            twinklingStars.appendChild(star);
        }
    }
    
    // Create confetti animation
    function createConfetti(count = 150) {
        const confettiColors = [
            '#ff6b8b', '#6a5af9', '#4facfe', '#00f2fe', '#06d6a0',
            '#ffd166', '#ff9a00', '#c779d0', '#feac5e', '#a8edea'
        ];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            const left = Math.random() * 100;
            const size = Math.random() * 10 + 5;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            const rotation = Math.random() * 360;
            
            confetti.style.background = color;
            confetti.style.left = `${left}%`;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.animationDelay = `${delay}s`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode === confettiContainer) {
                    confettiContainer.removeChild(confetti);
                }
            }, (duration + delay) * 1000);
        }
    }
    
    // Play celebration sound
    function playCelebrationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 523.25;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    // Play envelope opening sound
    function playEnvelopeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 659.25; // E5
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    // Show message
    function showMessage(message, isSuccess = false) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'message-popup';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isSuccess ? '#06d6a0' : '#ff6b8b'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
    
    // Helper function to darken a color
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // Add custom animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .message-popup {
            font-weight: 600;
            font-size: 0.95rem;
        }
    `;
    document.head.appendChild(style);
});