import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zcoixlvbkssvuxamzwvs.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''; // Needs to be provided by user or use the secret

if (!SUPABASE_KEY) {
    console.log("No VITE_SUPABASE_ANON_KEY found in env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('id, status, shipping_address, tracking_code, notes')
        .order('created_at', { ascending: false })
        .limit(2);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

checkOrders();
