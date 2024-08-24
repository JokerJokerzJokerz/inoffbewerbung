function toggleBurgerMenu() {
  document.querySelector(".left-side").classList.toggle("active");
  document.querySelector(".overlay-app").classList.toggle("is-active");
}

function closeBurgerMenu() {
  document.querySelector(".left-side").classList.remove("active");
  document.querySelector(".overlay-app").classList.remove("is-active");
}

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(function (page) {
    page.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");
  window.scrollTo(0, 0);
  closeBurgerMenu();
}

$(function () {
  $(".menu-link").click(function () {
    $(".menu-link").removeClass("is-active");
    $(this).addClass("is-active");
  });
});

const toggleButton = document.querySelector(".dark-light");
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  const color = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(
      document.body.classList.contains("light-mode")
        ? "--theme-color-light"
        : "--theme-color-dark"
    )
    .trim();
  document.body.style.color = color;
});

window.addEventListener("load", function () {
  const canvas = document.querySelector(".particle-net");
  const context = canvas.getContext("2d");
  let particles = [];
  let animationFrameId;
  const mousePos = { x: -9999, y: -9999 };

  const friction = 0.98; // Friction coefficient

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    generateParticles(Math.floor((canvas.width * canvas.height) / 3000));
  }

  function generateParticles(count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push(new Particle(x, y, context));
    }
  }

  function loop(timestamp) {
    const deltaTime = (timestamp - (loop.lastTimestamp || 0)) / 1000;
    loop.lastTimestamp = timestamp;

    context.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
      particle.update(deltaTime, canvas.width, canvas.height);
      particle.repulseFromMouse(mousePos, deltaTime);
      particle.draw();
      linkParticles(particle, index);
    });

    animationFrameId = requestAnimationFrame(loop);
  }

  function linkParticles(particle, index) {
    for (let i = index + 1; i < particles.length; i++) {
      const distance = Math.hypot(
        particles[i].x - particle.x,
        particles[i].y - particle.y
      );
      if (distance < 100) {
        context.strokeStyle = document.body.classList.contains("light-mode")
          ? `rgba(0, 0, 0, ${1 - distance / 100})`
          : `rgba(255, 255, 255, ${1 - distance / 100})`;
        context.lineWidth = 0.5;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particles[i].x, particles[i].y);
        context.stroke();
      }
    }
  }

  class Particle {
    constructor(x, y, context) {
      this.x = x;
      this.y = y;
      this.context = context;
      this.size = 3;
      this.velocityX = (Math.random() - 0.5) * 15;
      this.velocityY = (Math.random() - 0.5) * 15;
    }

    draw() {
      this.context.fillStyle = document.body.classList.contains("light-mode")
        ? "rgba(0, 0, 0, 0.8)"
        : "rgba(255, 255, 255, 0.8)";
      this.context.fillRect(this.x, this.y, this.size, this.size);
    }

    update(deltaTime, width, height) {
      if (this.x + this.size > width || this.x - this.size < 0) {
        this.velocityX = -this.velocityX;
      }

      if (this.y + this.size > height || this.y - this.size < 0) {
        this.velocityY = -this.velocityY;
      }

      this.velocityX *= friction;
      this.velocityY *= friction;

      this.x += this.velocityX * deltaTime;
      this.y += this.velocityY * deltaTime;
    }

    repulseFromMouse(mousePos, deltaTime) {
      const maxDistance = 100;
      const distance = Math.hypot(this.x - mousePos.x, this.y - mousePos.y);
      if (distance < maxDistance) {
        const angle = Math.atan2(this.y - mousePos.y, this.x - mousePos.x);
        const force = (maxDistance - distance) / maxDistance;
        this.velocityX += force * Math.cos(angle) * 5;
        this.velocityY += force * Math.sin(angle) * 5;
      }
    }
  }

  window.addEventListener("mousemove", function (event) {
    // Use elementFromPoint to determine if the mouse is over a blocking element
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const mainContainer = document.querySelector(".main-container");
    const sidebar = document.querySelector(".left-side");

    if (
      element !== mainContainer &&
      element !== sidebar &&
      !sidebar.contains(element) &&
      !mainContainer.contains(element)
    ) {
      mousePos.x = event.clientX;
      mousePos.y = event.clientY;
    } else {
      mousePos.x = -9999;
      mousePos.y = -9999;
    }
  });

  window.addEventListener("resize", function () {
    cancelAnimationFrame(animationFrameId);
    initCanvas();
    requestAnimationFrame(loop);
  });

  initCanvas();
  requestAnimationFrame(loop);
});
