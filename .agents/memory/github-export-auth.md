---
name: Autorización de GitHub para exportaciones
description: Diferencia entre el estado declarado de una conexión GitHub y la autenticación efectiva disponible para exportar.
---

No asumir que una conexión de proveedor Git marcada activa o saludable permite utilizar GitHub CLI.

**Why:** La plataforma informó una conexión ya vinculada y saludable, pero GitHub CLI pidió autenticación. Los formularios de renovación y conexión rechazaron el identificador de conexión existente, aunque la búsqueda seguía mostrando esa autorización.

**How to apply:** Confirmar una operación autenticada antes de crear repositorios o anunciar exportaciones. Si la CLI no dispone de autenticación y los formularios rechazan la conexión, informar del bloqueo y usar el panel Git como alternativa; no buscar ni copiar tokens manualmente.
