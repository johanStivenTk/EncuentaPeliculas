# Encuestas en tiempo real

Proyecto minimal para crear encuestas y ver votos en tiempo real con Socket.IO.

Requisitos:
- Node.js 14+

Instalación y ejecución:

```powershell
cd "z:\TrabajosActuales\paginaEncuestas"
npm install
npm start
```

Abrir http://localhost:3000 en varias ventanas/navegadores y crear/votar en encuestas.

Notas:
- Los datos se almacenan en memoria. Para producción debes añadir persistencia.
- Para desplegar en un servicio (Render, Heroku, etc.) asegúrate de configurar la variable PORT y habilitar WebSockets.
