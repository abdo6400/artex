import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  // Log routing context only. Errors from adapters can contain credentials or personal data.
  console.error(
    JSON.stringify({
      level: "error",
      event: "request.failed",
      timestamp: new Date().toISOString(),
      requestId: request.headers["x-request-id"],
      method: request.method,
      route: context.routePath,
      errorName: error instanceof Error ? error.name : "UnknownError",
    }),
  );
};
