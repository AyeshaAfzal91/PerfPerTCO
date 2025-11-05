import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // make sure to use the correct anon key
);

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, body: "Missing ID" };
  }

  try {
    const { data, error } = await supabase
      .from("shared_configs") // updated table name
      .select("config")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return { statusCode: 404, body: JSON.stringify({ error: "Config not found" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: data.config }) // wrap in `data` for frontend
    };
  } catch (err) {
    console.error("getConfig error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
