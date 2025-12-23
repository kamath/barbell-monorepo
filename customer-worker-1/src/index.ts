// This file is the entry point for the Cloudflare Worker.
// It wraps the customer's main function using the barbell runtime.
import { createWorker } from "@barbell/runtime";
import main from "./main";

export default createWorker(main);
