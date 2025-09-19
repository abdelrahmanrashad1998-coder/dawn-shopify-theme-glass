class PictureCardSlideshowComponent {
  constructor(element) {
    this.element = element;
    this.slidesContainer = this.element.querySelector('.picture-card-slideshow__slides');
    this.slides = this.element.querySelectorAll('.picture-card-slideshow__slide');
    
    this.isAutoPlaying = this.element.dataset.autoplay === 'true';
    this.slideSpeed = parseInt(this.element.dataset.speed) * 1000;
    this.slidesToShow = parseInt(this.element.dataset.slidesToShow);
    this.slidesToShowMobile = parseInt(this.element.dataset.slidesToShowMobile);
    
    this.animationId = null;
    this.isPaused = false;
    this.startTime = null;
    this.animationDuration = 4000; // 4 seconds per slide for luxury feel
    this.currentPosition = 0;
    this.originalSlidesCount = 0;
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupSeamlessFlow();
    this.startSeamlessFlow();
    
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.setupSeamlessFlow();
    }, 250));
  }

  setupSeamlessFlow() {
    if (this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    this.originalSlidesCount = this.slides.length;
    
    // Clear container
    this.slidesContainer.innerHTML = '';
    
    // Create enough clones for seamless infinite scroll
    // We need at least 3 sets to ensure smooth looping
    const totalClones = this.originalSlidesCount * 3;
    
    for (let i = 0; i < totalClones; i++) {
      const originalIndex = i % this.originalSlidesCount;
      this.slidesContainer.appendChild(this.slides[originalIndex].cloneNode(true));
    }
    
    // Update slides reference
    this.slides = this.slidesContainer.querySelectorAll('.picture-card-slideshow__slide');
    
    // Set initial position to start from the middle set
    this.currentPosition = -this.originalSlidesCount * (100 / slidesToShow);
    this.slidesContainer.style.transform = `translateX(${this.currentPosition}%)`;
    this.slidesContainer.style.transition = 'none';
  }

  startSeamlessFlow() {
    if (!this.isAutoPlaying || this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    this.pauseSeamlessFlow();
    this.isPaused = false;
    this.startTime = performance.now();
    this.animateSeamlessFlow();
  }

  pauseSeamlessFlow() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  animateSeamlessFlow() {
    if (this.isPaused) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    const slideWidth = 100 / slidesToShow;
    const totalSlides = this.slides.length;
    
    // Calculate continuous position
    const progress = (elapsed % this.animationDuration) / this.animationDuration;
    const newPosition = this.currentPosition - (progress * slideWidth);
    
    this.slidesContainer.style.transform = `translateX(${newPosition}%)`;
    
    // Seamlessly reset position when we've moved past one complete set
    if (progress >= 1) {
      this.currentPosition = newPosition;
      this.startTime = currentTime;
      
      // Reset to beginning of middle set when we reach the end
      if (this.currentPosition <= -this.originalSlidesCount * 2 * (100 / slidesToShow)) {
        this.currentPosition = -this.originalSlidesCount * (100 / slidesToShow);
        this.slidesContainer.style.transition = 'none';
        this.slidesContainer.style.transform = `translateX(${this.currentPosition}%)`;
        setTimeout(() => {
          this.slidesContainer.style.transition = '';
        }, 50);
      }
    }
    
    this.animationId = requestAnimationFrame(() => this.animateSeamlessFlow());
  }

  getCurrentSlidesToShow() {
    return window.innerWidth < 750 ? this.slidesToShowMobile : this.slidesToShow;
  }

  // Utility function for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Cleanup when component is removed
  destroy() {
    this.pauseSeamlessFlow();
    window.removeEventListener('resize', this.debounce);
  }
}

// Initialize all slideshow components on the page
document.addEventListener('DOMContentLoaded', function() {
  const slideshowContainers = document.querySelectorAll('.picture-card-slideshow__container');
  slideshowContainers.forEach(container => {
    new PictureCardSlideshowComponent(container);
  });
});