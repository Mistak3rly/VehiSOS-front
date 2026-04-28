# VehisosFront

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Integracion IA y Talleres

- El dashboard de taller ahora consume desempeño, historial y especialidades desde el backend.
- El dashboard administrativo muestra analiticas agregadas de talleres.
- El login persiste `token`, `user`, `userRole` y `taller_id` cuando el backend lo devuelve.
- Los componentes IA quedaron movidos a los dashboards existentes y se eliminaron duplicados viejos.
- Si el frontend no encuentra `taller_id`, vuelve a login para reconstruir la sesión correcta.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

## Verificacion rapida

1. Levanta el backend en `http://localhost:8000`.
2. Ejecuta `ng serve` o `npm run start`.
3. Inicia sesion con el usuario `TallerOperario@gmail.com`.
4. Verifica que el dashboard de taller cargue las secciones de desempeño, especialidades e historial.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
