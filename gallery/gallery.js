console.log("I loaded");

// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  menu.classList.toggle('open');
  console.log("Hamburger Toggle");
});

document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('open')) {
    hamburger.classList.remove('open');
    menu.classList.remove('open');
  }
});

// JSON fetch (store in json variable)
var json = {};

// THREE.js scene setup
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.lookAt(0, 0, 0);

const container = document.querySelector('.cnv');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

let model;
let modelLoaded = false;

const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath('rsource/');
mtlLoader.load('BetterScan.mtl', (materials) => {
  materials.preload();

  const objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('rsource/');
  objLoader.load('BetterScan.obj', (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());

    const baseWidth = 1920;
    const baseScale = 2;
    const scaleFactor = (window.innerWidth / baseWidth) * baseScale;

    object.position.x -= center.x;
    object.position.y -= center.y + 3;
    object.position.z -= center.z;

    object.scale.setScalar(scaleFactor * 8.5);

    model = object;
    scene.add(model);
    modelLoaded = true;

    setupScrollAnimation();
    addFloatingAnimation();
  }, 

  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },

  (error) => {
    console.error('Error loading model:', error);
  });
});

function setupScrollAnimation() {
  if (!model) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger not found. Make sure they are properly loaded.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const initialY = model.position.y;

  gsap.to(model.rotation, {
    y: Math.PI * 0.35,
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  gsap.to(model.scale, {
    x: 0.5,
    y: 0.5,
    z: 0.5,
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  gsap.fromTo(model.position, 
    { y: initialY }, 
    { 
      y: initialY + 3, 
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onEnter: () => console.log("Scroll animation started"),
        onLeaveBack: () => console.log("Scrolled back to start")
      }
    }
  );
}

function addFloatingAnimation() {
  if (!model) return;

  gsap.killTweensOf(model.rotation, "z");

  gsap.to(model.rotation, {
    z: "+=0.025",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (modelLoaded) {
    const baseWidth = 1920;
    const baseScale = 2;
    const scaleFactor = (window.innerWidth / baseWidth) * baseScale;
    model.scale.setScalar(scaleFactor * 8.5);
  }

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});

// Main animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();


// Horizontal scroll effect for .scrolled_texts on desktop
function setupHorizontalScroll() {
  if (window.innerWidth <= 768) return;

  const sections = document.querySelectorAll(".section_scroll");
  const totalScroll = (sections.length - 1) * window.innerWidth;

  let enteringIndex = 0;
  let lastScrollY = window.scrollY;
  let scrollDirection = 1;

  // Create a ScrollTrigger for horizontal scrolling
  const horizontalScrollTrigger = gsap.to(".scrolled_texts", {
    x: () => `-${totalScroll}px`,
    ease: "none",
    scrollTrigger: {
      trigger: ".scrolled_texts",
      start: "top top",
      end: () => `+=${totalScroll}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: self => {
        // Update scroll direction
        scrollDirection = (self.scroll().y > lastScrollY) ? 1 : -1;
        lastScrollY = self.scroll().y;
        enteringIndex = Math.round(self.progress * (sections.length - 1));
        
        // Update timeline progress bar if it exists
        if (window.timelineProgressBar && typeof window.timelineProgressBar.update === 'function') {
          window.timelineProgressBar.update(self.progress);
        }
      },
      snap: (value) => {
        const slidesCount = sections.length - 1;
        const snapIncrement = 1 / slidesCount;
        let normalSnapIndex = Math.round(value / snapIncrement);
        const buffer = 0.15;
        const segmentStart = normalSnapIndex * snapIncrement;
        const segmentProgress = (value - segmentStart) / snapIncrement;

        if (scrollDirection === 1) {
          if (normalSnapIndex > enteringIndex && segmentProgress < buffer) {
            return enteringIndex * snapIncrement;
          }
        } else {
          if (normalSnapIndex < enteringIndex && segmentProgress > (1 - buffer)) {
            return enteringIndex * snapIncrement;
          }
        }
        return normalSnapIndex * snapIncrement;
      }
    }
  });

  // Listen for timeline click events
  window.addEventListener('timelineProgressClick', function(e) {
    const progress = e.detail.progress;
    
    // Calculate the scroll position based on progress
    const maxScroll = totalScroll;
    const scrollTarget = maxScroll * progress;
    
    // Use ScrollTrigger to scroll to this position
    ScrollTrigger.getAll()[0].scroll(scrollTarget);
  });
}

// Listen for the event from script 1
window.addEventListener('dynamicSectionsLoaded', () => {
  setupHorizontalScroll();
  ScrollTrigger.refresh();
});


