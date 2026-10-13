---
name: Hostinger y conexiones PostgreSQL
description: Diferencias entre el asistente Supabase de Hostinger, las claves API y la conexión PostgreSQL que necesita el servidor.
---

No asumir que conectar Supabase mediante el asistente de hPanel configura la conexión PostgreSQL del servidor.

**Why:** La documentación oficial consultada el 13 de octubre de 2026 indica que ese asistente configura la URL del proyecto y la clave anónima de Supabase, no una URI PostgreSQL privada. Una integración que utiliza el driver PostgreSQL necesita esa URI por separado.

**How to apply:** Configurar la URI solo como variable privada del servidor. Comprobar la compatibilidad IPv4 del alojamiento: el Session pooler de Supabase es una alternativa a la conexión directa IPv6. Consultar de nuevo la documentación de Hostinger y Supabase antes de futuras migraciones porque estas opciones pueden cambiar.
