document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.hero');
  const imageCount = 3;
  let lastSpawnTime = 0;
  const spawnDelay = 100; // milliseconds between spawns (adjust as needed)

  heroSection.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSpawnTime < spawnDelay) return;
    lastSpawnTime = now;

    const img = document.createElement('img');
    const randomIndex = Math.floor(Math.random() * imageCount) + 1;
    img.src = `src/heroElements/${randomIndex}.png`;
    img.classList.add('falling-image');

    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      const maxSize = 150;
      let width = naturalWidth;
      let height = naturalHeight;
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width = width * scale;
        height = height * scale;
      }

      img.style.width = `${width}px`;
      img.style.height = `${height}px`;

      img.style.left = `${e.pageX - width / 2}px`;
      img.style.top = `${e.pageY - height / 2}px`;

      document.body.appendChild(img);

      setTimeout(() => {
        img.remove();
      }, 1200);
    };
  });
});
