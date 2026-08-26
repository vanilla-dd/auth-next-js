import fs from "node:fs";

const envLocal = ".env.local";
const envExample = ".env.example";

if (!fs.existsSync(envLocal)) {
  fs.copyFileSync(envExample, envLocal);
  console.log(`Created ${envLocal} from ${envExample}`);
} else {
  console.log(`${envLocal} already exists — skipped copy`);
}

console.log("Next: bun run db:push && bun run db:seed && bun dev");
