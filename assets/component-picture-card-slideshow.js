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
    this.animationDuration = 3000; // 3 seconds per slide
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupContinuousFlow();
    this.startContinuousFlow();
    
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.setupContinuousFlow();
    }, 250));
  }

  setupContinuousFlow() {
    if (this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    
    // Clear container
    this.slidesContainer.innerHTML = '';
    
    // Add original slides
    this.slides.forEach(slide => {
      this.slidesContainer.appendChild(slide.cloneNode(true));
    });
    
    // Add clones for seamless loop
    for (let i = 0; i < slidesToShow * 2; i++) {
      const originalIndex = i % this.slides.length;
      this.slidesContainer.appendChild(this.slides[originalIndex].cloneNode(true));
    }
    
    // Update slides reference
    this.slides = this.slidesContainer.querySelectorAll('.picture-card-slideshow__slide');
    
    // Set initial position
    this.slidesContainer.style.transform = 'translateX(0%)';
    this.slidesContainer.style.transition = 'none';
  }

  startContinuousFlow() {
    if (!this.isAutoPlaying || this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    this.pauseContinuousFlow();
    this.isPaused = false;
    this.startTime = performance.now();
    this.animateContinuousFlow();
  }

  pauseContinuousFlow() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  animateContinuousFlow() {
    if (this.isPaused) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = (elapsed % this.animationDuration) / this.animationDuration;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    const slideWidth = 100 / slidesToShow;
    
    // Calculate position for smooth continuous movement
    const translateX = -(progress * slideWidth);
    
    this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    
    // Reset position when we've moved past one slide
    if (progress >= 1) {
      this.slidesContainer.style.transition = 'none';
      this.slidesContainer.style.transform = 'translateX(0%)';
      setTimeout(() => {
        this.slidesContainer.style.transition = '';
      }, 50);
    }
    
    this.animationId = requestAnimationFrame(() => this.animateContinuousFlow());
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
    this.pauseContinuousFlow();
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