// Set a production-safe default before server.mjs loads any backend modules.
process.env.NODE_ENV ||= "production";
