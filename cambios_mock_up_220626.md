# Registro de Cambios: Reestructuración a Clean Architecture

**Fecha:** 22 de Junio, 2026  
**Responsable:** Arquitecto de Software (Antigravity AI)  
**Objetivo:** Reorganizar y desacoplar la base de código de la versión Beta del frontend (React + Vite) para sentar las bases del mockup arquitectónico, respetando las 4 capas de Clean Architecture y facilitando la futura reutilización multiplataforma.

---

## 1. Resumen de Modificaciones Estructurales

Se dividió el directorio `src/` en subcarpetas orientadas a capas y responsabilidades de negocio, eliminando el acoplamiento directo de llamadas HTTP y lógica de negocio dentro de los componentes visuales de React.

### Árbol de Nuevos Archivos y Carpetas

```text
src/
├── domain/                               # Capa 1: Reglas de Negocio del Dominio
│   ├── entities/                         # Modelos y lógica de negocio pura
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── User.js
│   └── ports/                            # Contratos / Interfaces de comunicación
│       ├── IProductRepository.js
│       ├── ICartRepository.js
│       ├── IAuthService.js
│       └── IOrderRepository.js
│
├── use-cases/                            # Capa 2: Casos de Uso de la Aplicación
│   ├── GetProductCatalog.js
│   ├── LoginUser.js
│   └── PlaceOrder.js
│
├── adapters/                             # Capa 3: Adaptadores de Interfaz
│   ├── repositories/                     # Clientes de red y persistencia concreta
│   │   ├── ApiProductRepository.js
│   │   ├── ApiAuthService.js
│   │   └── MemoryOrderRepository.js
│   └── hooks/                            # Puentes reactivos entre la UI y los Casos de Uso
│       ├── useAuth.js
│       ├── useCart.js
│       └── useCatalog.js
│
├── config/                               # Capa de Configuración
│   └── di.js                             # Contenedor e Inyección de Dependencias
```

---

## 2. Detalle de Archivos Creados y Modificados

### A. Nuevas Entidades de Dominio (Capa 1)
*   **`src/domain/entities/Product.js`**: Define el modelo inmutable para los productos del marketplace.
*   **`src/domain/entities/Cart.js`**: Agrupa las clases `Cart` y `CartItem`. Implementa de forma pura la lógica del carro: agregar productos, validar stock disponible, calcular subtotales y totales.
*   **`src/domain/entities/Order.js`**: Representa la estructura de una orden de compra en el dominio.
*   **`src/domain/entities/User.js`**: Representa al usuario logueado en la aplicación.

### B. Nuevos Puertos / Interfaces (Capa 1 - Contratos)
*   **`src/domain/ports/IProductRepository.js`**, **`ICartRepository.js`**, **`IAuthService.js`**, **`IOrderRepository.js`**: Definen clases abstractas que especifican los métodos obligatorios de infraestructura, aislando los Casos de Uso de implementaciones concretas (como Fetch, Axios, bases de datos o LocalStorage).

### C. Nuevos Casos de Uso (Capa 2)
*   **`src/use-cases/GetProductCatalog.js`**: Orquesta la carga de catálogo utilizando el puerto del repositorio de productos.
*   **`src/use-cases/LoginUser.js`**: Ejecuta la autenticación de usuarios contra el puerto del servicio de autenticación.
*   **`src/use-cases/PlaceOrder.js`**: Gestiona la creación de un pedido a partir de un carro y limpia el estado local una vez guardado.

### D. Nuevos Adaptadores de Infraestructura (Capa 3)
*   **`src/adapters/repositories/ApiProductRepository.js`**: Implementa el puerto inyectando la función `fetchProducts` de la API real.
*   **`src/adapters/repositories/ApiAuthService.js`**: Implementa el mock del servicio de login que responde con un JWT estructurado.
*   **`src/adapters/repositories/MemoryOrderRepository.js`**: Gestiona el historial de pedidos en memoria a nivel de adaptador.

### E. Nuevos Custom Hooks (Capa 3 - Presenters/Controllers)
*   **`src/adapters/hooks/useAuth.js`**: Controla el estado reactivo del usuario logueado en React y expone métodos de login/logout que invocan al caso de uso.
*   **`src/adapters/hooks/useCart.js`**: Controla el estado del carrito reactivo sincronizando las mutaciones de la clase `Cart` del dominio con los renders de React.
*   **`src/adapters/hooks/useCatalog.js`**: Encapsula el ciclo de vida del componente catálogo, controlando latencias, errores y cancelaciones asíncronas de la API del BFF.

### F. Inyección de Dependencias
*   **`src/config/di.js`**: Encargado de instanciar los repositorios concretos y pasarlos como dependencias en el constructor de cada caso de uso, evitando el acoplamiento directo entre capas.

### G. Archivos de Componentes UI React Modificados (Capa 4)
*   **`src/App.jsx`**: Se redujo en complejidad. Se eliminaron estados y lógicas de mutación de carrito locales. Ahora delega el control de estado a los adaptadores `useAuth` y `useCart`.
*   **`src/components/Catalog.jsx`**: Se removió el fetch directo y el efecto de carga. Ahora consume los datos directamente desde el hook `useCatalog`.
*   **`src/components/Login.jsx`**: Se quitó la lógica de validación interna y el hardcode de credenciales. Ahora envía los datos a través de la callback prop `onLogin` conectada al caso de uso de autenticación.

---

## 3. Estado del Compilador y Bundler

Se realizó un análisis estático de dependencias y empaquetado de producción ejecutando:
```bash
npm run build
```

**Resultado:** Exitoso.
*   Transformó 55 módulos en React.
*   Generó el empaquetado final (`dist/`) sin errores de rutas relativas o imports de módulos ES.
*   Tiempo de build en producción: **420ms**.

---

## 4. Estado de Cobertura de Clean Architecture

| Requisito de la Arquitectura | Implementado | Ubicación en el Código |
| :--- | :---: | :--- |
| Independencia de Frameworks (Lógica Pura) | Sí | `/src/domain/` y `/src/use-cases/` en JS estándar |
| Aislamiento de HTTP / Fetch | Sí | API fetch relegada a `ApiProductRepository.js` |
| Inyección de Dependencias | Sí | Resuelta dinámicamente en `di.js` |
| UI Desacoplada y Presentacional | Sí | Componentes React limpian lógica llamando a hooks controladores |
