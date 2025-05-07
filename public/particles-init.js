
document.addEventListener('DOMContentLoaded', function () {
  particlesJS("particles-js", {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: ["#3bffbd", "#88e3ff", "#9c6cff", "#00ffd0"] },
      shape: { type: ["circle", "triangle"] },
      opacity: {
        value: 0.7,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0, sync: false },
      },
      size: {
        value: 5,
        random: true,
        anim: { enable: false, speed: 4, size_min: 0.3, sync: false },
      },
      line_linked: { enable: false },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    background: {
      color: "#0b0c10"
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: { enable: true, mode: ["bubble", "grab"] },
        onclick: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 1 } },
        repulse: { distance: 200, duration: 0.4 },
        bubble: { distance: 75, size: 10, duration: 2, opacity: 3, speed: 2 }
      },
    },
    retina_detect: true,
  });
});