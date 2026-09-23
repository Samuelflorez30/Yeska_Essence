import { supabase } from './supabase.js';
import { irAlLogin } from './admin.js';

// La seguridad real vive en las políticas RLS de Supabase (solo un usuario
// autenticado puede escribir). Esto solo evita que alguien sin sesión vea
// el panel — es una conveniencia de UX, no el candado real.
export async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    irAlLogin();
    return null;
  }
  return session;
}

// Si la sesión se cierra en otra pestaña (o el token deja de poder
// renovarse), esta pestaña se entera y vuelve al login en vez de seguir
// mostrando un panel que ya no puede guardar nada.
export function vigilarSesion() {
  supabase.auth.onAuthStateChange((evento, session) => {
    if (evento === 'SIGNED_OUT' || (evento === 'TOKEN_REFRESHED' && !session)) irAlLogin();
  });
}

export function wireLogout(button) {
  button?.addEventListener('click', async () => {
    button.disabled = true;
    await supabase.auth.signOut();
    location.replace('/admin/login');
  });
}

export function showUserEmail(el, session) {
  if (el && session?.user?.email) el.textContent = session.user.email;
}
