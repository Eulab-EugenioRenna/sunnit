import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getJobApplicationEmail } from "@/lib/jobs-config";
import { getJobPost } from "@/lib/jobs";

export const runtime = "nodejs";

const maxCvSize = 23 * 1024 * 1024;

type ApplicationPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  jobTitle: string;
  jobSlug: string;
  lang: string;
  cv: { filename: string; contentType: string; buffer: Buffer } | null;
};

function isFileLike(value: unknown): value is { name: string; type: string; arrayBuffer: () => Promise<ArrayBuffer> } {
  return value !== null && typeof value === "object" && "arrayBuffer" in value && "name" in value;
}

function requiredText(formData: FormData | Record<string, unknown>, key: string) {
  return String((formData instanceof FormData ? formData.get(key) : formData[key]) || "").trim();
}

function sanitize(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function normalizeSender(value: string) {
  const sender = sanitize(value);

  if (!sender) return "";
  if (sender.includes("<") && sender.includes(">")) return sender;

  return `SUNNIT <${sender}>`;
}

function getBoundary(contentType: string) {
  const match = contentType.match(/boundary=([^;]+)/i);
  if (!match) return "";

  return match[1].trim().replace(/^"|"$/g, "");
}

function parseMultipartBody(body: Buffer, boundary: string) {
  const result: Record<string, string | { filename: string; contentType: string; buffer: Buffer }> = {};
  const delimiter = `--${boundary}`;
  const raw = body.toString("latin1");
  const segments = raw.split(delimiter);

  for (const segment of segments) {
    let part = segment.trim();

    if (!part || part === "--") continue;
    if (part.startsWith("--")) break;

    if (part.startsWith("\r\n")) {
      part = part.slice(2);
    }

    const separatorIndex = part.indexOf("\r\n\r\n");
    if (separatorIndex === -1) continue;

    const headerBlock = part.slice(0, separatorIndex);
    let content = part.slice(separatorIndex + 4);

    if (content.endsWith("\r\n")) {
      content = content.slice(0, -2);
    }

    const headers = headerBlock.split("\r\n");
    const disposition = headers.find((line) => line.toLowerCase().startsWith("content-disposition:")) || "";
    const contentTypeHeader = headers.find((line) => line.toLowerCase().startsWith("content-type:")) || "";

    const nameMatch = disposition.match(/name="([^"]+)"/i);
    const fileMatch = disposition.match(/filename="([^"]*)"/i);
    if (!nameMatch) continue;

    const fieldName = nameMatch[1];

    if (fileMatch) {
      result[fieldName] = {
        filename: fileMatch[1] || "cv",
        contentType: contentTypeHeader.split(":").slice(1).join(":").trim() || "application/octet-stream",
        buffer: Buffer.from(content, "latin1"),
      };
      continue;
    }

    result[fieldName] = content;
  }

  return result;
}

async function readApplicationPayload(request: Request): Promise<ApplicationPayload> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const formData = await request.clone().formData();
      const cvValue = formData.get("cv");

      return {
        name: requiredText(formData, "name"),
        email: requiredText(formData, "email"),
        phone: requiredText(formData, "phone"),
        message: requiredText(formData, "message"),
        jobTitle: requiredText(formData, "jobTitle"),
        jobSlug: requiredText(formData, "jobSlug"),
        lang: requiredText(formData, "lang"),
        cv: isFileLike(cvValue)
          ? {
              filename: cvValue.name || "cv",
              contentType: cvValue.type || "application/octet-stream",
              buffer: Buffer.from(await cvValue.arrayBuffer()),
            }
          : null,
      };
    } catch (error) {
      const boundary = getBoundary(contentType);

      if (!boundary) {
        throw new Error(`Invalid multipart form data. content-type=${contentType} reason=missing boundary`);
      }

      const buffer = Buffer.from(await request.clone().arrayBuffer());
      const fields = parseMultipartBody(buffer, boundary);

      return {
        name: String(fields.name || "").trim(),
        email: String(fields.email || "").trim(),
        phone: String(fields.phone || "").trim(),
        message: String(fields.message || "").trim(),
        jobTitle: String(fields.jobTitle || "").trim(),
        jobSlug: String(fields.jobSlug || "").trim(),
        lang: String(fields.lang || "").trim(),
        cv: fields.cv && typeof fields.cv === "object" ? fields.cv : null,
      };
    }
  }

  if (contentType.includes("application/json")) {
    const data = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    return {
      name: requiredText(data, "name"),
      email: requiredText(data, "email"),
      phone: requiredText(data, "phone"),
      message: requiredText(data, "message"),
      jobTitle: requiredText(data, "jobTitle"),
      jobSlug: requiredText(data, "jobSlug"),
      lang: requiredText(data, "lang"),
      cv: null,
    };
  }

  throw new Error(`Unsupported content-type for job application: ${contentType || "missing"}`);
}

export async function POST(request: Request) {
  let payload: ApplicationPayload;

  try {
    payload = await readApplicationPayload(request);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to read application payload.",
        details: error instanceof Error ? error.message : "Unknown payload error.",
      },
      { status: 400 },
    );
  }

  const { name, email, phone, message, jobTitle, jobSlug, lang, cv } = payload;

  const missingFields = [!name ? "name" : "", !email ? "email" : "", !jobTitle ? "jobTitle" : "", !jobSlug ? "jobSlug" : "", !cv ? "cv" : ""].filter(Boolean);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: "Missing required application fields.",
        details: missingFields.join(", "),
      },
      { status: 400 },
    );
  }

  if (!cv) {
    return NextResponse.json({ error: "Missing required application fields.", details: "cv" }, { status: 400 });
  }

  if (cv.buffer.length > maxCvSize) {
    return NextResponse.json({ error: "CV file is too large." }, { status: 413 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = normalizeSender(process.env.JOBS_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "");

  // Get the job to extract country for routing
  let country: string | undefined;
  try {
    const job = await getJobPost(lang, jobSlug);
    country = job?.country;
  } catch {
    // Job not found or error reading it; routing will use job slug or default
  }

  // Determine recipient email based on routing config (by job slug or country)
  const recipientEmail = getJobApplicationEmail({ jobSlug, country });

  if (!apiKey || !from) {
    return NextResponse.json(
      { error: "Email delivery is not configured. Set RESEND_API_KEY and JOBS_FROM_EMAIL." },
      { status: 503 },
    );
  }

  const text = [
    `Candidatura per: ${jobTitle}`,
    `Slug: ${jobSlug}`,
    `Lingua: ${lang}`,
    "",
    `Nome: ${name}`,
    `Email: ${email}`,
    phone ? `Telefono: ${phone}` : "",
    "",
    "Messaggio:",
    message || "-",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from,
      to: recipientEmail,
      replyTo: sanitize(email),
      subject: `Candidatura SUNNIT - ${sanitize(jobTitle)} - ${sanitize(name)}`,
      text,
      attachments: [
        {
          filename: cv.filename || "cv",
          content: cv.buffer.toString("base64"),
        },
      ],
    });

    if (response.error) {
      console.error("Resend email send failed", response.error);
      return NextResponse.json(
        {
          error: "Email delivery failed.",
          details: response.error.message || String(response.error),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend email send failed", error);
    return NextResponse.json(
      {
        error: "Email delivery failed.",
        details: error instanceof Error ? error.message : "Unknown Resend error.",
      },
      { status: 502 },
    );
  }
}
