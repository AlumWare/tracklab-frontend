<script>
import { onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'AuthLayout',
  setup() {
    const initParticles = () => {
      // Aseguramos que particles.js esté cargado
      if (!window.particlesJS) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
        script.onload = () => {
          window.particlesJS('particles-js', {
            particles: {
              number: {
                value: 80,
                density: {
                  enable: true,
                  value_area: 800
                }
              },
              color: {
                value: '#ffffff'
              },
              shape: {
                type: 'circle'
              },
              opacity: {
                value: 0.5,
                random: false
              },
              size: {
                value: 3,
                random: true
              },
              line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.4,
                width: 1
              },
              move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
              }
            },
            interactivity: {
              detect_on: 'canvas',
              events: {
                onhover: {
                  enable: true,
                  mode: 'grab'
                },
                onclick: {
                  enable: true,
                  mode: 'push'
                },
                resize: true
              }
            },
            retina_detect: true
          })
        }
        document.head.appendChild(script)
      } else {
        window.particlesJS('particles-js', {
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: '#ffffff'
            },
            shape: {
              type: 'circle'
            },
            opacity: {
              value: 0.5,
              random: false
            },
            size: {
              value: 3,
              random: true
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#ffffff',
              opacity: 0.4,
              width: 1
            },
            move: {
              enable: true,
              speed: 2,
              direction: 'none',
              random: false,
              straight: false,
              out_mode: 'out',
              bounce: false
            }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: {
                enable: true,
                mode: 'grab'
              },
              onclick: {
                enable: true,
                mode: 'push'
              },
              resize: true
            }
          },
          retina_detect: true
        })
      }
    }

    onMounted(() => {
      initParticles()
    })

    onBeforeUnmount(() => {
      if (window.pJSDom && window.pJSDom.length) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS()
        window.pJSDom = []
      }
    })
  }
}
</script>

<template>
  <div class="auth-layout">
    <div id="particles-js" class="auth-layout__particles"></div>
    <div class="auth-layout__content">
      <div class="auth-layout__card">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  overflow: hidden;
}

.auth-layout__particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.auth-layout__content {
  position: relative;
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.auth-layout__card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease;
}

.auth-layout__card:hover {
  transform: translateY(-5px);
}

@media (max-width: 480px) {
  .auth-layout__content {
    padding: 1rem;
  }
  
  .auth-layout__card {
    padding: 1.5rem;
  }
}
</style> 