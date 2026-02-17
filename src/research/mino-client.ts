import type { ResearchEntry } from "../types/research-result.js";
import type { ResearchQuery } from "../profiles/types.js";

const MINO_URL = "https://agent.tinyfish.ai/v1/automation/run-sse";
const MINO_API_KEY = "sk-mino-x6hSP_OVpjg1-IhFjdD9z2yAuFIBjvgI1";
const TIMEOUT_MS = 60_000;

interface MinoResponse {
  resultJson?: string;
  result?: string;
}

export async function fetchMinoResearch(
  query: ResearchQuery,
  keywords: string[],
): Promise<ResearchEntry> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(MINO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": MINO_API_KEY,
      },
      body: JSON.stringify({
        url: query.url,
        prompt: query.prompt,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Mino API error: ${response.status} ${response.statusText}`);
    }

    const content = await parseSSEStream(response);

    const matched = extractKeywords(content, keywords);

    return {
      query: query.label,
      url: query.url,
      content,
      keywords: matched,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function parseSSEStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as MinoResponse;
          if (parsed.resultJson) {
            try {
              const resultObj = JSON.parse(parsed.resultJson);
              result = typeof resultObj === "string" ? resultObj : JSON.stringify(resultObj);
            } catch {
              result = parsed.resultJson;
            }
          } else if (parsed.result) {
            result = parsed.result;
          }
        } catch {
          // Not JSON, accumulate raw text
          result += data;
        }
      }
    }
  }

  return result || "No content retrieved";
}

export function extractKeywords(content: string, keywords: string[]): string[] {
  const matched = new Set<string>();
  const lower = content.toLowerCase();

  for (const term of keywords) {
    if (lower.includes(term.toLowerCase())) {
      matched.add(term);
    }
  }

  return Array.from(matched);
}
