---
name: Pruebas del Pixel
description: Evitar que las pruebas de conversiones alteren los datos de campañas.
---

Al verificar eventos de conversión del Pixel, interceptar las solicitudes hacia Meta y simular las respuestas del formulario en desarrollo. No enviar conversiones sintéticas desde producción.

**Why:** Las conversiones falsas afectan los reportes y la optimización de campañas; comprobar que el navegador emite una solicitud no requiere entregarla a Meta.

**How to apply:** Distinguir en el resultado entre llamada local, solicitud emitida, respuesta de Meta y recepción confirmada en el Administrador de eventos. No afirmar que un evento aparece en esa cuenta sin comprobarlo.