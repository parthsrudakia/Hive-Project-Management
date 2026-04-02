const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Hiveboard <notifications@hiveny.com>";

function wrap(badge: string, badgeColor: string, title: string, body: string) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:48px 20px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">

        <!-- Header -->
        <tr><td style="padding:28px 36px 0 36px">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;height:32px;background:#1a1916;border-radius:8px;text-align:center;vertical-align:middle;font-size:16px;color:#fff">&#x2B22;</td>
            <td style="padding-left:10px;font-size:15px;font-weight:600;color:#1a1916;letter-spacing:-.02em">Hiveboard</td>
          </tr></table>
        </td></tr>

        <!-- Badge + Title -->
        <tr><td style="padding:28px 36px 0 36px">
          <div style="display:inline-block;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:${badgeColor};margin-bottom:14px">${badge}</div>
          <div style="font-size:22px;font-weight:700;color:#1a1916;line-height:1.35;margin-top:12px;letter-spacing:-.02em">${escapeHtml(title)}</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:20px 36px 32px 36px">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid #eae8e4">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:12px;color:#9c978e">Hiveboard</td>
            <td align="right" style="font-size:11px;color:#c4c0b8">Automated notification</td>
          </tr></table>
        </td></tr>

      </table>

      <div style="text-align:center;padding-top:24px;font-size:11px;color:#b0ab9f">
        You received this because your admin updated a project assigned to you.
      </div>
    </td></tr>
  </table>
</body></html>`;
}

function taskCreatedHtml(task: { title: string; description?: string; deadline?: string; assigned_to: string }) {
  let body = "";

  if (task.description) {
    body += `<div style="font-size:14px;color:#4a4740;line-height:1.7;margin-bottom:20px">${escapeHtml(task.description)}</div>`;
  }

  body += `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;margin-bottom:8px">
      <tr>
        <td style="padding:14px 18px;background:#fafaf8;border:1px solid #eae8e4;border-right:none;border-radius:10px 0 0 10px;width:50%">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9c978e;margin-bottom:6px">Status</div>
          <div style="font-size:14px;color:#1a1916;font-weight:600">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#e8453c;margin-right:6px;vertical-align:middle"></span>Not Started
          </div>
        </td>
        <td style="padding:14px 18px;background:#fafaf8;border:1px solid #eae8e4;border-left:none;border-radius:0 10px 10px 0;width:50%">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9c978e;margin-bottom:6px">Deadline</div>
          <div style="font-size:14px;color:#1a1916;font-weight:600">${task.deadline ? formatDateEmail(task.deadline) : "None set"}</div>
        </td>
      </tr>
    </table>`;

  return wrap("New Project", "#e8453c", task.title, body);
}

function taskUpdatedHtml(task: { title: string }, changes: { field: string; from?: string; to?: string }[]) {
  let rows = "";
  changes.forEach((c, i) => {
    const isLast = i === changes.length - 1;
    const border = isLast ? "" : "border-bottom:1px solid #eae8e4;";
    rows += `
      <tr>
        <td style="padding:12px 16px;${border}vertical-align:top;width:110px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9c978e">${escapeHtml(c.field)}</div>
        </td>
        <td style="padding:12px 16px;${border}font-size:14px;color:#1a1916">
          ${c.from ? `<span style="color:#b0ab9f;text-decoration:line-through">${escapeHtml(c.from)}</span><span style="color:#b0ab9f;padding:0 6px">&rarr;</span>` : ""}<span style="font-weight:600;color:#1a1916">${escapeHtml(c.to || "\u2014")}</span>
        </td>
      </tr>`;
  });

  const body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border:1px solid #eae8e4;border-radius:10px;overflow:hidden">
      ${rows}
    </table>`;

  return wrap(changes.length === 1 ? "Updated" : `${changes.length} Changes`, "#d97706", task.title, body);
}

function commentAddedHtml(task: { title: string }, comment: { author: string; text: string }) {
  const body = `
    <div style="background:#fafaf8;border:1px solid #eae8e4;border-radius:10px;padding:18px 20px">
      <div style="font-size:12px;font-weight:700;color:#9c978e;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">${escapeHtml(comment.author)}</div>
      <div style="font-size:15px;color:#1a1916;line-height:1.7">${escapeHtml(comment.text)}</div>
    </div>`;

  return wrap("New Comment", "#2563eb", task.title, body);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDateEmail(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, type, task, changes, comment } = await req.json();

    // Look up user email
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(user_id)}&select=email,name`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const users = await res.json();
    const user = users?.[0];
    if (!user?.email) {
      return new Response(JSON.stringify({ ok: false, reason: "no_email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject: string;
    let html: string;

    switch (type) {
      case "task_created":
        subject = `New Project: ${task.title}`;
        html = taskCreatedHtml(task);
        break;
      case "task_updated":
        subject = `Project Updated: ${task.title}`;
        html = taskUpdatedHtml(task, changes);
        break;
      case "comment_added":
        subject = `New Comment on: ${task.title}`;
        html = commentAddedHtml(task, comment);
        break;
      default:
        return new Response(JSON.stringify({ ok: false, reason: "unknown_type" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Send via Resend
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [user.email],
        subject,
        html,
      }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ ok: false, reason: "send_failed", detail: err }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Email notification error:", e);
    return new Response(JSON.stringify({ ok: false, reason: "error", detail: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
