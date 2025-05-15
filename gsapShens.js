// Device detection utility
const deviceUtils = {
  isMobile: () => window.innerWidth < 768,
  isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024,
  getDeviceType: function() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }
};

// Adjust animation parameters based on device
function getDeviceSpecificParams() {
  const device = deviceUtils.getDeviceType();
  
  return {
    wordStagger: device === 'mobile' ? 0.05 : 0.1,
    paragraphDuration: device === 'mobile' ? 0.8 : 1.2,
    headingAnimationY: device === 'mobile' ? 25 : 50,
    menuItemDelay: device === 'mobile' ? 0.1 : 0.3,
    scrollTriggerStart: device === 'mobile' ? "top 85%" : "top 90%"
  };
}

function splitTextIntoWords(element) {
    // Skip if the element doesn't exist or has no childNodes
    if (!element || !element.childNodes) return [];
    
    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);

    textNodes.forEach(textNode => {
      const words = textNode.textContent.split(/\s+/).filter(Boolean);
      const fragment = document.createDocumentFragment();

      words.forEach(word => {
        const span = document.createElement('span');
        span.className = 'animated-word';
        span.textContent = word;
        fragment.appendChild(span);

        const space = document.createTextNode(' ');
        fragment.appendChild(space);
      });

      element.replaceChild(fragment, textNode);
    });

    return element.querySelectorAll('.animated-word');
}

const svgElements = ['loaderSVG'];

const paths = {};
const lengths = {};
let totalLength = 0;

function setupSVG() {
    svgElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID ${id} not found`);
            return;
        }

        paths[id] = element;

        let length;
        if (element.tagName.toLowerCase() === 'circle') {
            length = 2 * Math.PI * parseFloat(element.getAttribute('r'));
        } else if (element.tagName.toLowerCase() === 'path' && typeof element.getTotalLength === 'function') {
            length = element.getTotalLength();
        } else {
            const bbox = element.getBBox();
            length = (bbox.width + bbox.height) * 2;
            console.warn(`Element with ID ${id} is not a supported type; using approximate length`);
        }

        lengths[id] = length;
        totalLength += length;

        element.style.strokeDasharray = length;
        element.style.strokeDashoffset = length;
    });
}

function animateProgress(loadPercentage) {
    const loadingElement = document.getElementById('loading-info');
    if (loadingElement) {
        loadingElement.textContent = `Loading: ${Math.round(loadPercentage)}%`;
    }

    if (totalLength === 0) return;

    let currentOffset = 0;
    const targetOffset = totalLength * (1 - loadPercentage / 100);

    svgElements.forEach(id => {
        const element = paths[id];
        if (!element) return;

        const length = lengths[id];

        if (currentOffset + length <= targetOffset) {
            element.style.strokeDashoffset = 0;
        } else if (currentOffset < targetOffset && currentOffset + length > targetOffset) {
            const elementProgress = (currentOffset + length - targetOffset) / length;
            element.style.strokeDashoffset = length * (1 - elementProgress);
        } else {
            element.style.strokeDashoffset = length;
        }

        currentOffset += length;

        // Gradually change the fill color (optional)
        const fillProgress = loadPercentage / 100;
        const color = `rgb(${Math.round(255 * (1 - fillProgress))}, ${Math.round(255 * fillProgress)}, 0)`;
        element.setAttribute("fill", color);
    });

    if (loadPercentage >= 100) {
        svgElements.forEach(id => {
            const element = paths[id];
            if (element) {
                element.style.strokeDashoffset = 0;
                element.classList.add("fill-complete");
            }
        });

        // Keep loader removal animation for all devices
        setTimeout(() => {
          // Show all elements immediately on mobile instead of animating them
          if (deviceUtils.isMobile()) {
            // Make all elements visible on mobile instead of animating
            document.querySelectorAll('.animated-word, .logo-text, .texture_text, p, .info, .subtext, .imgLogo').forEach(el => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            });
          } else {
            // Do animation setup for desktop
            const params = getDeviceSpecificParams();
            
            const headings = document.querySelectorAll('.logo-text, .texture_text');  
            headings.forEach(heading => {
                if (heading.closest('p')) return;
                const words = splitTextIntoWords(heading);
                gsap.set(words, { opacity: 0, y: params.headingAnimationY });
            });
            
            const logoImg = document.querySelector('.imgLogo');
            if (logoImg) {
                gsap.set(logoImg, {
                    opacity: 0,
                    rotation: -5,
                    scale: 0.9
                });
            }
            
            const paragraphs = document.querySelectorAll('p:not(.texture_text), .info, .subtext');
            paragraphs.forEach(paragraph => {
                gsap.set(paragraph, { opacity: 0 });
            });
          }
          
          // Keep loader animation for all devices
          const box = document.getElementById('loader');
          if (box) {
              gsap.set(box, { position: 'absolute' });
              gsap.to(box, {
                y: -(window.innerHeight),
                opacity: 0,             
                ease: 'power2.out',     
                duration: deviceUtils.isMobile() ? 1.5 : 2,
              });
          }
        }, deviceUtils.isMobile() ? 50 : 100);

        setTimeout(() => {
          // Skip animations on mobile, directly set elements visible
          if (deviceUtils.isMobile()) {
            // Already made visible in previous timeout
            return;
          }
          
          // Continue with desktop animations
          const params = getDeviceSpecificParams();
          const headings = document.querySelectorAll('.logo-text, .texture_text');
          
          headings.forEach(heading => {
              if (heading.closest('p')) return;
                  
              const words = splitTextIntoWords(heading);
              gsap.to(words, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  stagger: params.wordStagger,
                  ease: "power3.out"
              });
          });
        
          const logoImg = document.querySelector('.imgLogo');
          if (logoImg) {
              gsap.to(logoImg, {
                  opacity: 0.25,
                  rotation: 0,
                  scale: 1,
                  duration: 1.2,
                  ease: "power2.out"
              });
          }
            
          const paragraphs = document.querySelectorAll('p:not(.texture_text), .info, .subtext');
          paragraphs.forEach(paragraph => {
              gsap.to(paragraph, {
                  opacity: 1,
                  duration: params.paragraphDuration,
                  ease: "power2.out"
              });
          });
        }, deviceUtils.isMobile() ? 100 : 500);
    }
}

let progress = 0;
let simulationInterval;
const animationDuration = deviceUtils.isMobile() ? 3000 : 5000; // Even shorter duration on mobile
let startTime;

function simulateLoading() {
    setupSVG();
    
    // Get device-specific delay
    const delayBeforeStart = deviceUtils.isMobile() ? 500 : 2000; // 0.5s on mobile, 2s on desktop

    setTimeout(() => {
        startTime = Date.now();

        simulationInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const targetProgress = Math.min(100, (elapsed / animationDuration) * 100);

            if (progress < targetProgress) {
                progress = targetProgress;
                animateProgress(progress);
            }

            if (progress >= 100) {
                clearInterval(simulationInterval);
            }
        }, 16);
    }, delayBeforeStart);
}

// Handle resize events
function handleResize() {
    // Only refresh ScrollTrigger if not on mobile
    if (!deviceUtils.isMobile() && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
    
    // Always update mobile-specific styles
    updateMobileStyles();
    
    // On resize, ensure all elements are visible on mobile
    if (deviceUtils.isMobile()) {
        showAllElementsForMobile();
    }
}

// Function to make all elements immediately visible on mobile
function showAllElementsForMobile() {
    if (!deviceUtils.isMobile()) return;
    
    // Make all elements visible that would normally be animated
    document.querySelectorAll('.animated-word, h1, h2, p, .info, .subtext, .title, .subtitle, .menu ul li a, .contact-item, .bubble, .camo, img, .footerCright').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

// Apply mobile-specific styles
function updateMobileStyles() {
    const isMobile = deviceUtils.isMobile();
    
    // Add or remove mobile class to body
    document.body.classList.toggle('mobile-device', isMobile);
    
    // Update any elements that need specific mobile adjustments
    const menuItems = document.querySelectorAll('.menu ul li a');
    menuItems.forEach(item => {
        item.style.fontSize = isMobile ? '16px' : '';
        item.style.padding = isMobile ? '8px' : '';
    });
    
    // Adjust font sizes for headings on mobile
    const headings = document.querySelectorAll('h1, h2, .title, .subtitle');
    headings.forEach(heading => {
        if (isMobile) {
            // Store original font size if not already stored
            if (!heading.dataset.originalFontSize) {
                heading.dataset.originalFontSize = window.getComputedStyle(heading).fontSize;
            }
            
            // Calculate smaller font size (about 70% of original)
            const originalSize = parseFloat(heading.dataset.originalFontSize);
            const mobileSize = Math.max(16, Math.round(originalSize * 0.7)); // Don't go smaller than 16px
            heading.style.fontSize = `${mobileSize}px`;
        } else {
            // Restore original font size if available
            if (heading.dataset.originalFontSize) {
                heading.style.fontSize = heading.dataset.originalFontSize;
            } else {
                heading.style.fontSize = '';
            }
        }
    });
    
    // If on mobile, make all elements visible
    if (isMobile) {
        showAllElementsForMobile();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    updateMobileStyles();
    simulateLoading();
    
    // Set up resize handler
    window.addEventListener('resize', handleResize);
    
    if (typeof gsap !== 'undefined') {
        // Check if ScrollTrigger is available
        if (typeof ScrollTrigger !== 'undefined' && !deviceUtils.isMobile()) {
            gsap.registerPlugin(ScrollTrigger);
            setupScrollAnimations();
        } else if (deviceUtils.isMobile()) {
            console.log('Mobile device detected. Scroll animations disabled.');
            // Ensure all elements are visible on mobile
            showAllElementsForMobile();
        } else {
            console.warn('ScrollTrigger not available. Some animations may not work.');
        }
    } else {
        console.warn('GSAP not available. Animations disabled.');
    }
});

function setupScrollAnimations() {
    // Skip setting up scroll animations on mobile
    if (deviceUtils.isMobile()) {
        return;
    }
    
    // Get device-specific parameters
    const params = getDeviceSpecificParams();

    // Animate headings
    const headings = document.querySelectorAll('h1, h2, .title, .subtitle, .title-line-1, .title-line-2, .massive_title, #funText, #estd, .titleFooter');

    headings.forEach(heading => {
        if (heading.closest('p')) return;

        const words = splitTextIntoWords(heading);

        gsap.set(words, { opacity: 0, y: params.headingAnimationY });

        ScrollTrigger.create({
            trigger: heading,
            start: params.scrollTriggerStart,
            once: true,
            onEnter: () => {
                gsap.to(words, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: params.wordStagger,
                    ease: "power3.out"
                });
            }
        });
    });

    // Animate paragraphs
    const paragraphs = document.querySelectorAll('p:not(.texture_text), .info');

    paragraphs.forEach(paragraph => {
        gsap.set(paragraph, { opacity: 0 });

        ScrollTrigger.create({
            trigger: paragraph,
            start: "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(paragraph, {
                    opacity: 1,
                    duration: params.paragraphDuration,
                    ease: "power2.out"
                });
            }
        });
    });

    // Menu items
    const menuItems = document.querySelectorAll('.menu ul li a');

    menuItems.forEach((item, index) => {
        const words = splitTextIntoWords(item);

        gsap.set(words, { 
            opacity: 0, 
            y: 20 
        });

        gsap.to(words, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            delay: params.menuItemDelay + (index * 0.1),
            ease: "power2.out"
        });
    });

    // Bubble text
    const bubbleText = document.querySelector('.bubble.abtdrop');
    if (bubbleText) {
        gsap.set(bubbleText, {
            opacity: 0,
            scale: 0.8,
            y: 30
        });

        ScrollTrigger.create({
            trigger: '#AboutUsPreface',
            start: "top 60%",
            once: true,
            onEnter: () => {
                gsap.to(bubbleText, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        });
    }

    // Camo links
    const camoLinks = document.querySelectorAll('a.camo');

    camoLinks.forEach(link => {
        const words = splitTextIntoWords(link);

        gsap.set(words, { 
            opacity: 0, 
            y: 15 
        });

        ScrollTrigger.create({
            trigger: link,
            start: "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(words, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: "power3.out"
                });
            }
        });
    });

    // Contact items
    const contactItems = document.querySelectorAll('.contact-item');

    contactItems.forEach((item, index) => {
        gsap.set(item, {
            opacity: 0,
            x: (index % 2 === 0 ? -30 : 30)
        });

        ScrollTrigger.create({
            trigger: '#Contact',
            start: "top 70%",
            once: true,
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: "power2.out"
                });
            }
        });
    });

    // Team image
    const teamImg = document.querySelector('#AboutUs img');
    if (teamImg) {
        gsap.set(teamImg, {
            opacity: 0,
            y: 40
        });

        ScrollTrigger.create({
            trigger: teamImg,
            start: "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(teamImg, {
                    opacity: 1,
                    y: "-25%",
                    duration: 1,
                    ease: "power3.out",
                });
            }
        });
    }

    const footP = document.querySelectorAll('.footerCright');

    footP.forEach(paragraph => {
        gsap.set(paragraph, { opacity: 0 });

        ScrollTrigger.create({
            trigger: paragraph,
            start: params.scrollTriggerStart,
            once: true,
            onEnter: () => {
                gsap.to(paragraph, {
                    opacity: 1,
                    duration: params.paragraphDuration,
                    ease: "power2.out"
                });
            }
        });
    });

    // Ensure ScrollTrigger is refreshed
    ScrollTrigger.refresh();
}