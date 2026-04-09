import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener tasa BCV desde dolarapi.com
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Error fetching BCV rate: ${response.status}`)
    }

    const data = await response.json()
    const tasa = data.promedio

    if (!tasa || isNaN(Number(tasa))) {
      throw new Error('Invalid BCV rate received')
    }

    const fecha = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('tasas_bcv')
      .upsert(
        { fecha, tasa: Number(tasa), fuente: 'api' },
        { onConflict: 'fecha' }
      )

    if (error) throw error

    console.log(`Tasa BCV actualizada: ${tasa} (${fecha})`)

    return new Response(
      JSON.stringify({ success: true, tasa, fecha }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing BCV rate:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
