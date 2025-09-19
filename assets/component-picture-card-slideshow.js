class PictureCardSlideshowComponent {
  constructor(element) {
    this.element = element;
    this.slidesContainer = this.element.querySelector('.picture-card-slideshow__slides');
    this.slides = this.element.querySelectorAll('.picture-card-slideshow__slide');
    
    this.isAutoPlaying = this.element.dataset.autoplay === 'true';
    this.slideSpeed = parseInt(this.element.dataset.speed) * 1000;
    this.slidesToShow = parseInt(this.element.dataset.slidesToShow);
    this.slidesToShowMobile = parseInt(this.element.dataset.slidesToShowMobile);
    this.animationEasing = this.element.dataset.animationEasing || 'linear';
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupInfiniteScroll();
    this.setupHoverControls();
    
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.setupInfiniteScroll();
    }, 250));
  }

  setupInfiniteScroll() {
    if (this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    
    // Clear container
    this.slidesContainer.innerHTML = '';
    
    // Create enough clones for seamless infinite scroll
    // We need 2 complete sets for smooth looping
    const totalSlides = this.slides.length * 2;
    
    for (let i = 0; i < totalSlides; i++) {
      const originalIndex = i % this.slides.length;
      const slide = this.slides[originalIndex].cloneNode(true);
      this.slidesContainer.appendChild(slide);
    }
    
    // Update slides reference
    this.slides = this.slidesContainer.querySelectorAll('.picture-card-slideshow__slide');
    
    // Set CSS custom properties for animation
    const slideWidth = 100 / slidesToShow;
    const moveDistance = slideWidth * this.slides.length / 2; // Move exactly one set
    
    this.slidesContainer.style.setProperty('--slide-width', `${slideWidth}%`);
    this.slidesContainer.style.setProperty('--move-distance', `${moveDistance}%`);
    this.slidesContainer.style.setProperty('--animation-duration', `${this.slideSpeed}ms`);
    this.slidesContainer.style.setProperty('--animation-easing', this.animationEasing);
    
    // Add the infinite scroll class
    this.slidesContainer.classList.add('infinite-scroll');
  }

  setupHoverControls() {
    if (!this.isAutoPlaying) return;
    
    // Desktop hover events
    this.element.addEventListener('mouseenter', () => {
      this.pauseAnimation();
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.resumeAnimation();
    });
    
    // Mobile touch events
    this.element.addEventListener('touchstart', (e) => {
      this.pauseAnimation();
      // Prevent default to avoid scrolling issues
      e.preventDefault();
    }, { passive: false });
    
    this.element.addEventListener('touchend', () => {
      // Small delay to prevent accidental resume
      setTimeout(() => {
        this.resumeAnimation();
      }, 100);
    });
    
    // Handle touch cancel (when touch is interrupted)
    this.element.addEventListener('touchcancel', () => {
      this.resumeAnimation();
    });
  }

  pauseAnimation() {
    if (this.slidesContainer) {
      this.slidesContainer.style.animationPlayState = 'paused';
    }
  }

  resumeAnimation() {
    if (this.slidesContainer) {
      this.slidesContainer.style.animationPlayState = 'running';
    }
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
}

// Initialize all slideshow components on the page
document.addEventListener('DOMContentLoaded', function() {
  const slideshowContainers = document.querySelectorAll('.picture-card-slideshow__container');
  slideshowContainers.forEach(container => {
    new PictureCardSlideshowComponent(container);
  });
});