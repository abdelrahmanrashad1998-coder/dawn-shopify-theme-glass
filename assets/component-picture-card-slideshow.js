class PictureCardSlideshowComponent {
  constructor(element) {
    this.element = element;
    this.slidesContainer = this.element.querySelector('.picture-card-slideshow__slides');
    this.slides = this.element.querySelectorAll('.picture-card-slideshow__slide');
    
    this.isAutoPlaying = this.element.dataset.autoplay === 'true';
    this.slideSpeed = parseInt(this.element.dataset.speed) * 1000;
    this.slidesToShow = parseInt(this.element.dataset.slidesToShow);
    this.slidesToShowMobile = parseInt(this.element.dataset.slidesToShowMobile);
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupInfiniteScroll();
    
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
    
    // Add the infinite scroll class
    this.slidesContainer.classList.add('infinite-scroll');
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