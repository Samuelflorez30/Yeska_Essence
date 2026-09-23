import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Esto solo debería pasar si olvidaste crear el archivo .env
  console.warn(
    '[Supabase] Faltan PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY. ' +
    'Copia .env.example a .env y llena los valores de tu proyecto.'
  );
}

// Un solo cliente compartido por toda la app (servidor y navegador).
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Formato de pesos colombianos: 80000 -> "$80.000"
export const cop = (n) => '$' + Number(n || 0).toLocaleString('es-CO');
// Igual pero sin el signo de peso, para celdas de tabla que ya lo añaden aparte.
export const copPlain = (n) => Number(n || 0).toLocaleString('es-CO');
