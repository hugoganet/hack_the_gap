import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { route } from "@/lib/zod-route";
import { z } from "zod";

// Stripe payments removed for hackathon - returns empty payments list
export const GET = route
  .params(
    z.object({
      orgId: z.string(),
    }),
  )
  .handler(async (req, { params }) => {
    await getRequiredAdmin();

    // No payment history in hackathon version
    return { payments: [] };
  });
