// netlify/functions/saveConfig.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔑 IMPORTANT
);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { configId } = JSON.parse(event.body);
    if (!configId) throw new Error("Missing configId");

    // ✅ Call RPC instead of insert
    const { data, error } = await supabase.rpc(
      "create_shared_config",
      { p_config_id: configId }
    );

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ shareToken: data })
    };
  } catch (err) {
    console.error("saveConfig error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
