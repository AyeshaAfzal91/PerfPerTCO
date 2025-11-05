// netlify/functions/getConfig.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function handler(event) {
  const id = event.queryStringParameters.id;
  if (!id) {
    return { statusCode: 400, body: "Missing ID" };
  }

  try {
    const { data, error } = await supabase
      .from("configs")
      .select("config")
      .eq("id", id)
      .single();

    if (error || !data) throw error || new Error("Config not found");

    return {
      statusCode: 200,
      body: JSON.stringify(data.config)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
