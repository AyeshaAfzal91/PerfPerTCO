import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { config } = JSON.parse(event.body);
    const id = uuidv4();

    const { error } = await supabase
      .from("shared_configs") // ✅ match the table name you created
      .insert([{ id, config }]); // ✅ insert as array of objects

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ id })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
