import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPURL //'https://bhziqtdetzehtjngvjpy.supabase.co'
const supabaseKey = process.env.SUPSECRET

export function getDB(){
    return createClient(supabaseUrl, supabaseKey)
}