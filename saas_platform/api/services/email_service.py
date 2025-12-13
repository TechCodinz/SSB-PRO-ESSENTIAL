"""
SSB PRO API - Premium Email Service
Elite-standard email templates for professional brand presence
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from api.config import settings

logger = logging.getLogger(__name__)


# ========================================
# 🎨 PREMIUM EMAIL BASE TEMPLATE
# ========================================
def get_email_wrapper(content: str, preview_text: str = "") -> str:
    """Wrap email content in premium template"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sol Sniper Bot PRO</title>
        <!--[if mso]>
        <style type="text/css">
            body, table, td {{font-family: Arial, Helvetica, sans-serif !important;}}
        </style>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617;">
        <!-- Preview text -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
            {preview_text}
        </div>
        
        <!-- Email Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(180deg, #020617 0%, #0f172a 100%);">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">
                        
                        <!-- Logo Header -->
                        <tr>
                            <td align="center" style="padding: 20px 0 30px;">
                                <div style="font-size: 28px; font-weight: 800; background: linear-gradient(90deg, #22d3ee, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                    ⚡ SOL SNIPER BOT PRO
                                </div>
                                <div style="color: #64748b; font-size: 12px; margin-top: 8px; letter-spacing: 2px;">
                                    INSTITUTIONAL-GRADE SOLANA TRADING
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Main Content Card -->
                        <tr>
                            <td style="background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95)); border-radius: 24px; border: 1px solid rgba(34, 211, 238, 0.2); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 40px;">
                                            {content}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 0; text-align: center;">
                                <div style="color: #475569; font-size: 11px; margin-bottom: 16px;">
                                    © 2024 Sol Sniper Bot PRO. All rights reserved.
                                </div>
                                <div style="margin-bottom: 12px;">
                                    <a href="https://ssbpro.dev" style="color: #22d3ee; text-decoration: none; margin: 0 12px; font-size: 12px;">Website</a>
                                    <a href="https://t.me/SSB_Support" style="color: #22d3ee; text-decoration: none; margin: 0 12px; font-size: 12px;">Telegram</a>
                                    <a href="https://twitter.com/SolSniperBot" style="color: #22d3ee; text-decoration: none; margin: 0 12px; font-size: 12px;">Twitter</a>
                                </div>
                                <div style="color: #334155; font-size: 10px;">
                                    You received this email because you signed up for SSB PRO.
                                </div>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


# ========================================
# 📧 SEND EMAIL FUNCTION
# ========================================
async def send_email(to: str, subject: str, html_content: str) -> bool:
    """Send an email"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Sol Sniper Bot PRO <{settings.SMTP_FROM}>"
        msg["To"] = to
        
        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to, msg.as_string())
        
        logger.info(f"Email sent to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


# ========================================
# 🎉 WELCOME EMAIL (On Registration)
# ========================================
async def send_welcome_email(email: str, user_name: str = None) -> bool:
    """Send welcome email after registration"""
    display_name = user_name or email.split('@')[0].title()
    dashboard_url = "https://ssbpro.dev/dashboard"
    
    content = f"""
    <h1 style="color: #f9fafb; font-size: 28px; margin: 0 0 16px; font-weight: 700;">
        Welcome to the Elite, {display_name}! 🎯
    </h1>
    
    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
        You've just unlocked access to the most powerful Solana trading engine ever built. 
        Our AI-powered neural network scans thousands of tokens per second, finding opportunities 
        before they hit mainstream.
    </p>
    
    <!-- Feature Grid -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
        <tr>
            <td width="50%" style="padding: 12px;">
                <div style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.2); border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🧠</div>
                    <div style="color: #22d3ee; font-weight: 600; font-size: 14px;">Divine AI Engine</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">98.5% Rug Detection</div>
                </div>
            </td>
            <td width="50%" style="padding: 12px;">
                <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">⚡</div>
                    <div style="color: #a855f7; font-weight: 600; font-size: 14px;">0.8ms Latency</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Snipe Before Humans</div>
                </div>
            </td>
        </tr>
        <tr>
            <td width="50%" style="padding: 12px;">
                <div style="background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
                    <div style="color: #4ade80; font-weight: 600; font-size: 14px;">Anti-Rug Protection</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Freeze & Honeypot Filter</div>
                </div>
            </td>
            <td width="50%" style="padding: 12px;">
                <div style="background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.2); border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
                    <div style="color: #facc15; font-weight: 600; font-size: 14px;">Auto-Compound</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Grow Faster 24/7</div>
                </div>
            </td>
        </tr>
    </table>
    
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 24px 0;">
        <strong style="color: #f9fafb;">What's Next?</strong><br>
        Head to your dashboard and start the simulator to see the power of SSB PRO in action. 
        When you're ready for live trading, upgrade your plan to unlock the full potential.
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
        <a href="{dashboard_url}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: #020617; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 999px; box-shadow: 0 10px 30px rgba(34, 211, 238, 0.3);">
            🚀 LAUNCH DASHBOARD
        </a>
    </div>
    
    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; margin-top: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 13px; margin: 0;">
            Questions? Our team is here 24/7 on <a href="https://t.me/SSB_Support" style="color: #22d3ee;">Telegram</a>
        </p>
    </div>
    """
    
    html = get_email_wrapper(content, f"Welcome to SSB PRO, {display_name}! Your trading journey begins now.")
    return await send_email(email, "🎯 Welcome to Sol Sniper Bot PRO – Let's Trade!", html)


# ========================================
# 🔑 LICENSE ACTIVATION EMAIL
# ========================================
async def send_license_email(email: str, license_key: str, plan: str) -> bool:
    """Send license key after successful payment"""
    dashboard_url = "https://ssbpro.dev/dashboard"
    download_url = "https://ssbpro.dev/download"
    
    plan_display = plan.upper().replace("_", " ")
    
    # Plan features based on tier
    plan_features = {
        "standard": ["5 trades/day", "Basic AI filters", "Email support"],
        "pro": ["50 trades/day", "Advanced AI", "Priority support", "Trailing stops"],
        "elite": ["Unlimited trades", "Divine AI Engine", "VIP support", "All features"],
        "admin": ["GOD MODE", "Unlimited everything", "Direct access", "Custom tuning"],
    }
    
    features = plan_features.get(plan.lower().split("_")[-1], plan_features["pro"])
    features_html = "".join([f'<li style="color: #94a3b8; margin: 8px 0;">✓ {f}</li>' for f in features])
    
    content = f"""
    <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
        <h1 style="color: #4ade80; font-size: 28px; margin: 0; font-weight: 700;">
            Payment Confirmed!
        </h1>
    </div>
    
    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; text-align: center; margin: 0 0 32px;">
        Thank you for upgrading to <strong style="color: #a855f7;">{plan_display}</strong>.<br>
        Your license is ready and waiting.
    </p>
    
    <!-- License Key Box -->
    <div style="background: linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15)); border: 2px solid rgba(34, 211, 238, 0.4); border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">
            Your License Key
        </div>
        <div style="font-family: 'Courier New', monospace; font-size: 24px; color: #22d3ee; font-weight: 700; letter-spacing: 2px;">
            {license_key}
        </div>
        <div style="color: #475569; font-size: 11px; margin-top: 12px;">
            Keep this safe. Use it to activate on the dashboard.
        </div>
    </div>
    
    <!-- Plan Features -->
    <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <div style="color: #f9fafb; font-weight: 600; margin-bottom: 12px;">Your {plan_display} includes:</div>
        <ul style="margin: 0; padding-left: 20px;">
            {features_html}
        </ul>
    </div>
    
    <!-- CTA Buttons -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
        <tr>
            <td width="50%" style="padding: 8px;">
                <a href="{dashboard_url}" style="display: block; padding: 14px 20px; background: linear-gradient(135deg, #22d3ee, #a855f7); color: #020617; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 999px; text-align: center;">
                    🚀 GO TO DASHBOARD
                </a>
            </td>
            <td width="50%" style="padding: 8px;">
                <a href="{download_url}" style="display: block; padding: 14px 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #f9fafb; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 999px; text-align: center;">
                    ⬇️ DOWNLOAD APP
                </a>
            </td>
        </tr>
    </table>
    """
    
    html = get_email_wrapper(content, f"Your {plan_display} license is ready! Key: {license_key}")
    return await send_email(email, f"🔑 Your SSB PRO {plan_display} License Key", html)


# ========================================
# ✉️ EMAIL VERIFICATION
# ========================================
async def send_verification_email(email: str, token: str) -> bool:
    """Send email verification link"""
    verify_url = f"https://ssbpro.dev/verify?token={token}"
    
    content = f"""
    <h1 style="color: #f9fafb; font-size: 24px; margin: 0 0 16px; font-weight: 700;">
        Verify Your Email 🔐
    </h1>
    
    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
        Please verify your email address to complete your registration and unlock 
        all features of Sol Sniper Bot PRO.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
        <a href="{verify_url}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: #020617; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 999px;">
            ✅ VERIFY EMAIL
        </a>
    </div>
    
    <p style="color: #64748b; font-size: 12px; text-align: center;">
        This link expires in 24 hours. If you didn't create an account, ignore this email.
    </p>
    """
    
    html = get_email_wrapper(content, "Verify your SSB PRO account")
    return await send_email(email, "✅ Verify Your SSB PRO Account", html)


# ========================================
# ⚠️ SUBSCRIPTION RENEWAL REMINDER
# ========================================
async def send_renewal_reminder(email: str, days_left: int, plan: str) -> bool:
    """Send renewal reminder email"""
    renew_url = "https://ssbpro.dev/pricing"
    
    urgency_color = "#facc15" if days_left > 3 else "#f87171"
    
    content = f"""
    <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 12px;">⏰</div>
        <h1 style="color: {urgency_color}; font-size: 24px; margin: 0; font-weight: 700;">
            Subscription Expiring Soon
        </h1>
    </div>
    
    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; text-align: center; margin: 0 0 24px;">
        Your <strong style="color: #a855f7;">{plan.upper()}</strong> subscription expires in 
        <strong style="color: {urgency_color};">{days_left} days</strong>.
    </p>
    
    <div style="background: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <p style="color: #facc15; font-size: 14px; margin: 0;">
            ⚡ Don't lose access to your trading engine.<br>
            Renew now and keep your profits rolling 24/7.
        </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
        <a href="{renew_url}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%); color: #020617; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 999px;">
            🔄 RENEW SUBSCRIPTION
        </a>
    </div>
    """
    
    html = get_email_wrapper(content, f"Your SSB PRO subscription expires in {days_left} days")
    return await send_email(email, f"⚠️ SSB PRO Expires in {days_left} Days – Renew Now", html)


# ========================================
# 📊 WEEKLY PERFORMANCE REPORT
# ========================================
async def send_weekly_report(email: str, stats: dict) -> bool:
    """Send weekly performance report"""
    
    total_pnl = stats.get("total_pnl", 0)
    pnl_color = "#4ade80" if total_pnl >= 0 else "#f87171"
    pnl_sign = "+" if total_pnl >= 0 else ""
    
    content = f"""
    <h1 style="color: #f9fafb; font-size: 24px; margin: 0 0 16px; font-weight: 700; text-align: center;">
        📊 Your Weekly Trading Report
    </h1>
    
    <p style="color: #64748b; font-size: 12px; text-align: center; margin-bottom: 24px;">
        {stats.get("week_start", "This Week")} - {stats.get("week_end", "Today")}
    </p>
    
    <!-- Main PnL -->
    <div style="text-align: center; background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 211, 238, 0.05)); border-radius: 16px; padding: 32px; margin: 24px 0;">
        <div style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
            Total P&L This Week
        </div>
        <div style="font-size: 48px; font-weight: 800; color: {pnl_color}; margin: 16px 0;">
            {pnl_sign}${abs(total_pnl):.2f}
        </div>
        <div style="color: #94a3b8; font-size: 14px;">
            {pnl_sign}{stats.get("pnl_percent", 0):.1f}% from starting balance
        </div>
    </div>
    
    <!-- Stats Grid -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
        <tr>
            <td width="33%" style="padding: 8px; text-align: center;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 24px; font-weight: 700; color: #22d3ee;">{stats.get("total_trades", 0)}</div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 4px;">TRADES</div>
                </div>
            </td>
            <td width="33%" style="padding: 8px; text-align: center;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 24px; font-weight: 700; color: #4ade80;">{stats.get("win_rate", 0):.0f}%</div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 4px;">WIN RATE</div>
                </div>
            </td>
            <td width="33%" style="padding: 8px; text-align: center;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px;">
                    <div style="font-size: 24px; font-weight: 700; color: #a855f7;">{stats.get("tokens_scanned", 0):,}</div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 4px;">SCANNED</div>
                </div>
            </td>
        </tr>
    </table>
    
    <div style="text-align: center; margin-top: 24px;">
        <a href="https://ssbpro.dev/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22d3ee, #a855f7); color: #020617; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 999px;">
            📈 VIEW FULL REPORT
        </a>
    </div>
    """
    
    html = get_email_wrapper(content, f"Your weekly P&L: {pnl_sign}${abs(total_pnl):.2f}")
    return await send_email(email, f"📊 Weekly Report: {pnl_sign}${abs(total_pnl):.2f} P&L", html)
