const sliderContainer = document.querySelector('.slider-container');
const slides = document.querySelectorAll('.slides');

let currentSlide = 0;
let slideInterval = setInterval(nextSlide, 3000); // change the interval time as needed

function nextSlide() {
    slides.forEach((slide, index) => {
        slide.style.opacity = (index === currentSlide) ? '1' : '0';
    });
    currentSlide = (currentSlide + 1) % slides.length;
}

sliderContainer.addEventListener('mouseover', () => {
    clearInterval(slideInterval);
});

sliderContainer.addEventListener('mouseout', () => {
    slideInterval = setInterval(nextSlide, 3000);
});