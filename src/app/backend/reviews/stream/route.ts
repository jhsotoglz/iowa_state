import { getDb } from "@/database/mongodb";
import type { ChangeStreamInsertDocument } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ReviewDb = {
  _id: any;
  email: string;
  companyName: string;
  comment: string;
  rating: number;
  major?: string;
  createdAt: Date;
};

export async function GET() {
  const dbo = await getDb();
  const coll = dbo.collection<ReviewDb>("Reviews");

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let open = true;

      const safeEnqueue = (s: string) => {
        if (!open) return;
        try {
          controller.enqueue(enc.encode(s));
        } catch {
          open = false;
          cleanup();
        }
      };

      const send = (data: unknown, event?: string) => {
        const head = event ? `event: ${event}\n` : "";
        safeEnqueue(`${head}data: ${JSON.stringify(data)}\n\n`);
      };

      const changeStream = coll.watch(
        [{ $match: { operationType: "insert" } }],
        { fullDocument: "default" }
      );

      const heartbeat = setInterval(() => {
        safeEnqueue(`event: ping\ndata: "💓"\n\n`);
      }, 25_000);

      const cleanup = () => {
        if (!open) return;
        open = false;
        clearInterval(heartbeat);
        try { changeStream.close(); } catch {}
        try { controller.close(); } catch {}
      };

      changeStream.on("change", (chg: ChangeStreamInsertDocument<ReviewDb>) => {
        const d = chg.fullDocument;
        send({
          _id: d._id.toString(),
          companyName: d.companyName,
          comment: d.comment,
          rating: d.rating,
          major: d.major,
          createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
        });
      });

      changeStream.on("error", (err) => {
        send({ message: String(err) }, "error");
        cleanup();
      });

      changeStream.on("close", () => cleanup());

      // @ts-ignore
      controller._onCancel = () => cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
