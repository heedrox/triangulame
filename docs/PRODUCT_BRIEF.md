# Product Brief: Triangles

## Resumen del Proyecto

**Triangles** es un juego multijugador en tiempo real que combina velocidad, precisión y reconocimiento de patrones. Los jugadores compiten para hacer clic en formas geométricas numeradas en orden secuencial, con el objetivo de completar el tablero en el menor tiempo posible. Cada partida presenta un desafío único gracias a la generación procedural de tableros.

## Audiencia Objetivo

### Primaria
- **Gamers casuales** (18-45 años) que buscan entretenimiento rápido
- **Familias y amigos** que quieren competir en sesiones cortas (2-10 minutos)
- **Jugadores móviles** que prefieren juegos simples pero adictivos

### Secundaria  
- **Streamers y content creators** buscando juegos interactivos con audiencia
- **Educadores** que quieren herramientas gamificadas para mejorar concentración
- **Competidores** interesados en speedrunning y récords personales

## Beneficios y Características Principales

### 🎮 **Mecánicas de Juego**
- **Generación procedural**: Cada partida es única con tableros algorítmicamente creados
- **Sistema de combos**: Recompensa la velocidad con bonificaciones por clicks rápidos (<1.5s)
- **Escalabilidad**: Dificultad creciente con más formas por ronda (fórmula: numGame × 2 + 12)
- **Multijugador sincronizado**: Hasta N jugadores compitiendo simultáneamente

### 🚀 **Experiencia de Usuario**
- **Acceso instantáneo**: Solo nombre + código de sala, sin registros complejos
- **Cross-platform**: PWA que funciona en móvil, tablet y escritorio
- **Tiempo real**: Visualización inmediata del progreso de otros jugadores
- **Internacionalización**: Sistema i18n preparado para múltiples idiomas

### 📊 **Características Sociales**
- **Salas personalizadas**: Códigos únicos para jugar con amigos
- **Compartir fácil**: Integración para invitar jugadores
- **Estadísticas**: Tracking de tiempos y récords por sesión
- **Reconexión**: Sistema robusto para manejar desconexiones

## Tecnología y Arquitectura

### **Frontend**
- **Phaser 3.90.0**: Motor de juegos 2D para renderizado eficiente y detección de colisiones
- **Vite 6**: Build tool moderno con HMR para desarrollo ágil
- **ES Modules**: Arquitectura modular con importaciones nativas

### **Backend & Infraestructura**
- **Firebase Realtime Database**: Sincronización en tiempo real de estado de juego
- **Firebase Hosting**: CDN global para baja latencia
- **Serverless**: Sin servidores que mantener, escalabilidad automática

### **Calidad & Performance**
- **Jest 29**: Suite de testing con 96.4% de cobertura
- **ESLint**: Code quality y consistencia
- **PWA**: Service workers para funcionamiento offline
- **Optimización**: Code splitting automático y asset hashing

### **Arquitectura de Dominio**
```
src/
├── domain/          # Lógica de negocio pura
│   ├── game/        # Estados y reglas del juego  
│   ├── rectangle/   # Geometría y formas
│   └── combo-check/ # Sistema de puntuación
├── phaser-ui/       # Capa de presentación
├── firebase/        # Integración backend
└── i18n/           # Internacionalización
```

### **Ventajas Técnicas**
- **Desarrollo rápido**: Hot reload en 184ms vs 4.6s anteriormente
- **Build optimizado**: 3.35s con chunks separados para mejor caching
- **Mantenibilidad**: Arquitectura hexagonal con separación clara de responsabilidades
- **Escalabilidad**: Firebase maneja automáticamente picos de tráfico
- **Monitoreo**: Métricas de rendimiento y detección de errores integradas

## Métricas de Éxito

### Engagement
- **Tiempo de sesión promedio**: >5 minutos
- **Partidas por sesión**: >3 rondas
- **Retención D1**: >40%

### Performance  
- **Tiempo de carga**: <2 segundos
- **Latencia multijugador**: <100ms
- **Uptime**: >99.9%

### Adopción
- **Crecimiento orgánico**: Sharing rate >20%
- **Cross-platform**: >60% tráfico móvil
- **Accesibilidad**: Funciona en >95% navegadores
