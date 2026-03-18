import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase
    .from('naam_jap_counter')
    .select('count')
    .eq('id', 1)
    .single()
  return NextResponse.json({ count: data?.count ?? 247381 })
}

export async function POST() {
  const { data } = await supabase.rpc('increment_naam_jap')
  return NextResponse.json({ count: data ?? 247382 })
}
