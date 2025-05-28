fetch('eventdir.json')
  .then(response => {
    if (!response.ok) throw new Error("HTTP ERROR");
    return response.json();
  })
  .then(data => {
    const container = document.querySelector('.scrolled_texts');
    let currentYear = null;

    data.events.forEach((event, index) => {
      if (event.year !== currentYear) {
        currentYear = event.year;

        const yearSection = document.createElement('div');
        yearSection.className = 'fullscreen section_scroll';

        const h1 = document.createElement('h1');
        h1.className = 'textOnlySec';
        h1.style.fontFamily = `Arial, Helvetica, "Liberation Sans", "DejaVu Sans", sans-serif`;
        h1.innerHTML = `↘<span style='font-family: "Special Gothic Expanded One", sans-serif;'>${currentYear}</span>`;
        h1.id = `year${currentYear}`
        yearSection.appendChild(h1);
        container.appendChild(yearSection);
      }

      const section = document.createElement('div');
      section.className = 'fullscreen section_scroll';

      const card = document.createElement('div');
      card.className = 'card';

      const bgImage = document.createElement('div');
      bgImage.className = 'card_background';
      const imageUrl = `images/${event.imageFolderName}/${event.cover}`;
      bgImage.style.backgroundImage = `url(${imageUrl})`;
      card.appendChild(bgImage);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        Vibrant.from(img).getPalette().then(palette => {
          const vibrantColor = palette.Vibrant?.getHex() || '#444';
          card.style.boxShadow = `0 0 32px 8px ${vibrantColor}AA`; 
        }).catch(err => {
          console.warn('Palette error:', err);
        });
      };

      const title = document.createElement('h1');
      title.className = 'card_title';
      title.textContent = event.name;

      const desc = document.createElement('p');
      desc.className = 'card_desc';
      desc.textContent = event.description;
      title.appendChild(desc); 

      const date = document.createElement('h2');
      date.className = 'card_date';
      date.textContent = event.date;

      const button = document.createElement('button');
      button.className = 'showMeMore';
      button.setAttribute('data-index', index);

      card.appendChild(title);
      card.appendChild(date);
      card.appendChild(button);
      section.appendChild(card);
      container.appendChild(section);
    });

    window.dispatchEvent(new Event('dynamicSectionsLoaded'));
  })
  .catch(error => {
    console.warn("Error loading JSON:", error);
  });

document.addEventListener('DOMContentLoaded', function() {

  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'timeline-slider-container';
  sliderContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 18px;
    background-color: #1a1a1a;
    z-index: 1000;
    display: flex;
    align-items: center;
    padding: 0 5px;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  `;

  const progressBar = document.createElement('div');
  progressBar.className = 'timeline-progress-bar';
  progressBar.style.cssText = `
    width: 100%;
    height: 10px;
    background-color: #222;
    position: relative;
    border-radius: 5px;
  `;

  sliderContainer.appendChild(progressBar);

  const yearDropup = document.createElement('div');
  yearDropup.className = 'year-dropup';
  yearDropup.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    background-color: #222;
    border-radius: 10px 10px 0 0;
    padding: 0 5px; 
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    max-height: 0; 
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
    margin-bottom: 5px;
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.5);
  `;

  sliderContainer.appendChild(yearDropup);
  document.body.appendChild(sliderContainer);

  window.addEventListener('dynamicSectionsLoaded', function() {
    initializeTimelineSlider();
  });

  let horizontalScrollStartPosition = 0;
  let horizontalScrollHeight = 0;
  let years = [];
  let yearSections = [];
  let yearToSectionMap = {};

  function initializeTimelineSlider() {
    const scrolledTextsContainer = document.querySelector('.scrolled_texts');
    if (!scrolledTextsContainer) return;

    const sections = scrolledTextsContainer.querySelectorAll('.section_scroll');
    if (sections.length > 0) {
      const firstSection = sections[0];
      const rect = firstSection.getBoundingClientRect();
      horizontalScrollStartPosition = window.pageYOffset + rect.top;

      horizontalScrollHeight = Array.from(sections).reduce((total, section) => {
        return total + section.offsetHeight;
      }, 0);
    }

    yearSections = Array.from(sections).filter(section => 
      section.querySelector('h1.textOnlySec') !== null
    );

    years = [];
    yearToSectionMap = {};

    yearSections.forEach(section => {
      const yearSpan = section.querySelector('h1.textOnlySec span');
      if (yearSpan) {
        const yearText = yearSpan.textContent;
        if (!years.includes(yearText)) {
          years.push(yearText);
          yearToSectionMap[yearText] = section;
        }
      }
    });

    years.sort((a, b) => parseInt(b) - parseInt(a)); 

    years.forEach(year => {
      const yearButton = document.createElement('button');
      yearButton.className = 'year-button';
      yearButton.textContent = year;
      yearButton.style.cssText = `
        background-color: #333;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-family: "Special Gothic Expanded One", sans-serif;
        transition: all 0.2s ease;
      `;

      yearButton.addEventListener('mouseenter', () => {
        yearButton.style.backgroundColor = '#ff3366';
      });

      yearButton.addEventListener('mouseleave', () => {
        yearButton.style.backgroundColor = '#333';
      });

      yearButton.addEventListener('click', () => {

        const targetSection = yearToSectionMap[year];

        if (targetSection) {
          const targetPosition = targetSection.offsetTop;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });

      yearDropup.appendChild(yearButton);
    });

    const chronologicalYears = [...years].sort((a, b) => parseInt(a) - parseInt(b));
    chronologicalYears.forEach((year, index) => {
      const position = (index / (chronologicalYears.length - 1)) * 100;

      const yearMarker = document.createElement('div');
      yearMarker.className = 'year-marker';
      yearMarker.setAttribute('data-year', year);
      yearMarker.style.cssText = `
        position: absolute;
        left: ${position}%;
        height: 10px;
        width: 1px;
        background-color: #555;
        top: 0;
        transform: translateX(-50%);
        transition: all 0.2s ease;
      `;

      progressBar.appendChild(yearMarker);
    });

    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'progress-indicator';
    progressIndicator.style.cssText = `
      position: absolute;
      left: 0;
      top: -1px;
      width: 3px;
      height: 12px;
      background-color: #ff3366;
      transform: translateX(-50%);
      transition: left 0.2s ease;
      z-index: 2;
    `;

    progressBar.appendChild(progressIndicator);

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0%;
      background-color: #ff3366;
      transition: width 0.2s ease;
      border-radius: 5px 0 0 5px;
      z-index: 1;
    `;

    progressBar.insertBefore(progressFill, progressBar.firstChild);

    const currentYearPopup = document.createElement('div');
    currentYearPopup.className = 'current-year-popup';
    currentYearPopup.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background-color: #ff3366;
      color: white;
      padding: 5px 15px;
      border-radius: 15px;
      font-family: "Special Gothic Expanded One", sans-serif;
      font-size: 18px;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      margin-bottom: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      z-index: 1001;
    `;

    document.body.appendChild(currentYearPopup);

    window.addEventListener('scroll', updateProgressFromScroll);

    setupDropupInteraction();

    progressBar.addEventListener('click', function(e) {
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      const targetScrollPosition = horizontalScrollStartPosition + (clickPosition * horizontalScrollHeight);

      window.scrollTo({
        top: targetScrollPosition,
        behavior: 'smooth'
      });
    });

    updateProgressFromScroll();
  }

  function setupDropupInteraction() {
    const sliderContainer = document.querySelector('.timeline-slider-container');
    const yearDropup = document.querySelector('.year-dropup');

    sliderContainer.addEventListener('mouseenter', function() {
      yearDropup.style.maxHeight = '120px'; 
      yearDropup.style.padding = '10px 5px';
    });

    sliderContainer.addEventListener('mouseleave', function() {
      yearDropup.style.maxHeight = '0';
      yearDropup.style.padding = '0 5px';
    });
  }

  function updateProgressFromScroll() {
    if (horizontalScrollHeight === 0) return;

    const currentScroll = window.pageYOffset;

    const adjustedScroll = Math.max(0, currentScroll - horizontalScrollStartPosition);

    const scrollProgress = Math.min(1, adjustedScroll / horizontalScrollHeight);

    updateTimelineProgress(scrollProgress);

    updateYearPopup(currentScroll);
  }

  function updateYearPopup(currentScroll) {
    const currentYearPopup = document.querySelector('.current-year-popup');
    if (!currentYearPopup) return;

    let currentYear = null;
    let minDistance = Infinity;

    yearSections.forEach(section => {
      const sectionTop = section.offsetTop;
      const distance = Math.abs(currentScroll - sectionTop);

      if (distance < minDistance && distance < 100) {
        minDistance = distance;
        const yearSpan = section.querySelector('h1.textOnlySec span');
        if (yearSpan) {
          currentYear = yearSpan.textContent;
        }
      }
    });

    if (currentYear) {
      currentYearPopup.textContent = currentYear;
      currentYearPopup.style.opacity = '1';
      currentYearPopup.style.transform = 'translateX(-50%) translateY(0)';

      setTimeout(() => {
        currentYearPopup.style.opacity = '0';
        currentYearPopup.style.transform = 'translateX(-50%) translateY(-10px)';
      }, 2000);
    } else {
      currentYearPopup.style.opacity = '0';
      currentYearPopup.style.transform = 'translateX(-50%) translateY(-10px)';
    }
  }

  function updateTimelineProgress(progress) {

    progress = Math.max(0, Math.min(1, progress));

    const progressFill = document.querySelector('.progress-fill');
    const progressIndicator = document.querySelector('.progress-indicator');

    if (progressFill && progressIndicator) {
      const progressPercentage = progress * 100;
      progressFill.style.width = `${progressPercentage}%`;
      progressIndicator.style.left = `${progressPercentage}%`;
    }

    highlightYearMarkers(progress);
  }

  function highlightYearMarkers(scrollProgress) {
    const yearMarkers = document.querySelectorAll('.year-marker');
    const totalMarkers = yearMarkers.length;

    if (totalMarkers === 0) return;

    yearMarkers.forEach((marker, index) => {
      const markerPosition = index / (totalMarkers - 1);

      if (markerPosition <= scrollProgress) {
        marker.style.backgroundColor = '#ff3366';
        marker.style.height = '10px';
        marker.style.width = '2px';
      } else {
        marker.style.backgroundColor = '#555';
        marker.style.height = '10px';
        marker.style.width = '1px';
      }
    });
  }
});

const styleElement = document.createElement('style');
styleElement.textContent = `
  .timeline-slider-container {
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
    transition: opacity 0.3s ease;
  }

  .timeline-slider-container:hover {
    opacity: 1;
  }

  .timeline-progress-bar {
    cursor: pointer;
  }

  .timeline-progress-bar:hover .progress-indicator {
    height: 14px;
    top: -2px;
  }

  .year-marker {
    transition: all 0.2s ease;
  }

  .year-button:hover {
    box-shadow: 0 0 10px rgba(255, 51, 102, 0.7);
  }

  .current-year-popup {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }
`;

document.head.appendChild(styleElement);