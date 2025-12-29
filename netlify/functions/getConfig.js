// netlify/functions/getConfig.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const token = event.queryStringParameters?.token;
  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing token" })
    };
  }

  try {
    const { data, error } = await supabase
      .from("shared_configs")
      .select("config")
      .eq("share_token", token)
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ data: data.config })
    };
  } catch (err) {
    console.error("getConfig error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
