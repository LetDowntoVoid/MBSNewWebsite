console.log("I loaded")
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  menu.classList.toggle('open');
  console.log("Hamburger Toggle")
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('open')) {
    hamburger.classList.remove('open');
    menu.classList.remove('open');
  }
});

