class PictureCardSlideshowComponent {
  constructor(element) {
    this.element = element;
    this.slidesContainer = this.element.querySelector('.picture-card-slideshow__slides');
    this.slides = this.element.querySelectorAll('.picture-card-slideshow__slide');
    this.originalSlides = Array.from(this.slides); // Store original slides
    
    this.isAutoPlaying = this.element.dataset.autoplay === 'true';
    this.slideSpeed = parseInt(this.element.dataset.speed) * 1000;
    this.slidesToShow = parseInt(this.element.dataset.slidesToShow);
    this.slidesToShowMobile = parseInt(this.element.dataset.slidesToShowMobile);
    this.animationEasing = this.element.dataset.animationEasing || 'linear';
    
    this.isInitialized = false;
    this.currentBreakpoint = null;
    
    this.init();
  }

  init() {
    if (this.originalSlides.length === 0) return;
    
    this.setupInfiniteScroll();
    this.setupHoverControls();
    this.setupIntersectionObserver();
    
    // Handle window resize with breakpoint check
    this.resizeHandler = this.debounce(() => {
      const newBreakpoint = window.innerWidth < 750 ? 'mobile' : 'desktop';
      // Only reinitialize if breakpoint changed
      if (newBreakpoint !== this.currentBreakpoint) {
        this.setupInfiniteScroll();
      }
    }, 250);
    
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  setupIntersectionObserver() {
    // Pause animation when slideshow is not visible
    if ('IntersectionObserver' in window && this.isAutoPlaying) {
      this.isVisible = true;
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isVisible = entry.isIntersecting;
          if (entry.isIntersecting && !this.isPausedByUser) {
            this.resumeAnimation();
          } else if (!entry.isIntersecting) {
            this.pauseAnimation();
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      this.observer.observe(this.element);
    }
  }

  setupInfiniteScroll() {
    if (this.originalSlides.length <= this.getCurrentSlidesToShow()) return;
    
    const slidesToShow = this.getCurrentSlidesToShow();
    const newBreakpoint = window.innerWidth < 750 ? 'mobile' : 'desktop';
    
    // Update current breakpoint
    this.currentBreakpoint = newBreakpoint;
    
    // Remove animation class before making changes to prevent glitches
    this.slidesContainer.classList.remove('infinite-scroll');
    
    // Force reflow to ensure animation is completely stopped
    void this.slidesContainer.offsetWidth;
    
    // Clear container
    this.slidesContainer.innerHTML = '';
    
    // Create enough clones for seamless infinite scroll
    // We need 2 complete sets for smooth looping
    const totalSlides = this.originalSlides.length * 2;
    
    for (let i = 0; i < totalSlides; i++) {
      const originalIndex = i % this.originalSlides.length;
      const slide = this.originalSlides[originalIndex].cloneNode(true);
      this.slidesContainer.appendChild(slide);
    }
    
    // Set CSS custom properties for animation
    const slideWidth = 100 / slidesToShow;
    const moveDistance = slideWidth * this.originalSlides.length; // Move exactly one set
    
    this.slidesContainer.style.setProperty('--slide-width', `${slideWidth}%`);
    this.slidesContainer.style.setProperty('--move-distance', `${moveDistance}%`);
    this.slidesContainer.style.setProperty('--animation-duration', `${this.slideSpeed}ms`);
    this.slidesContainer.style.setProperty('--animation-easing', this.animationEasing);
    
    // Add the infinite scroll class after a small delay to trigger fresh animation
    requestAnimationFrame(() => {
      this.slidesContainer.classList.add('infinite-scroll');
      this.isInitialized = true;
    });
  }

  setupHoverControls() {
    if (!this.isAutoPlaying || this.hoverControlsSetup) return;
    
    this.hoverControlsSetup = true;
    this.isPausedByUser = false;
    
    // Desktop hover events (only on devices that support hover)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.handleMouseEnter = () => {
        this.isPausedByUser = true;
        this.pauseAnimation();
      };
      
      this.handleMouseLeave = () => {
        this.isPausedByUser = false;
        if (this.isVisible !== false) {
          this.resumeAnimation();
        }
      };
      
      this.element.addEventListener('mouseenter', this.handleMouseEnter);
      this.element.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    // Mobile touch events (only on touch devices)
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      let touchStartTime = 0;
      let isTouching = false;
      
      this.handleTouchStart = (e) => {
        touchStartTime = Date.now();
        isTouching = true;
        this.isPausedByUser = true;
        this.pauseAnimation();
      };
      
      this.handleTouchEnd = () => {
        if (isTouching) {
          const touchDuration = Date.now() - touchStartTime;
          isTouching = false;
          this.isPausedByUser = false;
          
          // Only resume if it was a quick tap (not a long press)
          if (touchDuration < 500) {
            setTimeout(() => {
              if (this.isVisible !== false) {
                this.resumeAnimation();
              }
            }, 200);
          } else {
            // For long press, resume immediately
            if (this.isVisible !== false) {
              this.resumeAnimation();
            }
          }
        }
      };
      
      this.handleTouchCancel = () => {
        isTouching = false;
        this.isPausedByUser = false;
        if (this.isVisible !== false) {
          this.resumeAnimation();
        }
      };
      
      this.element.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      this.element.addEventListener('touchend', this.handleTouchEnd, { passive: true });
      this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: true });
    }
  }

  pauseAnimation() {
    if (this.slidesContainer && this.slidesContainer.classList.contains('infinite-scroll')) {
      this.slidesContainer.style.animationPlayState = 'paused';
    }
  }

  resumeAnimation() {
    if (this.slidesContainer && this.slidesContainer.classList.contains('infinite-scroll')) {
      this.slidesContainer.style.animationPlayState = 'running';
    }
  }

  getCurrentSlidesToShow() {
    return window.innerWidth < 750 ? this.slidesToShowMobile : this.slidesToShow;
  }

  // Cleanup method to prevent memory leaks
  destroy() {
    // Remove event listeners
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    if (this.handleMouseEnter) {
      this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    }
    
    if (this.handleMouseLeave) {
      this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    }
    
    if (this.handleTouchStart) {
      this.element.removeEventListener('touchstart', this.handleTouchStart);
    }
    
    if (this.handleTouchEnd) {
      this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    if (this.handleTouchCancel) {
      this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    }
    
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
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
}

// Initialize all slideshow components on the page
document.addEventListener('DOMContentLoaded', function() {
  const slideshowContainers = document.querySelectorAll('.picture-card-slideshow__container');
  slideshowContainers.forEach(container => {
    // Prevent double initialization
    if (!container.dataset.initialized) {
      container.dataset.initialized = 'true';
      new PictureCardSlideshowComponent(container);
    }
  });
});