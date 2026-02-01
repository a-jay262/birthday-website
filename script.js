// Main application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const ageInput = document.getElementById('age-input');
    const wishBtn = document.getElementById('wish-btn');
    const newWishBtn = document.getElementById('new-wish-btn');
    const shareBtn = document.getElementById('share-btn');
    const wishDisplay = document.getElementById('wish-display');
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const balloonsContainer = document.querySelector('.balloons-container');
    const confettiContainer = document.querySelector('.confetti-container');
    const twinklingStars = document.querySelector('.twinkling-stars');
    
    // State variables
    let currentAge = null;
    let currentWishes = [];
    let isMusicPlaying = false;
    
    // Initialize the page
    init();
    
    function init() {
        // Create background elements
        createBalloons(15);
        createStars(50);
        
        // Set up event listeners
        setupEventListeners();
        
        // Set today's date as placeholder in input
        const today = new Date();
        ageInput.placeholder = `e.g., ${today.getFullYear() - 1990}`;
        
        // Focus on the age input
        ageInput.focus();
    }
    
    function setupEventListeners() {
        // Get wish button
        wishBtn.addEventListener('click', handleGetWish);
        
        // New wish button
        newWishBtn.addEventListener('click', handleNewWish);
        
        // Share button
        shareBtn.addEventListener('click', handleShareWish);
        
        // Music toggle
        musicToggle.addEventListener('click', toggleMusic);
        
        // Allow Enter key to trigger wish button
        ageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleGetWish();
            }
        });
        
        // Add hover animation to buttons
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Handle getting a wish based on age
    async function handleGetWish() {
        const age = parseInt(ageInput.value);
        
        // Validate input
        if (!age || age < 1 || age > 120) {
            showError('Please enter a valid age between 1 and 120');
            return;
        }
        
        currentAge = age;
        
        try {
            // Load wishes from JSON file
            const response = await fetch('wishes.json');
            const wishesData = await response.json();
            
            // Find wishes for the given age or use default
            let wishes = wishesData.default;
            
            if (wishesData[age]) {
                wishes = wishesData[age];
            } else {
                // If age not found, try to find a range
                const ageRanges = Object.keys(wishesData)
                    .filter(key => key.includes('-'))
                    .find(range => {
                        const [min, max] = range.split('-').map(Number);
                        return age >= min && age <= max;
                    });
                
                if (ageRanges) {
                    wishes = wishesData[ageRanges];
                }
            }
            
            currentWishes = wishes;
            
            // Display a random wish
            displayRandomWish();
            
            // Trigger confetti
            createConfetti();
            
            // Play a celebration sound
            playCelebrationSound();
            
        } catch (error) {
            console.error('Error loading wishes:', error);
            showError('Unable to load birthday wishes. Please try again.');
        }
    }
    
    // Handle getting a new wish for the same age
    function handleNewWish() {
        if (!currentAge || currentWishes.length === 0) {
            showError('Please get a wish first by entering your age');
            return;
        }
        
        displayRandomWish();
        createConfetti(50); // Less confetti for new wish
    }
    
    // Display a random wish from currentWishes
    function displayRandomWish() {
        if (currentWishes.length === 0) return;
        
        // Get random wish
        const randomIndex = Math.floor(Math.random() * currentWishes.length);
        const wish = currentWishes[randomIndex];
        
        // Create wish element
        const wishElement = document.createElement('div');
        wishElement.className = 'wish-text';
        wishElement.innerHTML = `
            <span class="wish-age">${currentAge} Years</span>
            ${wish}
        `;
        
        // Clear previous wish and add fade-in animation
        wishDisplay.innerHTML = '';
        wishDisplay.appendChild(wishElement);
        
        // Add animation
        wishElement.style.animation = 'none';
        setTimeout(() => {
            wishElement.style.animation = 'fadeInUp 0.8s ease';
        }, 10);
        
        // Enable new wish button
        newWishBtn.disabled = false;
        newWishBtn.innerHTML = '<i class="fas fa-redo"></i> New Wish';
    }
    
    // Handle sharing the wish
    function handleShareWish() {
        const wishText = document.querySelector('.wish-text');
        
        if (!wishText) {
            showError('No wish to share. Please get a wish first.');
            return;
        }
        
        const textToShare = `Check out my birthday wish for ${currentAge} years: "${wishText.textContent.trim()}" - Created with this awesome birthday website!`;
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'My Birthday Wish',
                text: textToShare,
                url: window.location.href
            })
            .then(() => console.log('Share successful'))
            .catch(error => console.log('Error sharing:', error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(textToShare)
                .then(() => {
                    // Show success message
                    const originalText = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    shareBtn.style.background = 'linear-gradient(to right, #06d6a0, #0cb48c)';
                    
                    setTimeout(() => {
                        shareBtn.innerHTML = originalText;
                        shareBtn.style.background = 'linear-gradient(to right, #4facfe, #00f2fe)';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    showError('Failed to copy to clipboard. Please try again.');
                });
        }
    }
    
    // Toggle background music
    function toggleMusic() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-music"></i><span class="music-text">Background Music</span><span class="music-status">(Off)</span>';
            musicToggle.style.background = 'rgba(255, 255, 255, 0.9)';
        } else {
            bgMusic.play().catch(e => {
                console.log('Autoplay prevented:', e);
                showError('Click the music button again to play background music');
            });
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i><span class="music-text">Background Music</span><span class="music-status">(On)</span>';
            musicToggle.style.background = 'linear-gradient(to right, #ff9a9e, #fad0c4)';
        }
        
        isMusicPlaying = !isMusicPlaying;
    }
    
    // Create floating balloons
    function createBalloons(count) {
        // Colors for balloons
        const balloonColors = [
            '#ff6b8b', '#6a5af9', '#4facfe', '#00f2fe', '#06d6a0',
            '#ffd166', '#ff9a00', '#c779d0', '#feac5e', '#a8edea'
        ];
        
        for (let i = 0; i < count; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            
            // Random properties
            const size = Math.random() * 30 + 40; // 40-70px
            const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            const left = Math.random() * 100; // 0-100%
            const duration = Math.random() * 20 + 20; // 20-40s
            const delay = Math.random() * 15; // 0-15s
            const rotation = Math.random() * 30 - 15; // -15 to +15deg
            
            // Apply styles
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.2}px`;
            balloon.style.background = `radial-gradient(circle at 30% 30%, ${color}, ${darkenColor(color, 20)})`;
            balloon.style.left = `${left}%`;
            balloon.style.setProperty('--rotation', `${rotation}deg`);
            balloon.style.animationDuration = `${duration}s`;
            balloon.style.animationDelay = `${delay}s`;
            
            // Create string
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
            
            // Random properties
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 2;
            
            // Apply styles
            star.style.top = `${top}%`;
            star.style.left = `${left}%`;
            star.style.animationDelay = `${delay}s`;
            star.style.animationDuration = `${duration}s`;
            
            twinklingStars.appendChild(star);
        }
    }
    
    // Create confetti animation
    function createConfetti(count = 150) {
        // Colors for confetti
        const confettiColors = [
            '#ff6b8b', '#6a5af9', '#4facfe', '#00f2fe', '#06d6a0',
            '#ffd166', '#ff9a00', '#c779d0', '#feac5e', '#a8edea'
        ];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random properties
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            const left = Math.random() * 100;
            const size = Math.random() * 10 + 5;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            const rotation = Math.random() * 360;
            
            // Apply styles
            confetti.style.background = color;
            confetti.style.left = `${left}%`;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.animationDelay = `${delay}s`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation completes
            setTimeout(() => {
                if (confetti.parentNode === confettiContainer) {
                    confettiContainer.removeChild(confetti);
                }
            }, (duration + delay) * 1000);
        }
    }
    
    // Play celebration sound
    function playCelebrationSound() {
        // Create a short celebration sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    // Show error message
    function showError(message) {
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'wish-text error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorElement.style.color = '#ff4757';
        
        // Clear previous wish and show error
        wishDisplay.innerHTML = '';
        wishDisplay.appendChild(errorElement);
        
        // Add shake animation
        errorElement.style.animation = 'none';
        setTimeout(() => {
            errorElement.style.animation = 'fadeInUp 0.5s ease';
        }, 10);
        
        // Shake the input
        ageInput.style.borderColor = '#ff4757';
        ageInput.style.animation = 'shake 0.5s ease';
        
        setTimeout(() => {
            ageInput.style.borderColor = '#e0e0e0';
            ageInput.style.animation = '';
        }, 500);
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
    
    // Add shake animation for errors
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .error-message {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
});