class PictureCardSlideshowComponent {
  constructor(element) {
    this.element = element;
    this.slidesContainer = this.element.querySelector('.picture-card-slideshow__slides');
    this.slides = this.element.querySelectorAll('.picture-card-slideshow__slide');
    this.prevButton = this.element.querySelector('.picture-card-slideshow__button--prev');
    this.nextButton = this.element.querySelector('.picture-card-slideshow__button--next');
    this.autoplayButton = this.element.querySelector('.picture-card-slideshow__autoplay');
    this.counterCurrent = this.element.querySelector('.picture-card-slideshow__counter--current');
    
    this.currentIndex = 0;
    this.isAutoPlaying = this.element.dataset.autoplay === 'true';
    this.slideSpeed = parseInt(this.element.dataset.speed) * 1000; // Convert to milliseconds
    this.slidesToShow = parseInt(this.element.dataset.slidesToShow);
    this.slidesToShowMobile = parseInt(this.element.dataset.slidesToShowMobile);
    
    this.autoPlayInterval = null;
    this.isTransitioning = false;
    this.isPaused = false;
    this.animationId = null;
    this.startTime = null;
    this.animationDuration = 3000; // 3 seconds per slide for smooth flow
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupEventListeners();
    this.updateSlidesToShow();
    this.setupContinuousFlow();
    this.startContinuousFlow();
    this.updateCounter();
    
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.updateSlidesToShow();
      this.setupContinuousFlow();
    }, 250));
  }

  setupEventListeners() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.previousSlide());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }
    
    if (this.autoplayButton) {
      this.autoplayButton.addEventListener('click', () => this.toggleAutoplay());
    }
    
    // Pause continuous flow on hover
    this.element.addEventListener('mouseenter', () => {
      this.pauseContinuousFlow();
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.resumeContinuousFlow();
    });
    
    // Pause continuous flow when user interacts with slides
    this.slidesContainer.addEventListener('click', () => {
      this.pauseContinuousFlow();
    });
    
    // Keyboard navigation
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.toggleAutoplay();
      }
    });
    
    // Make slideshow focusable for keyboard navigation
    this.element.setAttribute('tabindex', '0');
  }

  updateSlidesToShow() {
    const isMobile = window.innerWidth < 750;
    const slidesToShow = isMobile ? this.slidesToShowMobile : this.slidesToShow;
    
    // Update slide widths
    this.slides.forEach(slide => {
      slide.style.width = `${100 / slidesToShow}%`;
    });
    
    // Update container data attribute for CSS
    this.setAttribute('data-current-slides-to-show', slidesToShow);
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    const maxIndex = Math.max(0, this.slides.length - this.getCurrentSlidesToShow());
    this.currentIndex = (this.currentIndex + 1) % (maxIndex + 1);
    this.goToSlide(this.currentIndex);
  }

  previousSlide() {
    if (this.isTransitioning) return;
    
    const maxIndex = Math.max(0, this.slides.length - this.getCurrentSlidesToShow());
    this.currentIndex = this.currentIndex === 0 ? maxIndex : this.currentIndex - 1;
    this.goToSlide(this.currentIndex);
  }

  goToSlide(index) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    
    const slideWidth = 100 / this.getCurrentSlidesToShow();
    const translateX = -(index * slideWidth);
    
    this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    
    this.updateCounter();
    this.updateButtonStates();
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  getCurrentSlidesToShow() {
    return window.innerWidth < 750 ? this.slidesToShowMobile : this.slidesToShow;
  }

  updateCounter() {
    if (this.counterCurrent) {
      this.counterCurrent.textContent = this.currentIndex + 1;
    }
  }

  updateButtonStates() {
    const maxIndex = Math.max(0, this.slides.length - this.getCurrentSlidesToShow());
    
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0;
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.currentIndex === maxIndex;
    }
  }

  setupContinuousFlow() {
    if (this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    // Duplicate slides for seamless loop
    const slidesToShow = this.getCurrentSlidesToShow();
    const totalSlides = this.slides.length;
    
    // Create clones for infinite loop
    this.slidesContainer.innerHTML = '';
    
    // Add original slides
    this.slides.forEach(slide => {
      this.slidesContainer.appendChild(slide.cloneNode(true));
    });
    
    // Add clones at the end for seamless transition
    for (let i = 0; i < slidesToShow; i++) {
      this.slidesContainer.appendChild(this.slides[i].cloneNode(true));
    }
    
    // Update slides reference
    this.slides = this.slidesContainer.querySelectorAll('.picture-card-slideshow__slide');
    
    // Set initial position
    this.slidesContainer.style.transform = 'translateX(0%)';
    this.slidesContainer.style.transition = 'none';
  }

  startContinuousFlow() {
    if (!this.isAutoPlaying || this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    this.pauseContinuousFlow(); // Clear any existing animation
    
    this.isPaused = false;
    this.startTime = performance.now();
    this.animateContinuousFlow();
    
    if (this.autoplayButton) {
      this.autoplayButton.classList.remove('paused');
    }
  }

  pauseContinuousFlow() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.autoplayButton) {
      this.autoplayButton.classList.add('paused');
    }
  }

  resumeContinuousFlow() {
    if (!this.isAutoPlaying) return;
    
    this.isPaused = false;
    this.startTime = performance.now();
    this.animateContinuousFlow();
    
    if (this.autoplayButton) {
      this.autoplayButton.classList.remove('paused');
    }
  }

  animateContinuousFlow() {
    if (this.isPaused) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const progress = (elapsed % this.animationDuration) / this.animationDuration;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    const slideWidth = 100 / slidesToShow;
    const totalSlides = this.slides.length;
    const originalSlidesCount = totalSlides - slidesToShow;
    
    // Calculate position for smooth continuous movement
    const translateX = -(progress * slideWidth);
    
    this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    
    // Reset position when we've moved past the original slides
    if (progress >= 1) {
      this.slidesContainer.style.transition = 'none';
      this.slidesContainer.style.transform = 'translateX(0%)';
      setTimeout(() => {
        this.slidesContainer.style.transition = '';
      }, 50);
    }
    
    this.animationId = requestAnimationFrame(() => this.animateContinuousFlow());
  }

  toggleAutoplay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    
    if (this.isAutoPlaying) {
      this.startContinuousFlow();
    } else {
      this.pauseContinuousFlow();
    }
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
