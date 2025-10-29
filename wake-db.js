import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_0PhQWbL9NRvj@ep-green-grass-a42xuqbl.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

console.log("⏳ Waking Neon compute...");

client
  .connect()
  .then(async () => {
    console.log("✅ Connected — Neon compute is now awake!");
    await client.end();
    console.log("💤 Connection closed (you can now run Prisma commands).");
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
  });
