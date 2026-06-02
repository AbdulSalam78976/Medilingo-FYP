"""
Email service — sends transactional emails via SMTP.

Uses smtplib in a thread-pool executor so the async event loop is never blocked.
If SMTP_USERNAME / SMTP_PASSWORD are not configured the calls log a warning and
return without raising so that the rest of the request still succeeds.
"""

from __future__ import annotations

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


# ── Low-level send ────────────────────────────────────────────────────────────

async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — skipping email to %s (%s)", to, subject)
        return
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_sync, to, subject, html)


def _send_sync(to: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.sendmail(settings.FROM_EMAIL, [to], msg.as_string())
        logger.info("Email sent → %s: %s", to, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        raise


# ── Email templates ───────────────────────────────────────────────────────────

def _base(content: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#1A5F7A;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-.3px;">Medilingo</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:12px;">Cross-lingual Medical AI</p>
          </td>
        </tr>
        <tr><td style="padding:32px;">{content}</td></tr>
        <tr>
          <td style="padding:16px 32px;background:#f8f8f5;border-top:1px solid #ebebeb;">
            <p style="margin:0;font-size:11px;color:#aaa;">You received this email because an action was taken on your Medilingo account. If you did not request this, you can safely ignore it.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


async def send_welcome_email(to: str) -> None:
    content = f"""
<h2 style="margin:0 0 12px;color:#1A5F7A;font-size:22px;">Welcome to Medilingo!</h2>
<p style="margin:0 0 16px;color:#444;font-size:14px;line-height:1.6;">
  Your account has been created with <strong>{to}</strong>.
</p>
<p style="margin:0 0 24px;color:#444;font-size:14px;line-height:1.6;">
  You can now chat with the AI assistant in English, Urdu, or Roman Urdu — ask medical questions, check symptoms, or look up drug interactions.
</p>
<a href="{settings.FRONTEND_URL}/chat"
   style="display:inline-block;background:#1A5F7A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
  Go to Chat →
</a>"""
    await send_email(to, "Welcome to Medilingo", _base(content))


async def send_password_reset_email(to: str, reset_url: str) -> None:
    content = f"""
<h2 style="margin:0 0 12px;color:#1A5F7A;font-size:22px;">Reset Your Password</h2>
<p style="margin:0 0 16px;color:#444;font-size:14px;line-height:1.6;">
  We received a request to reset the password for <strong>{to}</strong>.
  Click the button below — this link expires in <strong>1 hour</strong>.
</p>
<a href="{reset_url}"
   style="display:inline-block;background:#1A5F7A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
  Reset Password →
</a>
<p style="margin:24px 0 0;color:#888;font-size:12px;">
  Or copy this URL into your browser:<br>
  <span style="color:#1A5F7A;word-break:break-all;">{reset_url}</span>
</p>"""
    await send_email(to, "Reset your Medilingo password", _base(content))
