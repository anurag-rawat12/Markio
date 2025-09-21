import { config } from 'dotenv';
import { resolve } from 'path';


config({ path: resolve(process.cwd(), '.env') });

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;


export { DB_URL, PORT, JWT_SECRET, RESEND_API_KEY, EMAIL_USER, EMAIL_PASS };