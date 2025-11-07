import { createClient } from '@supabase/supabase-js'

// Obtém a URL e a chave de ADMIN do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_ADMIN_KEY

// Verifica se as variáveis estão definidas
if (!supabaseUrl || !supabaseAdminKey) {
  throw new Error('Supabase URL e ADMIN KEY (service_role) devem estar definidas no .env')
}

// Cria e exporta o cliente Supabase USANDO A CHAVE DE ADMIN
// Este cliente agora terá permissões totais e irá ignorar as regras RLS.
export const supabase = createClient(supabaseUrl, supabaseAdminKey)