# 🎨 COLOR DROP 2.0

> *"¿Qué tan rápido puedes reconocer los colores?"*

Juego web de reflejos y reconocimiento de colores, desarrollado con HTML, CSS y JavaScript puro (sin frameworks ni dependencias).

🎮 **Jugar en línea:** [https://dylannhidalgo.github.io/color-drop/](https://dylannhidalgo.github.io/color-drop/)

---

## Tabla de contenidos

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Características principales](#características-principales)
3. [Tecnologías utilizadas](#tecnologías-utilizadas)
4. [Requisitos previos](#requisitos-previos)
5. [Guía de instalación paso a paso](#guía-de-instalación-paso-a-paso)
6. [Credenciales de acceso](#credenciales-de-acceso)
7. [Configuración del sistema](#configuración-del-sistema)
8. [Modos de juego y módulos](#modos-de-juego-y-módulos)
9. [Estructura del proyecto](#estructura-del-proyecto)
10. [Almacenamiento de datos](#almacenamiento-de-datos)
11. [Reglas del juego](#reglas-del-juego)
12. [Solución de problemas](#solución-de-problemas)
13. [Autores](#autores)

---

## Descripción del proyecto

**Color Drop 2.0** es un juego de navegador en el que el jugador debe reconocer rápidamente colores. En la parte superior de la pantalla aparece el nombre del color objetivo (por ejemplo, **AZUL**) y, debajo, una fila de botones de colores. El jugador debe pulsar el botón que corresponde al color indicado, mientras figuras de colores caen por la pantalla como distracción visual.

El juego busca entrenar la atención, la velocidad de reacción y el control de impulsos: los objetos que caen son un estímulo que distrae, y la dificultad aumenta de forma progresiva con más colores, mayor velocidad y objetos especiales.

## Características principales

- 🎮 **3 modos de juego:** Clásico, Contrarreloj e Infinito.
- 📈 **Dificultad progresiva:** hasta 11 colores distintos, mayor velocidad de caída y más frecuencia de aparición conforme se sube de nivel.
- 🔥 **Sistema de combos:** los aciertos consecutivos multiplican los puntos.
- ⚡ **5 power-ups:** velocidad, congelar, vida, doble puntos y escudo.
- 💰 **Objetos especiales:** monedas doradas (puntos extra) y objetos negros (que se deben ignorar).
- 🏆 **Mejores puntuaciones:** ranking Top 10 y récord personal guardados en el navegador.
- 🔊 **Efectos de sonido** generados con Web Audio API (activables/desactivables).
- ⌨️ **Atajos de teclado** y pausa con `P` / `ESC`.
- 📱 **Diseño responsivo** con interfaz tipo *glassmorphism*, partículas animadas y efectos visuales (flash, sacudida, textos flotantes).
- 👉 **Tutorial inicial** y pantalla de instrucciones.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura de pantallas (menú, selector de modo, juego, pausa, game over) |
| **CSS3** | Estilos, variables CSS, animaciones y diseño responsivo |
| **JavaScript (ES6+)** | Lógica del juego, bucle principal, estado y eventos |
| **Canvas API** | Dibujo de los objetos que caen y las partículas |
| **Web Audio API** | Efectos de sonido sintetizados (sin archivos de audio) |
| **localStorage** | Persistencia de récord, puntuaciones y preferencia de sonido |

## Requisitos previos

- Un navegador moderno con soporte para Canvas, Web Audio y localStorage:
  - Google Chrome, Microsoft Edge, Mozilla Firefox, Safari u Opera (versiones recientes).
- *(Opcional)* **Python 3** o **Node.js**, solo si se desea servir el proyecto con un servidor local.
- *(Opcional)* **Git**, para clonar el repositorio.

No se requiere instalar dependencias, compilar ni configurar bases de datos.

## Guía de instalación paso a paso

### Opción A: abrir directamente (la más simple)

1. **Descarga o clona** el proyecto:
   ```bash
   git clone https://github.com/DYLANNHIDALGO/color-drop.git
   cd color-drop
   ```
   O descomprime `JUEGO.zip` en cualquier carpeta.
2. **Abre** el archivo `index.html` con doble clic (o arrástralo a tu navegador).
3. ¡Listo! Pulsa **▶ JUGAR**.

### Opción B: con un servidor local

1. Entra a la carpeta del proyecto:
   ```bash
   cd color-drop
   ```
2. Inicia un servidor, con cualquiera de estas opciones:
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js
   npx serve .
   ```
3. Abre en el navegador: [http://localhost:8000](http://localhost:8000)

### Opción C: publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub (los archivos deben quedar en la raíz, no dentro de una carpeta).
2. Ve a **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**.
4. En **Branch** selecciona `main`, deja la carpeta en `/ (root)` y pulsa **Save**.
5. Tras 1 o 2 minutos, el juego estará disponible en `https://dylannhidalgo.github.io/color-drop/`.

## Credenciales de acceso

**No aplica.** El juego no tiene inicio de sesión, usuarios ni contraseñas: se juega directamente desde el menú principal.

## Configuración del sistema

Toda la configuración está en las constantes al inicio de `script.js`, por lo que se puede ajustar sin tocar la lógica.

| Constante | Descripción |
|---|---|
| `COLOR_DEFS` | Definición de los 11 colores (nombre, valor CSS y tecla de atajo) |
| `COLOR_GROUPS` | Colores activos según el nivel (4, 5, 6, 8 y 11 colores) |
| `SHAPES` | Formas de los objetos que caen: círculo, cuadrado, triángulo y rombo |
| `PHRASES` | Frases motivacionales que aparecen al acertar |
| `POWERUP_TYPES` | Icono, etiqueta y color de cada power-up |
| `LEVEL_UP_SCORES` | Puntos necesarios para alcanzar cada nivel |
| `state.timeLimit` | Duración del modo Contrarreloj (60 s por defecto) |
| `state.maxLives` | Número de vidas (3 por defecto) |

**Controles**

| Acción | Teclado | Ratón / Táctil |
|---|---|---|
| Elegir color | `1` Rojo · `2` Azul · `3` Verde · `4` Amarillo · `5` Naranja · `6` Morado | Pulsar el botón de color |
| Pausar / reanudar | `P` o `ESC` | Botón ⏸ |
| Sonido | — | Botón 🔊 / 🔇 |

> Los colores del nivel 6 en adelante (rosa, celeste, turquesa, lima y magenta) no tienen atajo de teclado; se eligen con el ratón o la pantalla táctil.

## Modos de juego y módulos

### Modos de juego

| Modo | Descripción |
|---|---|
| 🎮 **Clásico** | 3 vidas y dificultad progresiva. Se pierde una vida al equivocarse o dejar pasar el color correcto. |
| ⏱ **Contrarreloj** | 60 segundos para lograr la máxima puntuación. No se pierden vidas: los errores restan tiempo. |
| ♾ **Infinito** | Partida continua con velocidad creciente. |

### Pantallas / módulos de la interfaz

| Módulo | Función |
|---|---|
| Menú principal | Acceso a Jugar, Cómo jugar, Mejores puntuaciones y control de sonido |
| Selector de modo | Elección entre los tres modos |
| Tutorial | Explicación rápida mostrada la primera vez que se juega |
| Cómo jugar | Instrucciones completas, power-ups y atajos |
| Mejores puntuaciones | Top 10 con medallas 🥇🥈🥉 |
| Pantalla de juego | HUD (puntos, nivel, récord, vidas), barra de progreso, color objetivo, canvas y botones |
| Menú de pausa | Continuar, reiniciar o salir |
| Game Over | Puntuación final, nivel, mejor combo y aviso de nuevo récord |

## Estructura del proyecto

```
color-drop/
├── index.html   # Estructura HTML: todas las pantallas del juego
├── style.css    # Estilos, animaciones y diseño responsivo
├── script.js    # Lógica: estado, bucle de juego, canvas, audio y eventos
└── README.md    # Documentación del proyecto
```

**Organización de `script.js`:** configuración de colores y niveles → estado del juego → audio → navegación de pantallas → puntuaciones → configuración por nivel → inicio de partida → manejo de aciertos y errores → power-ups → efectos visuales → bucle principal (`gameLoop`, `updateObjects`, `draw`) → game over → eventos.

## Almacenamiento de datos

El juego **no usa base de datos ni servidor**. Todo se guarda localmente en el navegador mediante `localStorage`:

| Clave | Contenido |
|---|---|
| `color_drop_record` | Récord de puntuación más alto |
| `color_drop_scores` | Lista JSON con las 10 mejores partidas (puntos, modo y fecha) |
| `color_drop_sound` | Preferencia de sonido (`on` / `off`) |

Para reiniciar los datos, abre la consola del navegador (`F12`) y ejecuta:

```js
localStorage.removeItem("color_drop_record");
localStorage.removeItem("color_drop_scores");
localStorage.removeItem("color_drop_sound");
```

> Los datos son propios de cada navegador y dispositivo; no se comparten entre equipos.

## Reglas del juego

### Objetivo
Pulsar el botón del color que indica el texto superior. Los objetos que caen son solo decoración.

### Puntuación
- **Acierto:** `10 × combo actual` puntos (1.er acierto = 10, 2.º seguido = 20, 3.º = 30…).
- **Combo:** se rompe al equivocarse o al dejar pasar el objeto del color objetivo.
- **Moneda dorada 💰:** +50 puntos.
- **Doble puntos 💎:** duplica todos los puntos obtenidos durante 6 segundos.

### Vidas y errores
| Situación | Clásico / Infinito | Contrarreloj |
|---|---|---|
| Pulsar un color incorrecto | −1 vida | −3 segundos |
| Dejar caer el objeto del color objetivo | −1 vida | −2 segundos |
| Quedarse sin vidas / sin tiempo | Game Over | Game Over |

### Niveles y dificultad
| Nivel | Colores activos |
|---|---|
| 1 | 4 (rojo, azul, verde, amarillo) |
| 2–3 | 5 (+ naranja) |
| 4–5 | 6 (+ morado) |
| 6–7 | 8 (+ rosa, celeste) |
| 8+ | 11 (+ turquesa, lima, magenta) |

- **Puntos para subir de nivel:** 100 · 250 · 450 · 700 · 1000 · 1400 · 1900 · 2500 · 3200 · 4000 · 4900 · 5900 · 7000 · 8200 (después, +1 nivel cada 1000 puntos).
- **Velocidad de caída:** aumenta con cada nivel (tope de 8).
- **Frecuencia de aparición:** los objetos aparecen cada vez más rápido (mínimo cada 420 ms).
- **Objetos dorados:** aparecen desde el nivel 2.
- **Objetos negros:** aparecen desde el nivel 3; no se deben pulsar ni cuentan como falla si caen.

### Power-ups
| Icono | Nombre | Efecto |
|---|---|---|
| ⚡ | Velocidad | Durante 5 s los objetos caen más rápido (+30 %) |
| ❄️ | Congelar | Durante 5 s los objetos caen casi detenidos |
| ❤️ | Vida | +1 vida (si ya tienes el máximo, da +30 puntos) |
| 💎 | Doble puntos | Puntos ×2 durante 6 s |
| 🛡️ | Escudo | Absorbe el siguiente error sin perder vida |

Los power-ups aparecen con una probabilidad del 3 % en el nivel 1 y del 7 % desde el nivel 2.

## Solución de problemas

| Problema | Posible causa | Solución |
|---|---|---|
| No se escucha ningún sonido | El sonido está desactivado o el navegador bloquea el audio hasta que hay interacción | Pulsa el botón 🔊 y haz clic en el juego; revisa el volumen del dispositivo |
| El juego aparece sin estilos | `style.css` no está en la misma carpeta que `index.html` | Verifica que los tres archivos estén juntos en la raíz del repositorio |
| La pantalla queda en blanco | `script.js` no se cargó o hay un error de JavaScript | Abre la consola (`F12`) y revisa errores; recarga con `Ctrl + F5` |
| Las puntuaciones no se guardan | `localStorage` bloqueado (modo incógnito estricto o cookies desactivadas) | Usa una ventana normal o habilita el almacenamiento del sitio |
| Las puntuaciones desaparecieron | Se borraron los datos del navegador | Es normal: se guardan solo localmente |
| El juego va lento | Muchas pestañas abiertas o equipo con pocos recursos | Cierra otras pestañas o prueba otro navegador |
| Los atajos de teclado no funcionan | El juego no tiene el foco o la tecla no corresponde a un color activo | Haz clic en la página; recuerda que solo hay atajos para los 6 primeros colores |
| Cambios en el código no se ven | Caché del navegador | Recarga forzada con `Ctrl + F5` |

## Autores

| Nombre | Rol | Responsabilidades | GitHub |
|---|---|---|---|
| Hidalgo Soto Dylann | Diseño de interfaz y documentación | Estructura HTML de las pantallas, estilos y animaciones CSS, diseño responsivo, efectos visuales y de sonido, tutorial, pruebas de jugabilidad y redacción del README | [@DYLANNHIDALGO](https://github.com/DYLANNHIDALGO) |
| Tacuche Santiago Piero | Desarrollador principal (lógica del juego) | Estado del juego, bucle principal con Canvas, sistema de combos, niveles y dificultad progresiva, power-ups, modos Clásico / Contrarreloj / Infinito y almacenamiento con `localStorage` | — |

---

<p align="center">Hecho con 💜 y muchos colores · <b>COLOR DROP 2.0</b></p>
