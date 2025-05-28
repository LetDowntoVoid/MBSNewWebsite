var json = {};
fetch('eventdir.json')
  .then(response => {
    if (!response.ok) throw new Error("HTTP ERROR");
    return response.json();
  })
  .then(data => {
    json = data;
  })
  .catch(error => {
    console.error('Error loading JSON:', error);
  });

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('showMeMore')) {
    const button = e.target;
    const index = button.getAttribute('data-index');
    console.log('Button clicked:', index);
    expandCard(index, button.closest('.manItem'));
  }
});

function expandCard(index, card) {
  console.log(`Expanding card at index ${index}`, card);

  const scrollableContent = document.getElementById('scrollableContent');
  scrollableContent.innerHTML = '';

  showLoadingIndicator();

  loadEventContent(index);

}

function showLoadingIndicator() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loadingOverlay';
  loadingOverlay.className = 'loading-overlay';

  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';

  loadingOverlay.appendChild(spinner);
  document.body.appendChild(loadingOverlay);

  if (!document.getElementById('loadingStyles')) {
    const loadingStyles = document.createElement('style');
    loadingStyles.id = 'loadingStyles';
    loadingStyles.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(loadingStyles);
  }
}

function hideLoadingIndicator() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function loadEventContent(eventIndex) {
  if (!json.events || !json.events[eventIndex]) {
    console.error('Event not found at index:', eventIndex);
    hideLoadingIndicator();
    return;
  }

  const event = json.events[eventIndex];
  const scrollableContent = document.getElementById('scrollableContent');

  scrollableContent.innerHTML = '';

  const eventTitle = document.createElement('h1');
  eventTitle.className = 'eventBodyTitle';
  eventTitle.textContent = event.name;
  scrollableContent.appendChild(eventTitle);

  if (event.date) {
    const eventDate = document.createElement('h2');
    eventDate.className = 'eventDate';
    eventDate.textContent = event.date;
    scrollableContent.appendChild(eventDate);
  }

  let contentToLoad = 0;
  let contentLoaded = 0;
  let hasGallery = false;
  let galleryLoaded = false;

  function checkAllContentLoaded() {
    contentLoaded++;
    console.log(`Content loaded: ${contentLoaded}/${contentToLoad}`);

    if (contentLoaded >= contentToLoad && (!hasGallery || galleryLoaded)) {
      console.log('All content loaded, opening modal');
      hideLoadingIndicator();

      setTimeout(() => {
        openModal();
        setTimeout(() => setupHorizontalScroll(), 100);
      }, 200);
    }
  }

  if (event.contentInfo && Array.isArray(event.contentInfo)) {
    event.contentInfo.forEach(content => {
      if (content.section === false) {
        const textElement = document.createElement('h1');
        textElement.className = content.class || 'eventTitle';
        textElement.textContent = content.text;
        scrollableContent.appendChild(textElement);
      } else if (content.section === true) {
        const infoSection = document.createElement('div');
        infoSection.className = 'infoSection';

        if (content.heading && content.content) {
          if (content.imageUrl || content.imageSubtitle) {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = content.imageCircle ? 'imageWrapper circle' : 'imageWrapper';

            if (content.imageUrl) {
              contentToLoad++; 

              const img = document.createElement('img');
              img.src = content.imageUrl;
              img.alt = 'Person';
              img.className = 'sectionImage';
              imageWrapper.appendChild(img);

              img.onload = checkAllContentLoaded;
              img.onerror = checkAllContentLoaded;
            }

            if (content.imageSubtitle) {
              const subtitle = document.createElement('h2');
              subtitle.className = 'infoSubtitle';
              subtitle.textContent = content.imageSubtitle;
              imageWrapper.appendChild(subtitle);
            }

            infoSection.appendChild(imageWrapper);
          }

          const infoText = document.createElement('div');
          infoText.className = 'infoText';

          const infoTitle = document.createElement('h1');
          infoTitle.className = 'infoTitle';
          infoTitle.textContent = content.heading;
          infoText.appendChild(infoTitle);

          const infoContent = document.createElement('p');
          infoContent.className = 'infoContent';
          infoContent.textContent = content.content;
          infoText.appendChild(infoContent);

          infoSection.appendChild(infoText);
        }

        if (content.mapLocation) {
          contentToLoad++; 

          const mapOuter = document.createElement('div');
          mapOuter.className = 'mapouter';

          const gmapCanvas = document.createElement('div');
          gmapCanvas.className = 'gmap_canvas';

          const iframe = document.createElement('iframe');
          iframe.className = 'gmap_iframe';
          iframe.width = '100%';
          iframe.frameBorder = '0';
          iframe.scrolling = 'no';
          iframe.marginHeight = '0';
          iframe.marginWidth = '0';
          iframe.src = content.mapLocation;

          iframe.onload = checkAllContentLoaded;
          iframe.onerror = checkAllContentLoaded;

          gmapCanvas.appendChild(iframe);
          mapOuter.appendChild(gmapCanvas);
          infoSection.appendChild(mapOuter);
        }

        scrollableContent.appendChild(infoSection);
      } else if (content.imageGallery === true) {
        hasGallery = true;
        galleryLoaded = false;

        const gallerySection = document.createElement('div');
        gallerySection.className = 'infoSection';

        const scrollGrid = document.createElement('div');
        scrollGrid.className = 'scrollGrid';
        scrollGrid.id = 'masonryGrid';

        gallerySection.appendChild(scrollGrid);
        scrollableContent.appendChild(gallerySection);

        loadImageGallery(
          event.imageFolderName, 
          scrollGrid, 
          () => {}, 
          () => {}, 
          () => {
            galleryLoaded = true;
            console.log('Gallery loaded completely');
            checkAllContentLoaded();
          } 
        );
      }
    });
  }

  if (contentToLoad === 0 && !hasGallery) {
    hideLoadingIndicator();
    openModal();
    setTimeout(() => setupHorizontalScroll(), 100);
  } else {
    console.log(`Waiting for ${contentToLoad} content items to load${hasGallery ? ' and gallery' : ''}...`);
  }
}

function loadImageGallery(folderName, gridContainer, onImageLoad, trackImage, onGalleryComplete) {
  let imageIndex = 1;
  let loadedImages = 0;
  let imagesInProgress = 0;
  let hasReachedEnd = false;

  function checkAndLoadImage() {
    if (hasReachedEnd) return;

    const img = new Image();
    const imagePath = `images/${folderName}/${imageIndex}.jpg`;

    imagesInProgress++;

    img.onload = function() {
      const manItem = document.createElement('div');
      manItem.className = 'manItem';

      const manImg = document.createElement('img');
      manImg.className = 'manImg';
      manImg.src = imagePath;
      manImg.alt = `Gallery image ${imageIndex}`;

      manItem.appendChild(manImg);
      gridContainer.appendChild(manItem);

      loadedImages++;
      imageIndex++;
      imagesInProgress--;

      onImageLoad();

      if (isModalOpen) {
        checkForNewContent();
      }

      setTimeout(checkAndLoadImage, 10);
    };

    img.onerror = function() {
      imagesInProgress--;
      hasReachedEnd = true; 

      if (imageIndex === 1) {
        console.log('No images found in gallery');
      } else {
        console.log(`Loaded ${loadedImages} images for gallery`);
      }

      if (imagesInProgress === 0) {
        finalizeGallery();
      }
    };

    img.src = imagePath;
  }

  function finalizeGallery() {
    if (loadedImages > 0) {

      setTimeout(() => {
        if (window.masonry) {
          window.masonry.layoutItems(true); 
        } else {
          window.masonry = new SmartMasonry(true); 
        }

        setTimeout(() => {
          if (onGalleryComplete) onGalleryComplete();

          if (isModalOpen) {
            checkForNewContent();
            setupHorizontalScroll();
          }
        }, 200);
      }, 100);
    } else {

      if (onGalleryComplete) onGalleryComplete();
    }
  }

  checkAndLoadImage();
}

class SmartMasonry {
  constructor(finalLayout = false) {
    this.container = document.getElementById('masonryGrid');
    if (!this.container) {
      console.warn('Masonry container not found');
      return;
    }
    this.containerHeight = this.container.offsetHeight || 500;
    this.itemWidth = 200;
    this.gap = 12;
    this.columns = [];
    this.imagesToLoad = 0;
    this.finalLayout = finalLayout;
    this.init();
  }

  init() {
    this.layoutItems(this.finalLayout);
    this.container.addEventListener('load', () => this.layoutItems(), true);
  }

  layoutItems(finalLayout = false) {
    const items = Array.from(this.container.children);
    this.columns = [];
    this.imagesToLoad = 0;

    items.forEach((item) => {
      const img = item.querySelector('img');
      if (!img) return;

      if (img.complete && img.naturalHeight > 0) {
        this.positionItem(item, img);
      } else {
        this.imagesToLoad++;
        img.onload = () => {
          this.positionItem(item, img);
          this.imagesToLoad--;
          if (this.imagesToLoad === 0) {
            this.onLayoutComplete(finalLayout);
          }
        };
      }
    });

    if (this.imagesToLoad === 0) {
      this.onLayoutComplete(finalLayout);
    }
  }

  positionItem(item, img) {
    const imgHeight = img.offsetHeight || (img.naturalHeight * (this.itemWidth / img.naturalWidth));
    const itemHeight = imgHeight;

    let bestColumn = this.findBestColumn(itemHeight);
    if (bestColumn === null) {
      bestColumn = this.createNewColumn();
    }

    const x = bestColumn.x;
    const y = bestColumn.currentHeight;

    item.style.position = 'absolute';
    item.style.left = x + 'px';
    item.style.top = y + 'px';
    item.style.width = this.itemWidth + 'px';

    bestColumn.currentHeight += itemHeight + this.gap;

    const maxX = Math.max(...this.columns.map(col => col.x + this.itemWidth));
    this.container.style.width = (maxX + this.itemWidth) + 'px';
  }

  findBestColumn(itemHeight) {
    const containerHeight = this.containerHeight - this.gap;
    for (let column of this.columns) {
      if (column.currentHeight + itemHeight <= containerHeight) {
        return column;
      }
    }
    return null;
  }

  createNewColumn() {
    const newX = this.columns.length > 0
      ? Math.max(...this.columns.map(col => col.x)) + this.itemWidth + this.gap
      : 0;
    const newColumn = {
      x: newX,
      currentHeight: 0
    };
    this.columns.push(newColumn);
    return newColumn;
  }

  addImage(src, alt = 'Dynamic Image') {
    const item = document.createElement('div');
    item.className = 'manItem';

    const img = document.createElement('img');
    img.className = 'manImg';
    img.src = src;
    img.alt = alt;

    item.appendChild(img);
    this.container.appendChild(item);

    img.onload = () => {
      this.layoutItems();
    };
  }

  onLayoutComplete(finalLayout = false) {

    const maxHeight = this.columns.length > 0 
      ? Math.max(...this.columns.map(col => col.currentHeight))
      : 0;

    if (maxHeight > 0) {
      this.container.style.height = maxHeight + 'px';
    }

    const totalWidth = this.container.style.width;
    const event = new CustomEvent('masonryLayoutComplete', {
      detail: { 
        width: totalWidth,
        height: maxHeight,
        finalLayout: finalLayout
      }
    });
    this.container.dispatchEvent(event);

    if (finalLayout) {
      console.log(`Masonry final layout complete - Width: ${totalWidth}, Height: ${maxHeight}px`);
    }
  }
}
let masonry;
window.addEventListener('load', () => {
  masonry = new SmartMasonry();
});

function addImage(src, alt) {
  if (masonry) {
    masonry.addImage(src, alt);
  }
}

const modal = document.getElementById('eventModal');
const closeBtn = document.getElementById('closeBtn');
const body = document.body;

let scrollTween;
let isModalOpen = false;
let isMobile = window.innerWidth <= 768;
let lastContentWidth = 0; 

function checkMobile() {
  isMobile = window.innerWidth <= 768;
}

function checkInitialModalState() {
  const hasActiveClass = modal.classList.contains('active');
  const modalDisplay = window.getComputedStyle(modal).display;
  const modalOpacity = window.getComputedStyle(modal).opacity;

  if (hasActiveClass && modalOpacity !== '0') {
    isModalOpen = true;
    body.style.overflow = 'hidden';
    setTimeout(() => setupHorizontalScroll(), 100);
  } else {
    isModalOpen = false;
    body.style.overflow = '';
    cleanupModalScroll();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkInitialModalState);
} else {
  checkInitialModalState();
}

window.addEventListener('resize', () => {
  checkMobile();
  if (isModalOpen) {
    setupHorizontalScroll();
  }
});

document.addEventListener('masonryLayoutComplete', (event) => {
  if (isModalOpen) {
    const detail = event.detail || {};

    if (detail.finalLayout) {
      console.log(`Masonry final layout complete - adjusting scroll with width: ${detail.width}`);

      setTimeout(() => {
        checkForNewContent();
        setupHorizontalScroll();
      }, 100);
    }
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const hasActiveClass = modal.classList.contains('active');
      const modalDisplay = window.getComputedStyle(modal).display;
      const modalOpacity = window.getComputedStyle(modal).opacity;

      if (hasActiveClass) {
        if (!isModalOpen) {
          isModalOpen = true;
          body.style.overflow = 'hidden';
        }
      } else {
        if (isModalOpen) {
          isModalOpen = false;
          body.style.overflow = '';
          cleanupModalScroll();
        }
      }
    }
  });
});
observer.observe(modal, { attributes: true });

function checkForNewContent() {
  const scrollableContent = document.getElementById('scrollableContent');
  if (!scrollableContent) return false;

  const currentWidth = scrollableContent.scrollWidth;
  const masonryGrid = document.getElementById('masonryGrid');

  let masonryWidth = 0;
  if (masonryGrid) {
    const gridStyle = window.getComputedStyle(masonryGrid);
    masonryWidth = parseInt(gridStyle.width, 10) || 0;
  }

  const expectedWidth = Math.max(currentWidth, masonryWidth);

  if (expectedWidth > lastContentWidth) {
    console.log(`Content width increased from ${lastContentWidth}px to ${expectedWidth}px`);
    lastContentWidth = expectedWidth;
    return true;
  }

  return false;
}

function setupHorizontalScroll() {
  if (!isMobile) {
    const eventBody = modal.querySelector('.eventBody');
    const scrollableContent = document.getElementById('scrollableContent');
    if (!eventBody || !scrollableContent) return;

    const currentScrollLeft = eventBody.scrollLeft;
    cleanupModalScroll();

    const masonryGrid = document.getElementById('masonryGrid');
    let totalWidth = scrollableContent.scrollWidth;

    if (masonryGrid) {
      const masonryStyle = window.getComputedStyle(masonryGrid);
      const masonryWidth = parseInt(masonryStyle.width, 10) || 0;
      totalWidth = Math.max(totalWidth, masonryWidth);
    }

    lastContentWidth = totalWidth;

    const containerWidth = eventBody.clientWidth;
    const maxScroll = totalWidth - containerWidth;

    console.log(`Setting up scroll: Content width: ${totalWidth}px, Container: ${containerWidth}px, Max scroll: ${maxScroll}px`);

    if (maxScroll > 0) {
      scrollTween = gsap.to(eventBody, {
        scrollLeft: maxScroll,
        ease: "none",
        paused: true,
        duration: 1
      });

      const currentProgress = Math.min(currentScrollLeft / maxScroll, 1);
      scrollTween.progress(currentProgress);

      const handleWheel = (e) => {
        if (!isModalOpen || isMobile) return;
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY || e.deltaX;
        const progress = scrollTween.progress();
        const step = 0.2;
        let newProgress = progress + (delta > 0 ? step : -step);

        if (newProgress >= 1 && delta > 0) {
          if (checkForNewContent()) {
            console.log('New content detected, updating scroll bounds');
            setupHorizontalScroll();
            return;
          }
        }

        newProgress = Math.max(0, Math.min(1, newProgress));
        gsap.to(scrollTween, {
          progress: newProgress,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      modal._wheelHandler = handleWheel;
      modal.addEventListener('wheel', handleWheel, { passive: false });
    }
  }
}

function cleanupModalScroll() {
  if (scrollTween) {
    scrollTween.kill();
    scrollTween = null;
  }
  if (modal._wheelHandler) {
    modal.removeEventListener('wheel', modal._wheelHandler);
    modal._wheelHandler = null;
  }

}

function openModal() {
  console.log('Opening modal');
  modal.classList.add('active');

  lastContentWidth = 0;

  checkForNewContent();

  setTimeout(() => setupHorizontalScroll(), 200);
}

function closeModal() {
  modal.classList.remove('active');
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isModalOpen) {
    closeModal();
  }
});
document.addEventListener('wheel', (e) => {
  if (isModalOpen && !isMobile) {
    if (!modal.contains(e.target)) {
      e.preventDefault();
    }
  }
}, { passive: false });

let startX = 0;
let currentX = 0;
let isDragging = false;
if ('ontouchstart' in window) {
  document.addEventListener('touchstart', (e) => {
    if (isMobile || !isModalOpen) return;
    const scrollableContent = document.getElementById('scrollableContent');
    if (!scrollableContent || !scrollableContent.contains(e.target)) return;
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || isMobile || !isModalOpen) return;
    e.preventDefault();
    currentX = e.touches[0].clientX;
    const deltaX = startX - currentX;

    if (scrollTween) {
      const progress = scrollTween.progress();
      const newProgress = progress + (deltaX * 0.001);

      if (newProgress >= 1 && deltaX > 0) {
        if (checkForNewContent()) {
          console.log('New content detected during touch, updating scroll bounds');
          setupHorizontalScroll();
          return;
        }
      }

      scrollTween.progress(Math.max(0, Math.min(1, newProgress)));
    }
  });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
}