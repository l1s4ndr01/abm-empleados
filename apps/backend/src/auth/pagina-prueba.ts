// Página mínima para probar el login con Google sin el frontend.
// Se sirve en GET /auth/prueba solo fuera de producción.
export const paginaPrueba = (clientId: string) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>SIMEP - Prueba de login</title>
  <script src="https://accounts.google.com/gsi/client" async></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; }
    pre { background: #f4f4f4; padding: 12px; white-space: pre-wrap; word-break: break-all; }
  </style>
</head>
<body>
  <h1>Prueba de login con Google</h1>
  <p>Iniciá sesión y copiá el <b>accessToken</b> a la variable <code>@token</code> de los archivos .http.</p>
  <div id="g_id_onload" data-client_id="${clientId}" data-callback="alLoguear"></div>
  <div class="g_id_signin" data-type="standard"></div>
  <h2>Respuesta del backend</h2>
  <pre id="salida">(todavía nada)</pre>
  <script>
    async function alLoguear({ credential }) {
      const res = await fetch('/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      document.getElementById('salida').textContent =
        res.status + '\\n' + JSON.stringify(await res.json(), null, 2);
    }
  </script>
</body>
</html>`;
