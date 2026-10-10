import { NextResponse } from "next/server";
import { processWompiEvent } from "@/lib/wompi-events";
import type { WompiEvent } from "@/lib/wompi";

export async function POST(req: Request) {
  let event: WompiEvent;
  try {
    event = (await req.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const result = await processWompiEvent(
    event,
    process.env.WOMPI_EVENTS_SECRET,
    req.headers.get("x-event-checksum"),
  );
  if (!result.ok) {
    const status = result.reason === "checksum" ? 400 : 500;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ received: true });
}
