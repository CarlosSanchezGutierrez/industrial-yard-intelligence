# Aplomo Demo Login Landing

Landing inicial estable para acceso demo por roles.

Rutas cubiertas por el gate de entrada: /, /login, /demo, /welcome, /intro, /start, /onboarding, /presentation, /presentacion, /inicio.

Rutas de app real: /aplomo-admin, /admin, /app.

Contrasena demo recomendada local: AplomoDemo-2026!

Para resetear usuarios demo:

$env:APLOMO_DEMO_PASSWORD = "AplomoDemo-2026!"
.\scripts\create-aplomo-demo-auth-users.ps1