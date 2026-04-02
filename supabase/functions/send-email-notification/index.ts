const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Hiveboard <notifications@hiveny.com>";

function taskCreatedHtml(task: { title: string; description?: string; deadline?: string; assigned_to: string }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1916">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <tr><td style="background:#1A1916;padding:24px 32px">
          <span style="font-size:20px;font-weight:600;color:#fff;letter-spacing:.02em">&#x2B22; Hiveboard</span>
        </td></tr>
        <tr><td style="padding:32px">
          <div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:#A8A49C;text-transform:uppercase;margin-bottom:8px">New Project Assigned</div>
          <div style="font-size:26px;font-weight:600;color:#1A1916;line-height:1.3;margin-bottom:20px;font-family:Georgia,'Times New Roman',serif">${escapeHtml(task.title)}</div>
          ${task.description ? `<div style="font-size:14px;color:#6B6860;line-height:1.7;margin-bottom:20px;padding:16px;background:#F5F4F0;border-radius:8px">${escapeHtml(task.description)}</div>` : ""}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="padding:12px 16px;background:#F5F4F0;border-radius:8px 8px 0 0;border-bottom:1px solid #E8E6E0">
                <span style="font-size:11px;font-weight:600;color:#A8A49C;text-transform:uppercase;letter-spacing:.08em">Status</span>
                <div style="margin-top:4px;font-size:14px;font-weight:500">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#C0392B;margin-right:6px;vertical-align:middle"></span>Not Started
                </div>
              </td>
              <td style="padding:12px 16px;background:#F5F4F0;border-radius:8px 8px 0 0;border-bottom:1px solid #E8E6E0">
                <span style="font-size:11px;font-weight:600;color:#A8A49C;text-transform:uppercase;letter-spacing:.08em">Deadline</span>
                <div style="margin-top:4px;font-size:14px;font-weight:500">${task.deadline ? formatDateEmail(task.deadline) : "No deadline"}</div>
              </td>
            </tr>
          </table>
          <div style="text-align:center;padding-top:8px">
            <span style="font-size:13px;color:#6B6860">Log in to Hiveboard to view details and get started.</span>
          </div>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#F5F4F0;border-top:1px solid #E8E6E0">
          <span style="font-size:11px;color:#A8A49C">Sent from Hiveboard &mdash; Your team project tracker</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function taskUpdatedHtml(task: { title: string }, changes: { field: string; from?: string; to?: string }[]) {
  const changeRows = changes.map(c => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #E8E6E0;font-size:13px;font-weight:600;color:#6B6860;text-transform:capitalize;width:120px">${escapeHtml(c.field)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #E8E6E0;font-size:13px">
        ${c.from ? `<span style="color:#C0392B;text-decoration:line-through">${escapeHtml(c.from)}</span> &rarr; ` : ""}<span style="color:#27664A;font-weight:500">${escapeHtml(c.to || "—")}</span>
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1916">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <tr><td style="background:#1A1916;padding:24px 32px">
          <span style="font-size:20px;font-weight:600;color:#fff;letter-spacing:.02em">&#x2B22; Hiveboard</span>
        </td></tr>
        <tr><td style="padding:32px">
          <div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:#A8A49C;text-transform:uppercase;margin-bottom:8px">Project Updated</div>
          <div style="font-size:26px;font-weight:600;color:#1A1916;line-height:1.3;margin-bottom:24px;font-family:Georgia,'Times New Roman',serif">${escapeHtml(task.title)}</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;border-radius:8px;border:1px solid #E8E6E0;margin-bottom:24px">
            <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E6E0;font-size:11px;font-weight:700;color:#A8A49C;text-transform:uppercase;letter-spacing:.08em" colspan="2">What Changed</td></tr>
            ${changeRows}
          </table>
          <div style="text-align:center;padding-top:8px">
            <span style="font-size:13px;color:#6B6860">Log in to Hiveboard to view the full project.</span>
          </div>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#F5F4F0;border-top:1px solid #E8E6E0">
          <span style="font-size:11px;color:#A8A49C">Sent from Hiveboard &mdash; Your team project tracker</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function commentAddedHtml(task: { title: string }, comment: { author: string; text: string }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1916">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <tr><td style="background:#1A1916;padding:24px 32px">
          <span style="font-size:20px;font-weight:600;color:#fff;letter-spacing:.02em">&#x2B22; Hiveboard</span>
        </td></tr>
        <tr><td style="padding:32px">
          <div style="font-size:11px;font-weight:600;letter-spacing:.1em;color:#A8A49C;text-transform:uppercase;margin-bottom:8px">New Comment</div>
          <div style="font-size:26px;font-weight:600;color:#1A1916;line-height:1.3;margin-bottom:24px;font-family:Georgia,'Times New Roman',serif">${escapeHtml(task.title)}</div>
          <div style="background:#F5F4F0;border:1px solid #E8E6E0;border-radius:8px;padding:16px;margin-bottom:24px">
            <div style="font-size:12px;font-weight:600;color:#6B6860;margin-bottom:8px">${escapeHtml(comment.author)} wrote:</div>
            <div style="font-size:14px;color:#1A1916;line-height:1.7">${escapeHtml(comment.text)}</div>
          </div>
          <div style="text-align:center;padding-top:8px">
            <span style="font-size:13px;color:#6B6860">Log in to Hiveboard to reply.</span>
          </div>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#F5F4F0;border-top:1px solid #E8E6E0">
          <span style="font-size:11px;color:#A8A49C">Sent from Hiveboard &mdash; Your team project tracker</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDateEmail(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

Deno.serve(async (req) => {
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
        headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Email notification error:", e);
    return new Response(JSON.stringify({ ok: false, reason: "error", detail: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
