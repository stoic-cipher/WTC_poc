// /api/contact  (POST only)
export async function onRequestPost({ request, env }) {
  try {
    // --- Basic rate limit via cookie (60s) ---
    const cookie = request.headers.get("Cookie") || "";
    if (cookie.includes("wtc_contact_sent=1")) {
      return new Response(JSON.stringify({ ok: false, error: "Too many requests" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }

    // --- Parse body (form or json) ---
    let name = "",
      email = "",
      message = "",
      hp = "";
    const ctype = request.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      const b = await request.json();
      name = (b.name || "").toString();
      email = (b.email || "").toString();
      message = (b.message || "").toString();
      hp = (b.company || "").toString(); // honeypot
    } else {
      const fd = await request.formData();
      name = (fd.get("name") || "").toString();
      email = (fd.get("email") || "").toString();
      message = (fd.get("message") || "").toString();
      hp = (fd.get("company") || "").toString(); // honeypot
    }

    // --- Honeypot: drop silently if filled ---
    if (hp && hp.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "wtc_contact_sent=1; Max-Age=60; Path=/; SameSite=Lax",
        },
      });
    }

    // --- Minimal validation ---
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), { status: 400 });
    }

    // --- Try Resend first (optional) ---
    const TO = env.CONTACT_TO; // e.g., intake@thewholenesscenter.org
    const FROM = env.CONTACT_FROM || "noreply@example.com"; // must be verified in Resend
    const RESEND = env.RESEND_API_KEY;

    let delivered = false;
    if (RESEND && TO) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: TO,
          from: FROM,
          subject: "WTC Website Contact",
          html: `<h2>New inquiry</h2>
                 <p><b>Name:</b> ${escapeHtml(name)}</p>
                 <p><b>Email:</b> ${escapeHtml(email)}</p>
                 <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
        }),
      });
      delivered = r.ok;
    }

    // --- Slack webhook fallback (optional) ---
    if (!delivered && env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `📨 WTC Contact\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        }),
      });
      delivered = true;
    }

    // --- Last resort: accept and log (visible in CF logs) ---
    if (!delivered) {
      console.log("WTC Contact:", { name, email, message });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "set-cookie": "wtc_contact_sent=1; Max-Age=60; Path=/; SameSite=Lax",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}
