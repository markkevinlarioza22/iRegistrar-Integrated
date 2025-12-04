// Carousel functionality

let slideIndex = 0;

function changeSlide(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  const slides = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.dot');
  
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;
  
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  slides[slideIndex].classList.add('active');
  dots[slideIndex].classList.add('active');
}

// Auto-advance carousel
setInterval(() => changeSlide(1), 5000);

// Mobile menu toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
  const menu = document.querySelector('.nav-menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});