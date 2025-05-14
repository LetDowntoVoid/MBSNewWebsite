function splitTextIntoWords(element) {
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
            console.log(length)
        } else {
            const bbox = element.getBBox();
            length = (bbox.width + bbox.height) * 2;
            console.warn(`Element with ID ${id} is not a supported type; using approximate length`);
        }

        lengths[id] = length;
        console.log(length)
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
        const color = `rgb(${Math.round(255 * (1 - fillProgress))}, ${Math.round(255 * fillProgress)}, 0)`;  // Change color to red
        element.setAttribute("fill", color); // This will interpolate the color
    });

    if (loadPercentage >= 100) {
        svgElements.forEach(id => {
            const element = paths[id];
            if (element) {
                element.style.strokeDashoffset = 0;
                element.classList.add("fill-complete");
            }
        });

        setTimeout(() =>{
          const headings = document.querySelectorAll('.logo-text, .texture_text');  
          headings.forEach(heading => {
              if (heading.closest('p')) return;
              const words = splitTextIntoWords(heading);
              gsap.set(words, { opacity: 0, y: 50 });
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
          gsap.set(box, { position: 'absolute' });
          gsap.to(box, {
            y: -(window.innerHeight),
            opacity: 0,             
            ease: 'power2.out',     
            duration: 2,
                  
          });
        },100);

        setTimeout(() => {
          const headings = document.querySelectorAll('.logo-text, .texture_text');
          
          headings.forEach(heading => {
              if (heading.closest('p')) return;
                  
              const words = splitTextIntoWords(heading);
              gsap.to(words, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  stagger: 0.1,
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
                  gsap.set(paragraph, { opacity: 0 });
              
                  // Direct animation without ScrollTrigger
                  gsap.to(paragraph, {
                      opacity: 1,
                      duration: 1.2,
                      ease: "power2.out"
                  });
              });
        }, 500);
    }
}


let progress = 0;
let simulationInterval;
const delayBeforeStart = 2000; // 2 seconds
const animationDuration = 5000; // 5 seconds
let startTime;

function simulateLoading() {
    setupSVG();

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

document.addEventListener('DOMContentLoaded', () => {
    simulateLoading();
});


document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Animate headings
  const headings = document.querySelectorAll('h1, h2, .title, .subtitle, .title-line-1, .title-line-2, .massive_title, #funText, #estd, .titleFooter');

  headings.forEach(heading => {
    if (heading.closest('p')) return;

    const words = splitTextIntoWords(heading);

    gsap.set(words, { opacity: 0, y: 50 });

    ScrollTrigger.create({
      trigger: heading,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(words, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
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
          duration: 1.2,
          ease: "power2.out"
        });
      }
    });
  });

  // Menu items
  const menuItems = document.querySelectorAll('.menu ul li a');

  menuItems.forEach((item, index) => {
    const words = splitTextIntoWords(item);

    gsap.set(words, { opacity: 0, y: 20 });

    gsap.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.05,
      delay: 0.3 + (index * 0.1),
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

    gsap.set(words, { opacity: 0, y: 15 });

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
      x: index % 2 === 0 ? -30 : 30
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

  // Logo image
  

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
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(paragraph, {
          opacity: 1,
          duration: 1.2,
          ease: "power2.out"
        });
      }
    });
  });


  ScrollTrigger.refresh();
});

