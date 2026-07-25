export async function readBriefApiResponse(response: Response): Promise<unknown> {
  const rawBody = await response.text();
  let payload: unknown;

  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    throw new Error(fallbackMessage(response.status));
  }

  if (!response.ok) {
    const apiMessage = isErrorPayload(payload) ? payload.error.trim() : "";
    throw new Error(apiMessage || fallbackMessage(response.status));
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("The analysis service returned an unexpected response. Please try again.");
  }

  return payload;
}

function isErrorPayload(payload: unknown): payload is { error: string } {
  return typeof payload === "object"
    && payload !== null
    && "error" in payload
    && typeof payload.error === "string";
}

function fallbackMessage(status: number) {
  if (status === 408 || status === 504) {
    return "The analysis took too long to finish. Please try again.";
  }

  if (status === 429) {
    return "You’ve reached the temporary analysis limit. Please wait a few minutes and try again.";
  }

  if (status === 502 || status === 503) {
    return "The analysis service is temporarily unavailable. Please try again in a few minutes.";
  }

  return "We could not generate a brief right now. Please try again.";
}
