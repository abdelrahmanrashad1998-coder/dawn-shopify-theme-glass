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
    
    this.init();
  }

  init() {
    if (this.slides.length === 0) return;
    
    this.setupEventListeners();
    this.updateSlidesToShow();
    this.startAutoplay();
    this.updateCounter();
    
    // Handle window resize
    window.addEventListener('resize', this.debounce(() => {
      this.updateSlidesToShow();
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
    
    // Pause autoplay on hover
    this.element.addEventListener('mouseenter', () => {
      if (this.isAutoPlaying) {
        this.pauseAutoplay();
      }
    });
    
    this.element.addEventListener('mouseleave', () => {
      if (this.isAutoPlaying) {
        this.startAutoplay();
      }
    });
    
    // Pause autoplay when user interacts with slides
    this.slidesContainer.addEventListener('click', () => {
      if (this.isAutoPlaying) {
        this.pauseAutoplay();
      }
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

  startAutoplay() {
    if (!this.isAutoPlaying || this.slides.length <= this.getCurrentSlidesToShow()) return;
    
    this.pauseAutoplay(); // Clear any existing interval
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.slideSpeed);
    
    if (this.autoplayButton) {
      this.autoplayButton.classList.remove('paused');
    }
  }

  pauseAutoplay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    
    if (this.autoplayButton) {
      this.autoplayButton.classList.add('paused');
    }
  }

  toggleAutoplay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    
    if (this.isAutoPlaying) {
      this.startAutoplay();
    } else {
      this.pauseAutoplay();
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
    this.pauseAutoplay();
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
