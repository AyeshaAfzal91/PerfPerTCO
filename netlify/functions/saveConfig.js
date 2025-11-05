// netlify/functions/saveConfig.js
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { config } = JSON.parse(event.body);

    const id = uuidv4().split("-")[0];

    const { error } = await supabase
      .from("configs")
      .insert({ id, config });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ id })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
