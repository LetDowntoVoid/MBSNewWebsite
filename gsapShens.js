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

        // Get device-specific parameters
        const params = getDeviceSpecificParams();

        setTimeout(() => {
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
          const headings = document.querySelectorAll('.logo-text, .texture_text');
          
          headings.forEach(heading => {
              if (heading.closest('p')) return;
                  
              const words = splitTextIntoWords(heading);
              gsap.to(words, {
                  opacity: 1,
                  y: 0,
                  duration: deviceUtils.isMobile() ? 0.6 : 0.8,
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
                  duration: deviceUtils.isMobile() ? 1 : 1.2,
                  ease: "power2.out"
              });
          }
            
          const paragraphs = document.querySelectorAll('p:not(.texture_text), .info, .subtext');
          paragraphs.forEach(paragraph => {
              gsap.set(paragraph, { opacity: 0 });
          
              // Direct animation without ScrollTrigger
              gsap.to(paragraph, {
                  opacity: 1,
                  duration: params.paragraphDuration,
                  ease: "power2.out"
              });
          });
        }, deviceUtils.isMobile() ? 300 : 500);
    }
}

let progress = 0;
let simulationInterval;
const animationDuration = deviceUtils.isMobile() ? 4000 : 5000; // Shorter duration on mobile
let startTime;

function simulateLoading() {
    setupSVG();
    
    // Get device-specific delay
    const delayBeforeStart = deviceUtils.isMobile() ? 1000 : 2000; // 1s on mobile, 2s on desktop

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
    // Refresh ScrollTrigger on resize
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
    
    // Update mobile-specific styles
    updateMobileStyles();
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
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    updateMobileStyles();
    simulateLoading();
    
    // Set up resize handler
    window.addEventListener('resize', handleResize);
    
    if (typeof gsap !== 'undefined') {
        // Check if ScrollTrigger is available
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        } else {
            console.warn('ScrollTrigger not available. Some animations may not work.');
        }
        
        setupScrollAnimations();
    } else {
        console.warn('GSAP not available. Animations disabled.');
    }
});

function setupScrollAnimations() {
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
                    duration: deviceUtils.isMobile() ? 0.6 : 0.8,
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
            start: deviceUtils.isMobile() ? "top 85%" : "top 80%",
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

    // Menu items - adjust for mobile
    const menuItems = document.querySelectorAll('.menu ul li a');

    menuItems.forEach((item, index) => {
        const words = splitTextIntoWords(item);

        gsap.set(words, { 
            opacity: 0, 
            y: deviceUtils.isMobile() ? 10 : 20 
        });

        gsap.to(words, {
            opacity: 1,
            y: 0,
            duration: deviceUtils.isMobile() ? 0.3 : 0.5,
            stagger: deviceUtils.isMobile() ? 0.03 : 0.05,
            delay: params.menuItemDelay + (index * (deviceUtils.isMobile() ? 0.05 : 0.1)),
            ease: "power2.out"
        });
    });

    // Bubble text - make more compact on mobile
    const bubbleText = document.querySelector('.bubble.abtdrop');
    if (bubbleText) {
        gsap.set(bubbleText, {
            opacity: 0,
            scale: deviceUtils.isMobile() ? 0.7 : 0.8,
            y: deviceUtils.isMobile() ? 15 : 30
        });

        ScrollTrigger.create({
            trigger: '#AboutUsPreface',
            start: deviceUtils.isMobile() ? "top 70%" : "top 60%",
            once: true,
            onEnter: () => {
                gsap.to(bubbleText, {
                    opacity: 1,
                    scale: deviceUtils.isMobile() ? 0.9 : 1,
                    y: 0,
                    duration: deviceUtils.isMobile() ? 0.8 : 1,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        });
    }

    // Camo links - smaller movement on mobile
    const camoLinks = document.querySelectorAll('a.camo');

    camoLinks.forEach(link => {
        const words = splitTextIntoWords(link);

        gsap.set(words, { 
            opacity: 0, 
            y: deviceUtils.isMobile() ? 8 : 15 
        });

        ScrollTrigger.create({
            trigger: link,
            start: deviceUtils.isMobile() ? "top 85%" : "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(words, {
                    opacity: 1,
                    y: 0,
                    duration: deviceUtils.isMobile() ? 0.4 : 0.6,
                    stagger: deviceUtils.isMobile() ? 0.05 : 0.08,
                    ease: "power3.out"
                });
            }
        });
    });

    // Contact items - less movement on mobile
    const contactItems = document.querySelectorAll('.contact-item');

    contactItems.forEach((item, index) => {
        gsap.set(item, {
            opacity: 0,
            x: deviceUtils.isMobile() 
                ? (index % 2 === 0 ? -15 : 15) 
                : (index % 2 === 0 ? -30 : 30)
        });

        ScrollTrigger.create({
            trigger: '#Contact',
            start: deviceUtils.isMobile() ? "top 80%" : "top 70%",
            once: true,
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    x: 0,
                    duration: deviceUtils.isMobile() ? 0.6 : 0.8,
                    delay: index * (deviceUtils.isMobile() ? 0.1 : 0.2),
                    ease: "power2.out"
                });
            }
        });
    });

    // Team image - adjust for mobile
    const teamImg = document.querySelector('#AboutUs img');
    if (teamImg) {
        gsap.set(teamImg, {
            opacity: 0,
            y: deviceUtils.isMobile() ? 20 : 40
        });

        ScrollTrigger.create({
            trigger: teamImg,
            start: deviceUtils.isMobile() ? "top 85%" : "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(teamImg, {
                    opacity: 1,
                    y: deviceUtils.isMobile() ? "-15%" : "-25%",
                    duration: deviceUtils.isMobile() ? 0.8 : 1,
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

    ScrollTrigger.refresh();
}