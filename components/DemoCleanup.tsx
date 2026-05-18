'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DemoCleanup() {
  useEffect(() => {
    const handleUnload = async () => {
      // Intentar obtener el usuario actual de la sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email === 'demo@dentalcloud.com') {
        // Usamos sendBeacon o un fetch síncrono si fuera posible, 
        // pero Supabase RPC usa fetch asíncrono.
        // beforeunload no garantiza que la promesa termine, 
        // pero es el mejor esfuerzo en el cliente.
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/reset_demo_data`;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (url && key) {
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${session.access_token}`
            },
            keepalive: true // Crucial para que la petición continúe tras cerrar la pestaña
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return null;
}
