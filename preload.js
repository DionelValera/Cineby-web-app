const { contextBridge, ipcRenderer } = require('electron');

// 1. Expone la API de control de ventana
contextBridge.exposeInMainWorld('windowControls', {
    close: () => ipcRenderer.send('window-close'),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
});

// 2. Definición del HTML y CSS de la barra de título (Estilo Simple y Oscuro)
const titleBarHTML = `
    <div id="custom-title-bar">
        <div class="window-controls">
            <button class="control-button" id="minimize-button" title="Minimizar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"></svg>
            </button>
            
            <button class="control-button" id="maximize-button" title="Maximizar / Restaurar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"></svg>
            </button>
            
            <button class="control-button close-btn" id="close-button" title="Cerrar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"></svg>
            </button>
        </div>
    </div>
`;

const titleBarCSS = `
    /* CSS para la barra inyectada */
    #custom-title-bar {
        -webkit-app-region: drag; 
        height: 35px !important;
        background-color: #1f1f1f !important; /* Fondo oscuro */
        display: flex !important;
        justify-content: flex-end !important; /* A la derecha */
        align-items: center !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 999999 !important; /* Asegura que esté por encima de la web */
        box-sizing: border-box !important;
        padding-right: 0 !important;
    }
    
    .window-controls {
        -webkit-app-region: no-drag !important; /* Excluye botones del área de arrastre */
        display: flex !important;
        margin-right: 0 !important; 
    }

    /* Estilo base de los botones */
    .control-button {
        height: 35px !important;
        width: 45px !important;
        background: none !important;
        border: none !important;
        color: #ccc !important;
        cursor: pointer !important;
        padding: 0 !important;
        transition: background-color 0.2s !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        outline: none !important;
        opacity: 1 !important; 
        visibility: visible !important; 
        pointer-events: auto !important; /* Asegura que el clic funcione */
    }

    /* Iconos */
    .control-button svg {
        color: #ccc !important; 
        opacity: 1 !important; 
        width: 14px !important;
        height: 14px !important;
        transition: none !important;
    }
    
    /* Efectos de Hover */
    .control-button:hover {
        background-color: #383838 !important;
        color: white !important;
    }

    .close-btn:hover {
        background-color: #e81123 !important; /* Rojo al cerrar */
        color: white !important;
    }

    /* Mueve el contenido del body hacia abajo */
    body {
        padding-top: 35px !important;
    }
`;


// 3. Función para inyectar el HTML, CSS y adjuntar eventos
window.addEventListener('DOMContentLoaded', () => {
    // Inyecta el CSS
    const style = document.createElement('style');
    style.textContent = titleBarCSS;
    document.head.appendChild(style);

    // Inyecta el HTML
    const container = document.createElement('div');
    container.innerHTML = titleBarHTML;
    document.body.appendChild(container.firstChild);

    // 4. Adjunta los listeners a los botones inyectados
    const controls = windowControls; 

    // Usamos e.stopPropagation() para detener el evento de arrastre de la barra
    document.getElementById('minimize-button').addEventListener('click', (e) => {
        e.stopPropagation(); 
        controls.minimize();
    });

    document.getElementById('maximize-button').addEventListener('click', (e) => {
        e.stopPropagation();
        controls.maximize();
    });

    document.getElementById('close-button').addEventListener('click', (e) => {
        e.stopPropagation();
        controls.close();
    });

    // Aseguramos la inicialización de Lucide (vital para que los SVG se rendericen)
    const script = document.createElement('script');
    script.src = "https://unpkg.com/lucide@latest/dist/umd/lucide.js";
    document.head.appendChild(script);

    // Llama a createIcons después de que la librería se cargue
    script.onload = () => {
        setTimeout(() => {
            if (window.lucide && window.lucide.createIcons) {
                window.lucide.createIcons();
            }
        }, 100); 
    };
});