// netlify/functions/getConfig.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing ID" }) };
  }

  try {
    const { data, error } = await supabase
      .from("shared_configs")
      .select("config")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return { statusCode: 404, body: JSON.stringify({ error: "Config not found" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: data.config }) // always return as `data`
    };
  } catch (err) {
    console.error("getConfig error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
