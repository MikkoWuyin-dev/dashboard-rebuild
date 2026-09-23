// Ground-truth capture from the LIVE target site. Do not point this at the rebuild.
// All capture logic lives in tools/shoot.mjs so the reference and the local
// rebuild are shot under byte-identical conditions.
import { join } from "node:path";
import { shootAll } from "./shoot.mjs";

const BASE_URL = "https://shadcncraft-sales-marketing-dashboard.vercel.app";
const OUT_DIR = join(process.cwd(), "reference");

const result = await shootAll({ baseUrl: BASE_URL, outDir: OUT_DIR, resume: !!process.env.RESUME });
if (result.failures.length) process.exitCode = 1;
