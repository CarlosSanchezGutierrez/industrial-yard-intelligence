# Aplomo Demo Login Landing

Landing inicial para acceso demo por roles.

Ruta:

`/`

Contraseña demo recomendada local:

`AplomoDemo-2026!`

Para resetear usuarios demo:

```powershell
$env:APLOMO_DEMO_PASSWORD = "AplomoDemo-2026!"
.\scripts\create-aplomo-demo-auth-users.ps1
select * from public.aplomo_sync_demo_platform_roles();

select *
from public.aplomo_demo_role_account_status
order by (metadata->>'demoOrder')::int;
