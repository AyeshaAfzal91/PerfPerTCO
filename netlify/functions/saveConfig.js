// netlify/functions/saveConfig.js
import { createClient } from "@supabase/supabase-js";

// 🔹 DEBUG: Check env vars at runtime
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log(
  "Supabase Service Role Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "FOUND" : "MISSING"
);

// 🔹 Create Supabase client with Service Role key (server-side only!)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // 🔹 Parse config data from request
    const { config } = JSON.parse(event.body);
    if (!config) throw new Error("No config provided");

    // 🔹 Call RPC function 'create_shared_config' with your JSON config
    const { data, error } = await supabase.rpc("create_shared_config", {
      p_config: config,
    });

    if (error) throw error;
    if (!data) throw new Error("No share token returned from RPC");

    // 🔹 Return the share token
    return {
      statusCode: 200,
      body: JSON.stringify({ id: data }), // id is your share token
    };
  } catch (err) {
    console.error("saveConfig error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
