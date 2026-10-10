import { createFileRoute } from "@tanstack/react-router";

import { handlePortfolioReview } from "@/lib/portfolio-review.server";

export const Route = createFileRoute("/api/portfolio-review")({
  server: { handlers: { POST: ({ request }) => handlePortfolioReview(request) } },
});
