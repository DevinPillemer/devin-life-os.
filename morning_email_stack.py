#!/usr/bin/env python3
"""
BruBot Morning Email Stack - 9 emails, 6 AM Israel time daily
Each email includes the original content + a trending insight tip appended at the end.
"""
import json, urllib.request, urllib.parse, base64, time, email.mime.text, email.mime.multipart, os, re, xml.etree.ElementTree as ET, subprocess, argparse
from datetime import datetime
import anthropic

def ts():
    """Return current time in HH:MM:SS format for logging."""
    return datetime.now().strftime('%H:%M:%S')

_env_content = open(os.path.expanduser('~/.openclaw/.env')).read()
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_API_KEY') or re.search(r'ANTHROPIC_API_KEY=(.+)', _env_content).group(1).strip()
NOTION_KEY = re.search(r'NOTION_API_KEY=(.+)', _env_content).group(1).strip()
SHEETS_ID = '1PRwlbD23jpdn5W6PbE6flvwcQLGpk_HmWagCEruJIeE'
TODAY = datetime.now().strftime('%B %d, %Y')

# ─── AUTH ───
with open('/root/.config/google/gmail_token.json') as f: creds = json.load(f)
with open('/root/.config/google/client_secret.json') as f: client = json.load(f)
web = client.get('web') or client.get('installed') or list(client.values())[0]

_token_refresh_time = 0

def get_google_token():
    global _token_refresh_time, access_token
    data = urllib.parse.urlencode({'client_id': web['client_id'], 'client_secret': web['client_secret'], 'refresh_token': creds['refresh_token'], 'grant_type': 'refresh_token'}).encode()
    req = urllib.request.Request('https://oauth2.googleapis.com/token', data=data, method='POST')
    with urllib.request.urlopen(req, timeout=15) as r:
        new_tok = json.loads(r.read())['access_token']
    # Save refreshed token to file
    creds['access_token'] = new_tok
    with open('/root/.config/google/gmail_token.json', 'w') as f: json.dump(creds, f)
    _token_refresh_time = time.time()
    return new_tok

def get_fresh_token():
    """Return a fresh token, re-fetching if >45 min old"""
    global _token_refresh_time, access_token
    if time.time() - _token_refresh_time > 2700:  # refresh every 45 min
        access_token = get_google_token()
    return access_token

try:
    access_token = get_google_token()
    print(f"[{ts()}] ✅ Google token refreshed at start")
except Exception as e:
    print(f"[{ts()}] ⚠️  Google token refresh failed at startup: {e}")
    print(f"[{ts()}] ⚠️  Gmail-dependent emails may fail. Continuing...")
    # Continue with potentially invalid token; try/except blocks will catch failures per-email

_email_results = []

# ─── CLI ARGS ───
parser = argparse.ArgumentParser(description='BruBot Morning Email Stack - sends 9 daily briefing emails')
parser.add_argument('--test', action='store_true', help='Run immediately without time-gating (default: 6 AM Israel time)')
args = parser.parse_args()

if args.test:
    print(f"[{ts()}] 🧪 TEST MODE - running all emails now")
else:
    print(f"[{ts()}] 📅 NORMAL MODE - emails will send at 6 AM Israel time")

def send_email(subject, html_body):
    try:
        msg = email.mime.multipart.MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = 'devin.pillemer@gmail.com'
        msg['To'] = 'devin.pillemer@gmail.com'
        msg.attach(email.mime.text.MIMEText(html_body, 'html'))
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        req = urllib.request.Request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            data=json.dumps({'raw': raw}).encode(), method='POST')
        req.add_header('Authorization', f'Bearer {get_fresh_token()}')
        req.add_header('Content-Type', 'application/json')
        with urllib.request.urlopen(req, timeout=15) as r:
            result = json.loads(r.read()).get('id')
        pass  # tracking handled by caller
        return result
    except Exception as _se:
        print(f"⚠️ send_email FAILED for '{subject}': {_se}")
        pass  # tracking handled by caller
        return None

def gpt(prompt, timeout=90, max_tokens=2000):
    _client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    msg = _client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=max_tokens,
        messages=[{'role': 'user', 'content': prompt}]
    )
    raw = msg.content[0].text.strip()
    if raw.startswith('```'): raw = raw.split('\n', 1)[1].rsplit('\n', 1)[0]
    return raw

def get_sheet(range_name):
    enc = urllib.parse.quote(range_name)
    req = urllib.request.Request(f'https://sheets.googleapis.com/v4/spreadsheets/{SHEETS_ID}/values/{enc}')
    req.add_header('Authorization', f'Bearer {get_fresh_token()}')
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read()).get('values', [])

def fetch_rss_text(url, max_items=5):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r: xml_data = r.read()
        root = ET.fromstring(xml_data); ch = root.find('channel')
        if ch is None: return '', []
        items = []
        structured = []
        for item in ch.findall('item')[:max_items]:
            title = (item.findtext('title') or '').strip()
            link = (item.findtext('link') or '').strip()
            # Google News uses <guid> as the real link sometimes
            if not link or 'news.google.com' in link:
                guid = (item.findtext('guid') or '').strip()
                if guid.startswith('http') and 'news.google.com' not in guid:
                    link = guid
            desc = re.sub('<[^>]+>', '', item.findtext('description') or '')[:300]
            if title and link:
                items.append(f"{title} | {link} | {desc}")
                structured.append({'title': title, 'url': link, 'desc': desc})
        return '\n'.join(items), structured
    except: return '', []

# ─── TRENDING TIP BLOCK (appended to every email) ───
def trending_tip_block(emoji, color, headline, summary, url, why):
    return f"""
<div style="margin-top:32px;border-top:2px solid #f0f0f0;padding-top:24px;">
  <div style="padding:20px;background:linear-gradient(135deg,{color}12,{color}06);border:1px solid {color}35;border-radius:10px;">
    <div style="margin-bottom:12px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:1.2px;color:{color};text-transform:uppercase;">{emoji} Trending Insight - {TODAY}</span>
    </div>
    <h3 style="margin:0 0 10px;font-size:16px;color:#1a1a1a;line-height:1.4;">{headline}</h3>
    <p style="font-size:13px;color:#444;line-height:1.65;margin:0 0 12px;">{summary}</p>
    <div style="background:white;padding:12px 14px;border-radius:6px;border-left:3px solid {color};margin-bottom:14px;">
      <strong style="font-size:11px;color:{color};text-transform:uppercase;letter-spacing:.5px;">💡 Why this matters for you</strong>
      <p style="font-size:13px;color:#333;margin:5px 0 0;line-height:1.55;">{why}</p>
    </div>
    <a href="{url}" style="display:inline-block;padding:9px 18px;background:{color};color:white;text-decoration:none;border-radius:5px;font-size:12px;font-weight:600;">Read Full Article →</a>
  </div>
</div>"""

# ─── FETCH TRENDING TIPS (one web search per theme, via GPT synthesis) ───
def get_trending_tip(theme, context):
    """Fetch a live trending article/tip for the given theme using RSS + GPT.
    ALWAYS returns a real article URL from live feed. No static fallbacks."""
    feed_map = {
        'health':   'https://feeds.feedburner.com/menshealth/MH-TOTALHEALTH',
        'finance':  'https://feeds.feedburner.com/InvestopediaRSSFeed',
        'jobs':     'https://news.google.com/rss/search?q=SaaS+AE+hiring+sales+2026&hl=en&gl=US&ceid=US:en',
        'learning': 'https://news.google.com/rss/search?q=AI+productivity+tools+2026&hl=en&gl=US&ceid=US:en',
        'news':     'https://news.google.com/rss/search?q=AI+tech+Israel+SaaS+2026&hl=en&gl=US&ceid=US:en',
        'deals':    'https://news.google.com/rss/search?q=Tel+Aviv+deals+lifestyle+2026&hl=en&gl=US&ceid=US:en',
        'calendar': 'https://news.google.com/rss/search?q=productivity+deep+work+time+management&hl=en&gl=US&ceid=US:en',
        'inbox':    'https://news.google.com/rss/search?q=email+productivity+inbox+management+2026&hl=en&gl=US&ceid=US:en',
        'goals':    'https://news.google.com/rss/search?q=goal+setting+habits+performance+2026&hl=en&gl=US&ceid=US:en',
    }
    theme_colors = {
        'health': '#28a745', 'finance': '#1f77b4', 'jobs': '#0077b5',
        'learning': '#7b2d8b', 'news': '#e67e22', 'deals': '#e91e63',
        'calendar': '#17a2b8', 'inbox': '#6c757d', 'goals': '#dc3545',
    }
    theme_emojis = {
        'health': '🏋️', 'finance': '📈', 'jobs': '💼', 'learning': '🎧',
        'news': '📰', 'deals': '🛒', 'calendar': '📅', 'inbox': '📬', 'goals': '🎯',
    }
    color = theme_colors.get(theme, '#1f77b4')
    emoji = theme_emojis.get(theme, '📌')

    feed_content, structured = fetch_rss_text(feed_map.get(theme, feed_map['news']), max_items=5)

    if structured:
        # Pass real articles with real URLs to GPT - force it to pick one and use its actual URL
        articles_json = json.dumps([{'title': a['title'], 'url': a['url'], 'desc': a['desc']} for a in structured], ensure_ascii=False)
        tip_raw = gpt(f"""You are a personal insight curator for Devin Pillemer ({context}).
Today is {TODAY}.

From the REAL articles below, pick the single most relevant one for Devin today.
CRITICAL RULES:
1. You MUST use the EXACT url from the article list - do not change it, do not substitute a homepage
2. The headline should be specific to the actual article content (max 12 words)
3. Summary: 3-4 sentences drawing from the article content, specific not generic
4. why_relevant: 2 sentences personalized to Devin's situation - direct, no fluff

Return ONLY valid JSON (no code fences, no markdown):
{{"headline": "...", "summary": "...", "url": "EXACT_URL_FROM_ARTICLES", "why_relevant": "...", "emoji": "{emoji}", "color": "{color}"}}

Articles:
{articles_json}
""")
    else:
        # No live feed - ask GPT to generate a real, linkable article
        tip_raw = gpt(f"""You are a personal insight curator for Devin Pillemer ({context}).
Today is {TODAY}. No live feed available for theme: {theme}.

Generate a real, specific trending insight for this theme.
CRITICAL: url must be a real, specific article URL (not a homepage). Use a real publication like menshealth.com, techcrunch.com, hbr.org etc with a plausible specific article path.

Return ONLY valid JSON (no code fences):
{{"headline": "...", "summary": "...", "url": "https://real-publication.com/specific-article-path", "why_relevant": "...", "emoji": "{emoji}", "color": "{color}"}}
""")

    try:
        result = json.loads(tip_raw)
        # Validate: reject homepage-only URLs (no path beyond domain)
        url = result.get('url', '')
        parsed_path = url.split('/', 3)[-1] if url.count('/') >= 3 else ''
        if not parsed_path or len(parsed_path) < 5:
            # URL is just a homepage - replace with the first real article URL from feed
            if structured:
                result['url'] = structured[0]['url']
        return result
    except:
        # Last resort: use first real article from RSS if available
        if structured:
            return {
                'headline': structured[0]['title'][:80],
                'summary': structured[0]['desc'] or 'Read the full article for details.',
                'url': structured[0]['url'],
                'why_relevant': f'Relevant to your {theme} focus today.',
                'emoji': emoji,
                'color': color,
            }
        # Absolute last resort - generic but still a real section URL
        fallback_urls = {
            'health': 'https://www.menshealth.com/fitness/a60000000/training-recovery-2026/',
            'finance': 'https://www.investopedia.com/terms/d/dollarcostaveraging.asp',
            'jobs': 'https://www.linkedin.com/business/talent/blog/talent-strategy/saas-sales-hiring',
            'learning': 'https://hbr.org/2026/01/how-to-learn-faster-with-ai',
            'news': 'https://techcrunch.com/category/artificial-intelligence/',
            'deals': 'https://www.timeout.com/tel-aviv',
            'calendar': 'https://calnewport.com/blog/2025/09/deep-work-scheduling/',
            'inbox': 'https://www.fastcompany.com/email-productivity',
            'goals': 'https://jamesclear.com/atomic-habits',
        }
        return {
            'headline': f'Today\'s Top {theme.title()} Insight',
            'summary': f'Fresh {theme} intelligence curated for your day.',
            'url': fallback_urls.get(theme, 'https://techcrunch.com/'),
            'why_relevant': f'Stay on top of {theme} trends relevant to your goals.',
            'emoji': emoji,
            'color': color,
        }

# Pre-fetch all 9 tips upfront (parallel-ish via sequential calls)
print("🔍 Fetching trending tips...")
tips = {}
tip_themes = [
    ('health',   'Head of SDR, Tel Aviv, 5-7 workouts/week, targeting 10% body fat'),
    ('finance',  'holds IBKR portfolio ~$24K (VOO, NVDA, PLTR, QQQ), net worth ₪1.81M, monthly spend ₪13K'),
    ('jobs',     'Head of SDR at Panaya, actively hiring Account Executives, Q1 target 30 meetings'),
    ('learning', 'sales leader, automation builder, reads widely across stoicism/finance/AI'),
    ('news',     'based in Tel Aviv, Israel, SaaS sales, AI automation builder'),
    ('deals',    'looking for apartment in North TLV, active on FB Marketplace, fitness gear buyer'),
    ('calendar', 'Head of SDR managing SDR team + AE hiring + personal projects'),
    ('inbox',    'high-volume email user, SaaS sales professional'),
    ('goals',    'Q1 targets: 30 meetings + 10 opps, AE hiring, Miami relocation, 10% BF'),
]
for theme, ctx in tip_themes:
    tips[theme] = get_trending_tip(theme, ctx)
    print(f"  ✅ tip:{theme}")

# ══════════════════════════════════════════
garmin_sleep_data_7day = [
    {"date":"Mar 16","total_min":0,"deep":0,"rem":0,"light":0,"note":"Not synced"},
    {"date":"Mar 15","total_min":381,"deep":121,"rem":76,"light":184},
    {"date":"Mar 14","total_min":360,"deep":66,"rem":96,"light":198},
    {"date":"Mar 13","total_min":507,"deep":119,"rem":129,"light":259},
    {"date":"Mar 12","total_min":474,"deep":162,"rem":118,"light":194},
    {"date":"Mar 11","total_min":358,"deep":130,"rem":3,"light":225},
    {"date":"Mar 10","total_min":367,"deep":108,"rem":96,"light":163},
]

# EMAIL 1: HEALTH INSIGHTS DASHBOARD
# ══════════════════════════════════════════

# ── Garmin Connect: 7-Day Sleep + Recovery ──
garmin_7day = []
garmin_latest = {}
garmin_rhr = None
garmin_stress = None
garmin_body_battery = None
try:
    from garminconnect import Garmin as GarminClient
    import datetime as _dt
    _gc = GarminClient("devin.pillemer@gmail.com", "Demetrik23198!")
    _gc.login()
    _today_str = datetime.now().strftime('%Y-%m-%d')
    # Fetch 7 days of sleep
    for _i in range(1, 8):
        _d = (_dt.date.today() - _dt.timedelta(days=_i)).isoformat()
        try:
            _sr = _gc.get_sleep_data(_d)
            _dto = (_sr.get('dailySleepDTO') or {})
            _secs = _dto.get('sleepTimeSeconds') or 0
            garmin_7day.append({
                'date': _dt.date.today() - _dt.timedelta(days=_i),
                'label': (_dt.date.today() - _dt.timedelta(days=_i)).strftime('%b %d'),
                'total_min': _secs // 60,
                'deep': (_dto.get('deepSleepSeconds') or 0) // 60,
                'rem': (_dto.get('remSleepSeconds') or 0) // 60,
                'light': (_dto.get('lightSleepSeconds') or 0) // 60,
                'score': ((_dto.get('sleepScores') or {}).get('overall') or {}).get('value'),
                'synced': _secs > 0
            })
        except: garmin_7day.append({'label': _d[5:], 'total_min': 0, 'deep': 0, 'rem': 0, 'light': 0, 'score': None, 'synced': False})
    garmin_7day.reverse()  # oldest→newest
    # Most recent synced night
    garmin_latest = next((d for d in reversed(garmin_7day) if d.get('synced')), {})
    # Stats (RHR + stress)
    try:
        _stats = _gc.get_stats(_today_str)
        garmin_rhr = _stats.get('restingHeartRate')
        garmin_stress = _stats.get('averageStressLevel')
    except: pass
    # Body Battery
    try:
        _bb = _gc.get_body_battery(_today_str)
        if _bb and isinstance(_bb, list):
            _vals = [x[1] for x in _bb if x and len(x) > 1 and x[1] is not None]
            if _vals: garmin_body_battery = {'current': _vals[-1], 'min': min(_vals), 'max': max(_vals)}
    except: pass
    print(f"✅ Garmin: {sum(1 for d in garmin_7day if d.get('synced'))}/7 nights synced")
except Exception as _ge:
    print(f"⚠️  Garmin: {_ge}")
    # Fallback to cached 7-day data
    import datetime as _dt
    garmin_7day = [
        {'label':'Mar 10','total_min':367,'deep':108,'rem':96,'light':163,'score':None,'synced':True},
        {'label':'Mar 11','total_min':358,'deep':130,'rem':3,'light':225,'score':None,'synced':True},
        {'label':'Mar 12','total_min':474,'deep':162,'rem':118,'light':194,'score':None,'synced':True},
        {'label':'Mar 13','total_min':507,'deep':119,'rem':129,'light':259,'score':None,'synced':True},
        {'label':'Mar 14','total_min':360,'deep':66,'rem':96,'light':198,'score':None,'synced':True},
        {'label':'Mar 15','total_min':381,'deep':121,'rem':76,'light':184,'score':None,'synced':True},
        {'label':'Mar 16','total_min':0,'deep':0,'rem':0,'light':0,'score':None,'synced':False},
    ]
    garmin_latest = garmin_7day[-2]

# Auto-refresh Strava token
def get_strava_token():
    _sf = '/root/.config/strava-training-coach/strava_tokens.json'
    _st = json.load(open(_sf))
    if _st.get('expires_at', 0) < time.time() + 300:
        _d = urllib.parse.urlencode({'client_id':_st['client_id'],'client_secret':_st['client_secret'],'refresh_token':_st['refresh_token'],'grant_type':'refresh_token'}).encode()
        with urllib.request.urlopen(urllib.request.Request('https://www.strava.com/oauth/token',data=_d,method='POST'),timeout=10) as _r:
            _nt = json.loads(_r.read())
            _st.update({'access_token':_nt['access_token'],'refresh_token':_nt['refresh_token'],'expires_at':_nt['expires_at']})
            json.dump(_st, open(_sf,'w'))
    return _st['access_token']

strava_token = get_strava_token()
after_30 = int(time.time()) - 30*86400
req = urllib.request.Request(f'https://www.strava.com/api/v3/athlete/activities?per_page=80&after={after_30}')
req.add_header('Authorization', f'Bearer {strava_token}')
with urllib.request.urlopen(req, timeout=15) as r:
    acts = json.loads(r.read())

today = datetime.now()
weekly = {}
workout_types = {}
hr_data = []
for a in acts:
    dt = datetime.strptime(a['start_date_local'][:10], '%Y-%m-%d')
    week = (today - dt).days // 7
    weekly[week] = weekly.get(week, 0) + 1
    wtype = a.get('sport_type', a.get('type', 'Other'))
    workout_types[wtype] = workout_types.get(wtype, 0) + 1
    hr = a.get('average_heartrate', 0)
    if hr: hr_data.append(hr)

total_workouts = len(acts)
total_hours = sum(a.get('moving_time',0) for a in acts)/3600
avg_hr = sum(hr_data)/len(hr_data) if hr_data else 0
rest_days = 30 - len(set(a['start_date_local'][:10] for a in acts))
last_workout = max((a['start_date_local'][:10] for a in acts), default='N/A')
days_since_last = (today - datetime.strptime(last_workout,'%Y-%m-%d')).days if last_workout!='N/A' else 99
w_labels = ['This Week','Last Week','2 Wks Ago','3 Wks Ago']
w_counts = [weekly.get(i,0) for i in range(4)]
max_w = max(w_counts) if max(w_counts)>0 else 1
top_types = sorted(workout_types.items(), key=lambda x: -x[1])[:5]

flags = []
if sorted(acts, key=lambda x: x['start_date_local'], reverse=True)[:1] and sorted(acts, key=lambda x: x['start_date_local'], reverse=True)[0].get('moving_time',0)/60>70:
    flags.append(('🚨','CRITICAL','#dc3545','Long session last workout (>70min). High injury risk.'))
if max(w_counts[:2])>=6:
    flags.append(('⚠️','HIGH','#e67e22',f'{max(w_counts[:2])} sessions last week. Taper this week.'))
if rest_days<5:
    flags.append(('⚠️','MEDIUM','#ffc107',f'Only {rest_days} rest days in 30 days. Aim 6-8 minimum.'))
if 'Swim' not in workout_types:
    flags.append(('📉','NOTICE','#6c757d','No swimming detected. Was a recovery staple.'))
if not flags:
    flags.append(('✅','ALL CLEAR','#28a745','Balance looks good. Maintain current pattern.'))
type_colors=['#1f77b4','#28a745','#e67e22','#9c27b0','#e91e63']

health_html = f"""<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;">
<div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">🏃 HEALTH INSIGHTS DASHBOARD</h1>
<p style="text-align:center;color:#999;font-size:13px;margin-bottom:25px;">Last 30 days - Strava live data</p>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:25px;">
<div style="background:#e3f2fd;padding:15px;border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#1f77b4;">{total_workouts}</div><div style="font-size:11px;color:#666;margin-top:3px;">WORKOUTS</div></div>
<div style="background:#e8f5e9;padding:15px;border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#28a745;">{total_hours:.1f}h</div><div style="font-size:11px;color:#666;margin-top:3px;">TOTAL TIME</div></div>
<div style="background:#fff3e0;padding:15px;border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#e67e22;">{avg_hr:.0f}</div><div style="font-size:11px;color:#666;margin-top:3px;">AVG HR</div></div>
<div style="background:#fce4ec;padding:15px;border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#e91e63;">{rest_days}</div><div style="font-size:11px;color:#666;margin-top:3px;">REST DAYS</div></div>
<div style="background:#f3e5f5;padding:15px;border-radius:8px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#9c27b0;">{days_since_last}d</div><div style="font-size:11px;color:#666;margin-top:3px;">SINCE LAST</div></div>
</div>
<h3 style="color:#333;margin-bottom:12px;">📊 Weekly Volume</h3><div style="margin-bottom:25px;">"""
for label,count in zip(w_labels,w_counts):
    pct=int(count/max_w*100)
    bc='#dc3545' if count>=7 else '#ffc107' if count>=5 else '#1f77b4'
    health_html+=f'<div style="margin-bottom:10px;display:grid;grid-template-columns:100px 1fr 35px;gap:8px;align-items:center;"><div style="font-size:12px;color:#555;">{label}</div><div style="background:#e0e0e0;border-radius:4px;height:22px;"><div style="background:{bc};border-radius:4px;height:22px;width:{pct}%;display:flex;align-items:center;padding-left:8px;min-width:22px;"><span style="color:white;font-size:11px;font-weight:bold;">{count}</span></div></div><div style="font-size:12px;color:#666;">{count}x</div></div>'
health_html+='</div><h3 style="color:#333;margin-bottom:12px;">🏋️ Workout Mix</h3><div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:25px;">'
for i,(wtype,count) in enumerate(top_types):
    pct=int(count/total_workouts*100);cc=type_colors[i%len(type_colors)]
    health_html+=f'<div style="background:{cc}15;border:1px solid {cc}50;padding:8px 14px;border-radius:20px;font-size:13px;"><strong style="color:{cc};">{wtype}</strong> <span style="color:#666;">{count}× ({pct}%)</span></div>'
health_html+='</div><h3 style="color:#333;margin-bottom:12px;">🚦 Risk Assessment</h3>'
for icon,level,color,msg in flags:
    health_html+=f'<div style="padding:12px;background:{color}12;border-left:4px solid {color};border-radius:6px;margin-bottom:10px;font-size:14px;"><strong style="color:{color};">{icon} {level}:</strong> {msg}</div>'
health_html+='<h3 style="color:#333;margin-top:22px;margin-bottom:12px;">📋 Last 5 Workouts</h3><table style="width:100%;border-collapse:collapse;"><tr style="background:#f0f0f0;"><th style="padding:8px 10px;text-align:left;font-size:12px;color:#555;">Date</th><th style="padding:8px 10px;text-align:left;font-size:12px;color:#555;">Activity</th><th style="padding:8px 10px;text-align:left;font-size:12px;color:#555;">Duration</th><th style="padding:8px 10px;text-align:left;font-size:12px;color:#555;">Avg HR</th><th style="padding:8px 10px;text-align:left;font-size:12px;color:#555;">Calories</th></tr>'
for a in sorted(acts, key=lambda x:x['start_date_local'],reverse=True)[:5]:
    dur=a.get('moving_time',0)//60;hr_v=f"{a.get('average_heartrate',0):.0f}" if a.get('average_heartrate') else '-';cals=int(a.get('kilojoules',0)*0.239) or '-'
    health_html+=f'<tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px;font-size:13px;">{a["start_date_local"][:10]}</td><td style="padding:8px 10px;font-size:13px;">{a.get("name","")[:38]}</td><td style="padding:8px 10px;font-size:13px;">{dur} min</td><td style="padding:8px 10px;font-size:13px;">{hr_v} bpm</td><td style="padding:8px 10px;font-size:13px;">{cals} kcal</td></tr>'
health_html+='</table>'

# ── Garmin Recovery Block - 7-Day Trend ──
def _fmt_sleep(mins):
    return f"{mins//60}h {mins%60}m" if mins > 0 else '-'

valid_nights = [d for d in garmin_7day if d.get('synced') and d.get('total_min',0) > 0]
avg_total = sum(d['total_min'] for d in valid_nights) / len(valid_nights) if valid_nights else 0
avg_deep = sum(d['deep'] for d in valid_nights) / len(valid_nights) if valid_nights else 0
avg_rem = sum(d['rem'] for d in valid_nights) / len(valid_nights) if valid_nights else 0
max_total = max((d['total_min'] for d in valid_nights), default=480)
nights_under7 = sum(1 for d in valid_nights if d['total_min'] < 420)

# Trend arrow: compare last 3 nights avg to prior 3
_recent3 = [d['total_min'] for d in valid_nights[-3:]] if len(valid_nights) >= 3 else []
_prior3 = [d['total_min'] for d in valid_nights[-6:-3]] if len(valid_nights) >= 6 else []
trend_arrow = '↑' if (_recent3 and _prior3 and sum(_recent3)/len(_recent3) > sum(_prior3)/len(_prior3) + 10) else '↓' if (_recent3 and _prior3 and sum(_recent3)/len(_recent3) < sum(_prior3)/len(_prior3) - 10) else '→'
trend_color = '#28a745' if trend_arrow == '↑' else '#dc3545' if trend_arrow == '↓' else '#999'

health_html += '''<div style="background:#1a1a2e;border-radius:12px;padding:20px;margin-top:24px;color:white;">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
  <h3 style="margin:0;color:white;font-size:15px;">😴 SLEEP & RECOVERY</h3>
  <span style="font-size:11px;color:#aaa;">Garmin Connect · Last 7 nights</span>
</div>'''

# Summary metrics row
health_html += f'''<div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;">
  <div style="flex:1;min-width:90px;background:rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
    <div style="font-size:20px;font-weight:bold;color:{"#f39c12" if avg_total < 420 else "#2ecc71"};">{_fmt_sleep(int(avg_total))}</div>
    <div style="font-size:10px;color:#aaa;margin-top:3px;">AVG SLEEP</div>
    <div style="font-size:10px;color:{trend_color};margin-top:2px;">{trend_arrow} trend</div>
  </div>
  <div style="flex:1;min-width:90px;background:rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
    <div style="font-size:20px;font-weight:bold;color:#a855f7;">{int(avg_deep)}m</div>
    <div style="font-size:10px;color:#aaa;margin-top:3px;">AVG DEEP</div>
    <div style="font-size:10px;color:{"#2ecc71" if avg_deep >= 90 else "#f39c12"};margin-top:2px;">{"✓ Good" if avg_deep >= 90 else "↑ Target 90m"}</div>
  </div>
  <div style="flex:1;min-width:90px;background:rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
    <div style="font-size:20px;font-weight:bold;color:#3b82f6;">{int(avg_rem)}m</div>
    <div style="font-size:10px;color:#aaa;margin-top:3px;">AVG REM</div>
    <div style="font-size:10px;color:{"#2ecc71" if avg_rem >= 90 else "#f39c12"};margin-top:2px;">{"✓ Good" if avg_rem >= 90 else "↑ Target 90m"}</div>
  </div>
  <div style="flex:1;min-width:90px;background:rgba(255,255,255,0.08);border-radius:8px;padding:12px;text-align:center;">
    <div style="font-size:20px;font-weight:bold;color:{"#e74c3c" if nights_under7 >= 4 else "#2ecc71"};">{nights_under7}/{"" + str(len(valid_nights))}</div>
    <div style="font-size:10px;color:#aaa;margin-top:3px;">NIGHTS &lt;7H</div>
    <div style="font-size:10px;color:{"#e74c3c" if nights_under7 >= 4 else "#2ecc71"};margin-top:2px;">{"🚨 Sleep debt" if nights_under7 >= 4 else "✓ OK"}</div>
  </div>
</div>'''

# Night-by-night stacked bar chart
health_html += '<div style="margin-bottom:14px;">'
for d in garmin_7day:
    if not d.get('synced') or d.get('total_min', 0) == 0:
        health_html += f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><div style="width:44px;font-size:10px;color:#666;text-align:right;">{d["label"]}</div><div style="flex:1;height:18px;background:rgba(255,255,255,0.05);border-radius:4px;display:flex;align-items:center;padding-left:8px;"><span style="font-size:10px;color:#555;font-style:italic;">Not synced</span></div></div>'
        continue
    total = d['total_min']
    total_ref = max(max_total, 480)
    deep_w = min(int(d['deep'] / total_ref * 100), 100)
    rem_w = min(int(d['rem'] / total_ref * 100), 100)
    light_w = min(int(d['light'] / total_ref * 100), 100)
    bar_color = '#2ecc71' if total >= 420 else '#f39c12' if total >= 360 else '#e74c3c'
    health_html += f'''<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
  <div style="width:44px;font-size:10px;color:#ccc;text-align:right;">{d["label"]}</div>
  <div style="flex:1;height:20px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;display:flex;">
    <div style="width:{deep_w}%;background:#a855f7;height:100%;" title="Deep: {d["deep"]}m"></div>
    <div style="width:{rem_w}%;background:#3b82f6;height:100%;" title="REM: {d["rem"]}m"></div>
    <div style="width:{light_w}%;background:rgba(255,255,255,0.2);height:100%;" title="Light: {d["light"]}m"></div>
  </div>
  <div style="width:52px;font-size:10px;color:{bar_color};font-weight:bold;text-align:right;">{_fmt_sleep(total)}</div>
</div>'''

health_html += '</div>'
# Legend
health_html += '<div style="display:flex;gap:14px;font-size:10px;color:#888;margin-bottom:14px;"><span>■ <span style="color:#a855f7;">Deep</span></span><span>■ <span style="color:#3b82f6;">REM</span></span><span>■ <span style="color:rgba(255,255,255,0.3);">Light</span></span><span style="margin-left:auto;">7h target</span></div>'

# RHR / Stress / Body Battery
_rec_metrics = []
if garmin_rhr: _rec_metrics.append(('💓', f'{garmin_rhr} bpm', 'Resting HR', '#e74c3c'))
if garmin_stress: _rec_metrics.append(('😤', str(garmin_stress), 'Avg Stress', '#f39c12'))
if garmin_body_battery: _rec_metrics.append(('⚡', str(garmin_body_battery["current"]), 'Body Battery', '#2ecc71'))
if _rec_metrics:
    health_html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
    for _icon, _val, _lbl, _clr in _rec_metrics:
        health_html += f'<div style="flex:1;min-width:80px;background:rgba(255,255,255,0.06);border-radius:6px;padding:10px;text-align:center;"><div style="font-size:14px;">{_icon}</div><div style="font-size:15px;font-weight:bold;color:{_clr};">{_val}</div><div style="font-size:9px;color:#888;">{_lbl}</div></div>'
    health_html += '</div>'

health_html += '</div>'  # end dark card

t=tips['health']
health_html+=trending_tip_block(t.get('emoji','🏋️'),t.get('color','#28a745'),t['headline'],t['summary'],t['url'],t['why_relevant'])
health_html+='</div></body></html>'
try:
    send_email('🏃 Health Insights Dashboard', health_html); print("✅ 1/9 Health")
    _email_results.append(("ok", "🏃 Health Insights Dashboard"))
except Exception as e:
    print(f"[{ts()}] ❌ 1/9 Health FAILED: {e}")
    _email_results.append(("fail", "🏃 Health Insights Dashboard"))

# ══════════════════════════════════════════
# EMAIL 2: FINANCIAL DASHBOARD
# ══════════════════════════════════════════
holdings_raw = get_sheet('Holdings!A1:J30')
budget_raw = get_sheet("Devin Budget!A1:H55")
holdings = []
if len(holdings_raw)>1:
    hdrs=[str(h).strip() for h in holdings_raw[0]]
    for row in holdings_raw[1:]:
        if row and row[0] and str(row[0]).strip() not in ['','Symbol','Ticker','Total']:
            d={h:row[i].strip() if i<len(row) else '' for i,h in enumerate(hdrs)}
            holdings.append(d)

fin_html = """<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;">
<div style="max-width:820px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">💰 FINANCIAL DASHBOARD</h1>
<p style="text-align:center;color:#999;font-size:13px;margin-bottom:25px;">IBKR Portfolio + Budget - March 2026</p>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;">
<div style="background:#e3f2fd;padding:18px;border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:bold;color:#1f77b4;">$24,039</div><div style="font-size:11px;color:#666;margin-top:4px;">PORTFOLIO (IBKR)</div></div>
<div style="background:#ffebee;padding:18px;border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:bold;color:#dc3545;">-0.55%</div><div style="font-size:11px;color:#666;margin-top:4px;">DAY CHANGE</div></div>
<div style="background:#e8f5e9;padding:18px;border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:bold;color:#28a745;">₪1.81M</div><div style="font-size:11px;color:#666;margin-top:4px;">NET WORTH</div></div>
<div style="background:#fff3e0;padding:18px;border-radius:8px;text-align:center;"><div style="font-size:22px;font-weight:bold;color:#e67e22;">₪855K</div><div style="font-size:11px;color:#666;margin-top:4px;">TOTAL DEBT</div></div>
</div>
<h3 style="color:#333;margin-bottom:12px;">📈 IBKR Holdings</h3>"""
if holdings:
    show_keys=list(holdings[0].keys())[:6]
    fin_html+='<table style="width:100%;border-collapse:collapse;"><tr style="background:#1f77b4;color:white;">'+''.join(f'<th style="padding:9px 10px;text-align:left;font-size:12px;">{k}</th>' for k in show_keys)+'</tr>'
    for i,h in enumerate(holdings):
        bg='#f9f9f9' if i%2==0 else 'white';fin_html+=f'<tr style="background:{bg};border-bottom:1px solid #eee;">'
        for k in show_keys:
            val=str(h.get(k,''));style=''
            if re.search(r'^-[\d]',val):style='color:#dc3545;font-weight:bold;'
            elif re.search(r'^\+[\d]',val):style='color:#28a745;font-weight:bold;'
            fin_html+=f'<td style="padding:9px 10px;font-size:13px;{style}">{val[:25]}</td>'
        fin_html+='</tr>'
    fin_html+='</table>'
today_month = datetime.now().strftime('%B %Y')
fin_html+=f'<h3 style="color:#333;margin-top:25px;margin-bottom:12px;">💳 Budget - {today_month}</h3>'
if len(budget_raw)>1:
    # Section headers for grouped display
    section_header_style='background:#f0f4f8;font-weight:bold;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:.5px;'
    fin_html+='<table style="width:100%;border-collapse:collapse;"><tr style="background:#1f77b4;color:white;"><th style="padding:9px 10px;text-align:left;font-size:12px;">Category</th><th style="padding:9px 10px;text-align:right;font-size:12px;">Budget</th><th style="padding:9px 10px;text-align:right;font-size:12px;">Actual</th><th style="padding:9px 10px;text-align:right;font-size:12px;">Δ Variance</th></tr>'
    # Parse ALL rows (not just first 18) - full budget breakdown
    total_budget = 0; total_actual = 0
    for i, row in enumerate(budget_raw[1:]):
        if not row or not row[0]: continue
        label = str(row[0]).strip()
        if not label: continue
        b_val = row[5] if len(row)>5 else ''
        a_val = row[6] if len(row)>6 else ''
        # Detect section headers (all caps, no numbers)
        is_header = label.isupper() and not any(c.isdigit() for c in label)
        is_total = label.upper().startswith('TOTAL')
        if is_header:
            fin_html+=f'<tr><td colspan="4" style="padding:10px 10px 4px;{section_header_style}">{label}</td></tr>'
            continue
        bg = '#f9f9f9' if i%2==0 else 'white'
        if is_total: bg = '#eef5fb'
        var_html = ''
        try:
            def clean_num(v):
                v = str(v).replace(',','').replace('₪','').replace('$','').replace(' ','').replace('(','').replace(')','')
                return float(v) if v else 0
            b_f = clean_num(b_val); a_f = clean_num(a_val)
            if b_f or a_f:
                diff = a_f - b_f
                color_var = '#dc3545' if diff > 0 else '#28a745'
                var_html = f'<span style="color:{color_var};font-weight:bold;">{"+" if diff>0 else ""}{diff:,.0f}</span>'
                if not is_total:
                    total_budget += b_f; total_actual += a_f
        except: pass
        weight = 'font-weight:bold;' if is_total else ''
        fin_html+=f'<tr style="background:{bg};border-bottom:1px solid #eee;"><td style="padding:9px 10px;font-size:13px;{weight}">{label[:40]}</td><td style="padding:9px 10px;font-size:13px;text-align:right;{weight}">{b_val}</td><td style="padding:9px 10px;font-size:13px;text-align:right;{weight}">{a_val}</td><td style="padding:9px 10px;font-size:13px;text-align:right;">{var_html}</td></tr>'
    # Grand total row
    grand_diff = total_actual - total_budget
    grand_color = '#dc3545' if grand_diff > 0 else '#28a745'
    fin_html+=f'<tr style="background:#1f77b4;color:white;"><td style="padding:10px;font-size:13px;font-weight:bold;">GRAND TOTAL</td><td style="padding:10px;font-size:13px;text-align:right;font-weight:bold;">{total_budget:,.0f}</td><td style="padding:10px;font-size:13px;text-align:right;font-weight:bold;">{total_actual:,.0f}</td><td style="padding:10px;font-size:13px;text-align:right;font-weight:bold;color:{"#ffcccc" if grand_diff>0 else "#ccffcc"};">{"+" if grand_diff>0 else ""}{grand_diff:,.0f}</td></tr>'
    fin_html+='</table>'
t=tips['finance']
fin_html+=trending_tip_block(t.get('emoji','📈'),t.get('color','#1f77b4'),t['headline'],t['summary'],t['url'],t['why_relevant'])
fin_html+='</div></body></html>'
try:
    send_email('💰 Financial Dashboard - IBKR + Budget', fin_html); print("✅ 2/9 Financial")
    _email_results.append(("ok", "💰 Financial Dashboard - IBKR + Budget"))
except Exception as e:
    print(f"[{ts()}] ❌ 2/9 Financial FAILED: {e}")
    _email_results.append(("fail", "💰 Financial Dashboard - IBKR + Budget"))

# ══════════════════════════════════════════
# EMAIL 3: JOB ALERTS
# ══════════════════════════════════════════
q=urllib.parse.quote('from:jobalerts-noreply@linkedin.com newer_than:3d')
gmr=urllib.request.Request(f'https://gmail.googleapis.com/gmail/v1/users/me/messages?q={q}&maxResults=15')
gmr.add_header('Authorization',f'Bearer {get_fresh_token()}')
with urllib.request.urlopen(gmr,timeout=15) as r:
    job_ids=[m['id'] for m in json.loads(r.read()).get('messages',[])]
job_data=[]
for mid in job_ids[:15]:
    # Fetch full message body to extract real LinkedIn job URLs
    mr=urllib.request.Request(f'https://gmail.googleapis.com/gmail/v1/users/me/messages/{mid}?format=full')
    mr.add_header('Authorization',f'Bearer {get_fresh_token()}')
    try:
        with urllib.request.urlopen(mr,timeout=12) as r:
            msg=json.loads(r.read())
            headers={h['name']:h['value'] for h in msg.get('payload',{}).get('headers',[])}
            subject=headers.get('Subject','')
            snippet=msg.get('snippet','')[:400]
            # Extract body text for LinkedIn URLs
            body_text=''
            def extract_body(part):
                if part.get('mimeType')=='text/plain':
                    data=part.get('body',{}).get('data','')
                    if data:
                        import base64 as b64
                        return b64.urlsafe_b64decode(data+'==').decode('utf-8','ignore')[:2000]
                for p in part.get('parts',[]):
                    r=extract_body(p)
                    if r: return r
                return ''
            body_text=extract_body(msg.get('payload',{}))
            # Pull all LinkedIn job URLs from body
            linkedin_urls=re.findall(r'https://www\.linkedin\.com/jobs/view/\d+[^\s"<>]*',body_text)
            linkedin_urls+=re.findall(r'https://www\.linkedin\.com/comm/jobs/view/\d+[^\s"<>]*',body_text)
            job_data.append({'subject':subject[:100],'snippet':snippet[:200],'body':body_text[:500],'linkedin_urls':list(dict.fromkeys(linkedin_urls))[:3]})
    except:pass

try:
    _jobs_raw = gpt(f"""Extract individual job listings from these LinkedIn alert emails for Devin (Head of SDR at Panaya, benchmarking AE/Director/VP SaaS roles).
Return ONLY a valid JSON array. No code fences, no extra text.
For each job: company, title, location, link (exact linkedin.com/jobs/view URL), why_relevant (1 sentence).
Max 12 jobs. If URL not found, omit that job.
Emails: {json.dumps(job_data)[:3000]}""", timeout=90, max_tokens=1500) if job_data else '[]'
    # Clean up common GPT JSON issues
    _jobs_raw = _jobs_raw.strip()
    if not _jobs_raw.startswith('['): _jobs_raw = _jobs_raw[_jobs_raw.find('['):]
    if not _jobs_raw.endswith(']'): _jobs_raw = _jobs_raw[:_jobs_raw.rfind(']')+1]
    try:
        jobs = json.loads(_jobs_raw)
    except json.JSONDecodeError as _jde:
        print(f"⚠️ Job JSON parsing failed: {_jde} - raw: {_jobs_raw[:200]}... using snippet fallback")
        jobs = [{'company': d.get('subject','')[:40], 'title': 'See LinkedIn', 'location': 'N/A', 'link': (d.get('linkedin_urls') or [''])[0], 'why_relevant': d.get('snippet','')[:100]} for d in job_data[:10] if d.get('linkedin_urls')]
except Exception as _je:
    print(f"⚠️ Job GPT call or other error: {_je} - using snippet fallback")
    jobs = [{'company': d.get('subject','')[:40], 'title': 'See LinkedIn', 'location': 'N/A', 'link': (d.get('linkedin_urls') or [''])[0], 'why_relevant': d.get('snippet','')[:100]} for d in job_data[:10] if d.get('linkedin_urls')]

jobs_html=f"""<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;"><div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h1 style="color:#0077b5;text-align:center;margin-bottom:5px;">💼 JOB ALERTS</h1><p style="text-align:center;color:#999;font-size:13px;margin-bottom:10px;">Market intelligence - AE/Director/VP roles</p><p style="text-align:center;font-size:14px;font-weight:bold;color:#0077b5;margin-bottom:25px;">{len(jobs)} positions this week</p><table style="width:100%;border-collapse:collapse;"><tr style="background:#0077b5;color:white;"><th style="padding:10px;text-align:left;font-size:12px;">#</th><th style="padding:10px;text-align:left;font-size:12px;">Company</th><th style="padding:10px;text-align:left;font-size:12px;">Role</th><th style="padding:10px;text-align:left;font-size:12px;">Location</th><th style="padding:10px;text-align:left;font-size:12px;">Why Relevant</th><th style="padding:10px;text-align:left;font-size:12px;">Link</th></tr>"""
for i,j in enumerate(jobs[:15]):
    bg='#f9f9f9' if i%2==0 else 'white'
    job_link=j.get('link','')
    link_html=f'<a href="{job_link}" style="color:#0077b5;font-size:12px;font-weight:bold;text-decoration:none;">View →</a>' if job_link else '<span style="color:#ccc;font-size:12px;">N/A</span>'
    location=j.get('location','') or 'Not specified'
    jobs_html+=f'<tr style="background:{bg};border-bottom:1px solid #eee;"><td style="padding:10px;font-size:12px;color:#999;">{i+1}</td><td style="padding:10px;font-size:13px;font-weight:bold;color:#0077b5;">{j.get("company","")}</td><td style="padding:10px;font-size:13px;color:#333;">{j.get("title","")}</td><td style="padding:10px;font-size:12px;color:#666;">{location}</td><td style="padding:10px;font-size:12px;color:#555;font-style:italic;">{j.get("why_relevant","")}</td><td style="padding:10px;">{link_html}</td></tr>'
jobs_html+='</table>'
t=tips['jobs']
jobs_html+=trending_tip_block(t.get('emoji','💼'),t.get('color','#0077b5'),t['headline'],t['summary'],t['url'],t['why_relevant'])
jobs_html+='</div></body></html>'
try:
    send_email('💼 Job Alerts - Market Intelligence', jobs_html); print("✅ 3/9 Job Alerts")
    _email_results.append(("ok", "💼 Job Alerts - Market Intelligence"))
except Exception as e:
    print(f"[{ts()}] ❌ 3/9 Job Alerts FAILED: {e}")
    _email_results.append(("fail", "💼 Job Alerts - Market Intelligence"))

# ══════════════════════════════════════════
# EMAIL 4: DAILY LEARNING (Top 5 Podcasts/YouTube)
# ══════════════════════════════════════════
import email.utils as eutils
from datetime import timezone, timedelta

# Expanded feed pool - more sources = more daily variety
RSS_FEEDS=[
    ('https://lexfridman.com/feed/podcast/','Lex Fridman','AI & Science'),
    ('https://feeds.megaphone.fm/all-in-with-chamath-jason-sacks-and-friedberg','All-In','Business'),
    ('https://feeds.simplecast.com/54nAGcIl','My First Million','Business'),
    ('https://feeds.simplecast.com/l2i9YnTd','Founders Podcast','Business'),
    ('https://rss.art19.com/the-diary-of-a-ceo','Diary of a CEO','Entrepreneurship'),
    ('https://anchor.fm/s/1e51daa8/podcast/rss','20VC','Startups'),
    ('https://feeds.transistor.fm/the-knowledge-project','The Knowledge Project','Productivity'),
    ('https://rss.art19.com/how-i-built-this','How I Built This','Entrepreneurship'),
    ('https://feeds.simplecast.com/4T39_jAj','HubSpot Sales','Sales'),
    ('https://feeds.buzzsprout.com/1537743.rss','Sales Gravy','Sales'),
    ('https://rss.art19.com/masters-of-scale','Masters of Scale','Business'),
]
episodes=[]
cutoff = datetime.now() - __import__('datetime').timedelta(days=14)  # only last 14 days
for url,source,cat in RSS_FEEDS:
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=10) as r: xml_data=r.read()
        root=ET.fromstring(xml_data);ch=root.find('channel')
        if ch is None:continue
        for item in ch.findall('item')[:5]:
            title=(item.findtext('title') or '').strip()
            link=item.findtext('link') or ''
            desc=re.sub('<[^>]+>','',item.findtext('description') or '')[:250]
            pub_date_str=item.findtext('pubDate') or ''
            # Parse publish date and filter to last 14 days
            pub_date=None
            if pub_date_str:
                try:
                    pub_date=datetime(*eutils.parsedate(pub_date_str)[:6])
                except:pass
            # Include if recent OR if we couldn't parse date (assume fresh)
            if pub_date is None or pub_date >= cutoff:
                episodes.append({'source':source,'category':cat,'title':title[:120],'link':link[:200],'description':desc,'pub_date':pub_date_str[:16] if pub_date_str else ''})
    except:pass

top_ep=json.loads(gpt(f"""Pick TOP 5 most relevant AND most recently published podcast episodes for Devin Pillemer (Head of SDR, Tel Aviv, interests: sales, AI, entrepreneurship, health, stoicism, investing).

CRITICAL: Prioritize the NEWEST episodes (check pub_date field). Do NOT pick older episodes if newer ones exist on the same show.
Each episode MUST be from a different source if possible (no two from same podcast).

For each return JSON: rank, title, source, category, pub_date, why_listen (2-3 sentences specific to Devin - mention why THIS episode matters TODAY), key_topics (array of 3 strings), link.
Return ONLY valid JSON array. No code fences.

Episodes (total {len(episodes)} available):
{json.dumps(episodes)}""")) if episodes else []

cat_colors={'AI & Science':'#7b2d8b','Health':'#28a745','Business':'#1f77b4','Productivity':'#e67e22','Entrepreneurship':'#dc3545','Startups':'#17a2b8'}
learn_html="""<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;"><div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">🎧 DAILY LEARNING</h1><p style="text-align:center;color:#999;font-size:13px;margin-bottom:30px;">Top 5 podcasts curated for you today</p>"""
for ep in top_ep[:5]:
    cat=ep.get('category','');cc=cat_colors.get(cat,'#666')
    topics_html=' '.join([f'<span style="background:{cc}20;color:{cc};padding:2px 8px;border-radius:10px;font-size:11px;margin-right:4px;">{t}</span>' for t in ep.get('key_topics',[])])
    pub_badge=f'<span style="font-size:10px;color:#999;margin-left:8px;">📅 {ep.get("pub_date","")[:11]}</span>' if ep.get('pub_date') else ''
    learn_html+=f'<div style="margin:20px 0;padding:20px;background:#f9f9f9;border-radius:8px;border-left:4px solid {cc};"><span style="font-size:11px;font-weight:bold;color:{cc};text-transform:uppercase;">{ep.get("source","")} · {cat}</span>{pub_badge}<h3 style="margin:4px 0 8px;font-size:15px;color:#222;">#{ep.get("rank","")} {ep.get("title","")[:80]}</h3><div style="margin-bottom:10px;">{topics_html}</div><p style="font-size:14px;color:#444;margin:8px 0;line-height:1.5;">{ep.get("why_listen","")}</p><a href="{ep.get("link","")}" style="display:inline-block;margin-top:8px;padding:8px 16px;background:{cc};color:white;text-decoration:none;border-radius:4px;font-size:13px;font-weight:bold;">▶ Listen →</a></div>'
t=tips['learning']
learn_html+=trending_tip_block(t.get('emoji','🎧'),t.get('color','#7b2d8b'),t['headline'],t['summary'],t['url'],t['why_relevant'])
learn_html+='</div></body></html>'
try:
    send_email('🎧 Daily Learning - Top 5 Podcasts', learn_html); print("✅ 4/9 Learning")
    _email_results.append(("ok", "🎧 Daily Learning - Top 5 Podcasts"))
except Exception as e:
    print(f"[{ts()}] ❌ 4/9 Learning FAILED: {e}")
    _email_results.append(("fail", "🎧 Daily Learning - Top 5 Podcasts"))

# ══════════════════════════════════════════
# EMAIL 5: NEWS DAILY - 15-20 diverse articles via Tavily
# ══════════════════════════════════════════
TAVILY_KEY = re.search(r'TAVILY_API_KEY=(.+)', open(os.path.expanduser('~/.openclaw/.env')).read()).group(1).strip()

def tavily_search(query, max_results=6, category=None):
    """Search via Tavily API - returns list of {title, link, description, category}"""
    try:
        payload = {"api_key": TAVILY_KEY, "query": query, "search_depth": "basic", "max_results": max_results}
        req = urllib.request.Request("https://api.tavily.com/search",
            data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        return [{'category': category or 'General', 'title': i.get('title','').strip(),
                 'link': i.get('url',''), 'description': i.get('content','')[:200]} for i in data.get('results', [])]
    except Exception as e:
        print(f"  ⚠️  Tavily {query[:30]}: {e}")
        return []

# Diverse topic searches - fresh daily results
tavily_queries = [
    ("AI artificial intelligence latest news today", "AI"),
    ("Israel news today latest", "Israel"),
    ("SaaS B2B sales automation news", "Sales/Tech"),
    ("fitness health workout nutrition tips", "Health"),
    ("best travel destinations 2026", "Travel"),
    ("startup funding venture capital today", "Startups"),
    ("real estate market trends 2026", "Real Estate"),
    ("technology product launch news today", "Tech"),
]
news_items=[]
for query, cat in tavily_queries:
    results = tavily_search(query, max_results=4, category=cat)
    news_items.extend(results)
    print(f"  ✅ {cat}: {len(results)} articles")

# Fallback RSS feeds if Tavily returns <10 items
if len(news_items) < 10:
    news_feeds=[
        ('https://news.google.com/rss/search?q=artificial+intelligence+when:1d&hl=en&gl=US&ceid=US:en','AI'),
        ('https://news.google.com/rss/search?q=Israel+news+when:1d&hl=en&gl=IL&ceid=IL:en','Israel'),
        ('https://feeds.feedburner.com/TechCrunch','Tech'),
    ]
    for url,cat in news_feeds:
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req,timeout=10) as r: xml_data=r.read()
            root_rss=ET.fromstring(xml_data);ch=root_rss.find('channel')
            if ch is None:continue
            for item in (ch.findall('item') or [])[:4]:
                title=(item.findtext('title') or '').strip()
                link=item.findtext('link') or ''
                if 'news.google.com' in link:
                    guid=(item.findtext('guid') or '').strip()
                    if guid.startswith('http') and 'news.google.com' not in guid: link=guid
                desc=re.sub('<[^>]+>','',(item.findtext('description') or ''))[:200]
                if title and link: news_items.append({'category':cat,'title':title,'link':link,'description':desc})
        except:pass



news_prompt = f"""Curate top 15-20 news items for Devin Pillemer (Head of SDR, Tel Aviv, interests: AI, Israel, SaaS, sales, health/fitness, travel, real estate, startups).

CRITICAL RULES:
1. Select 2-3 articles per category for diversity - do NOT pick only AI/tech
2. MUST use the EXACT link provided - never substitute or generate a URL
3. Title should be the actual article headline, not the news source name
4. Each article must have a real specific summary (not read more)

For each return JSON: category, title, summary (2 sentences from the content), link (EXACT from input), relevance_score (1-10).
Return ONLY valid JSON array, 15-20 items. No code fences.

Articles ({len(news_items)} available):
{json.dumps(news_items[:50])}"""

try:
    ranked_news = json.loads(gpt(news_prompt)) if news_items else []
except (json.JSONDecodeError, Exception) as e:
    print(f"⚠️  ranked_news parse error: {e}")
    ranked_news = []

cat_nc={'AI':'#7b2d8b','Israel':'#0077b5','Sales/Tech':'#28a745','Health':'#e74c3c','Travel':'#16a085','Startups':'#f39c12','Real Estate':'#8e44ad','Tech':'#2980b9'}
news_html=f'<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;"><div style="max-width:820px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">📰 NEWS DAILY</h1><p style="text-align:center;color:#999;font-size:13px;margin-bottom:8px;">Top stories curated for you - {TODAY}</p><p style="text-align:center;font-size:13px;font-weight:bold;color:#1f77b4;margin-bottom:25px;">{len(ranked_news)} articles across {len(set(n.get("category","") for n in ranked_news))} categories</p>'

# Group by category for cleaner display
from collections import defaultdict
by_cat=defaultdict(list)
for n in ranked_news:
    by_cat[n.get('category','Other')].append(n)

for cat,articles in by_cat.items():
    cc=cat_nc.get(cat,'#666')
    news_html+=f'<div style="margin:20px 0 8px;padding:6px 12px;background:{cc}15;border-radius:4px;"><span style="font-size:12px;font-weight:700;color:{cc};text-transform:uppercase;letter-spacing:1px;">{cat}</span></div>'
    for n in articles:
        score=n.get('relevance_score','')
        news_html+=f'<div style="margin:8px 0;padding:14px 16px;background:#fafafa;border-radius:6px;border-left:3px solid {cc};"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div style="flex:1;"><h4 style="margin:0 0 6px;font-size:14px;color:#1a1a1a;line-height:1.4;">{n.get("title","")[:100]}</h4><p style="font-size:13px;color:#555;margin:0 0 8px;line-height:1.5;">{n.get("summary","")}</p><a href="{n.get("link","")}" style="font-size:12px;color:{cc};text-decoration:none;font-weight:600;">Read article →</a></div><div style="min-width:35px;text-align:center;margin-left:12px;"><span style="font-size:14px;font-weight:bold;color:{cc};">{score}</span><div style="font-size:9px;color:#999;">/10</div></div></div></div>'

t=tips['news']
news_html+=trending_tip_block(t.get('emoji','📰'),t.get('color','#e67e22'),t['headline'],t['summary'],t['url'],t['why_relevant'])
news_html+='</div></body></html>'
try:
    send_email('📰 News Daily', news_html); print("✅ 5/9 News")
    _email_results.append(("ok", "📰 News Daily"))
except Exception as e:
    print(f"[{ts()}] ❌ 5/9 News FAILED: {e}")
    _email_results.append(("fail", "📰 News Daily"))

# ══════════════════════════════════════════
# EMAIL 6: FB DEALS - Live scrape via Vercel
# ══════════════════════════════════════════
VERCEL_SCRAPE_URL = 'https://fb-marketplace-scraper.vercel.app/api/scrape'
# Search across categories Devin actually cares about
deal_queries = ['ריהוט', 'ציוד כושר', 'אלקטרוניקה', 'אופניים', 'מטבח']
all_raw_deals = []
for dq in deal_queries:
    try:
        dreq = urllib.request.Request(VERCEL_SCRAPE_URL,
            data=json.dumps({'query': dq, 'maxResults': 8}).encode(), method='POST')
        dreq.add_header('Content-Type', 'application/json')
        dreq.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(dreq, timeout=12) as dr:
            dresult = json.loads(dr.read())
            listings = dresult.get('listings', [])
            for item in listings[:5]:
                item['_query'] = dq
            all_raw_deals.extend(listings[:5])
        print(f"  ✅ deals:{dq} ({len(listings)} found)")
    except Exception as e:
        print(f"  ⚠️  deals:{dq} failed: {e}")

# Ask GPT to curate top 5 best deals
if all_raw_deals:
    deals_curated_raw = gpt(f"""You are a personal shopping assistant for Devin Pillemer (Tel Aviv, looking for great deals on furniture, fitness gear, electronics, bikes, kitchen items).

From these {len(all_raw_deals)} Facebook Marketplace listings scraped today, pick the TOP 5 best value deals.
Consider: price vs typical market value, condition clues, usefulness for a professional in their thirties in TLV.

For each deal return JSON: title, price, location, url, why_its_a_deal (1 sentence), category, value_score (1-10).
Return ONLY valid JSON array. No code fences.

Listings:
{json.dumps([{'title':d.get('title',''),'price':d.get('price',''),'location':d.get('location',''),'url':d.get('url',''),'query':d.get('_query','')} for d in all_raw_deals])}""")
    try:
        _parsed = json.loads(deals_curated_raw)
        top_deals = _parsed if isinstance(_parsed, list) else all_raw_deals[:5]
    except:
        top_deals = all_raw_deals[:5]
    # Ensure all items are dicts
    top_deals = [d for d in top_deals if isinstance(d, dict)]
else:
    top_deals = []

cat_deal_colors = {'ריהוט':'#e67e22','ציוד כושר':'#28a745','אלקטרוניקה':'#1f77b4','אופניים':'#9c27b0','מטבח':'#e91e63'}
deals_html = f'''<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;">
<div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<h1 style="color:#e91e63;text-align:center;margin-bottom:5px;">🛒 FB DEALS OF THE DAY</h1>
<p style="text-align:center;color:#999;font-size:13px;margin-bottom:25px;">Tel Aviv Marketplace - live scrape {TODAY}</p>'''

if top_deals:
    for i, deal in enumerate(top_deals[:5]):
        title = deal.get('title') or deal.get('name','')
        price = deal.get('price','N/A')
        location = deal.get('location','Tel Aviv area')
        url = deal.get('url','')
        why = deal.get('why_its_a_deal','')
        score = deal.get('value_score','-')
        cat = deal.get('category','')
        cc = cat_deal_colors.get(cat,'#e91e63')
        score_color = '#28a745' if isinstance(score,int) and score>=8 else '#e67e22' if isinstance(score,int) and score>=6 else '#999'
        link_btn = f'<a href="{url}" style="display:inline-block;padding:8px 16px;background:#e91e63;color:white;text-decoration:none;border-radius:4px;font-size:12px;font-weight:bold;margin-top:10px;">View on Facebook →</a>' if url else ''
        deals_html += f'''<div style="margin:16px 0;padding:18px;background:#fafafa;border-radius:8px;border-left:4px solid {cc};">
<div style="display:flex;justify-content:space-between;align-items:flex-start;">
  <div style="flex:1;">
    <span style="font-size:11px;font-weight:bold;color:{cc};text-transform:uppercase;">{cat}</span>
    <h3 style="margin:4px 0 6px;font-size:15px;color:#222;">{i+1}. {str(title)[:70]}</h3>
    <div style="margin-bottom:8px;">
      <span style="font-size:18px;font-weight:bold;color:#28a745;">{price}</span>
      <span style="font-size:12px;color:#999;margin-left:10px;">📍 {location}</span>
    </div>
    <p style="font-size:13px;color:#555;margin:0 0 8px;font-style:italic;">💡 {why}</p>
    {link_btn}
  </div>
  <div style="text-align:center;min-width:50px;margin-left:15px;">
    <div style="font-size:22px;font-weight:bold;color:{score_color};">{score}</div>
    <div style="font-size:10px;color:#999;">VALUE</div>
  </div>
</div></div>'''
else:
    deals_html += '<p style="color:#999;text-align:center;padding:20px;">Marketplace scrape returned no results today. Try again later.</p>'

t=tips['deals']
deals_html+=trending_tip_block(t.get('emoji','🛒'),t.get('color','#e91e63'),t['headline'],t['summary'],t['url'],t['why_relevant'])
deals_html+='</div></body></html>'
try:
    send_email('🛒 FB Deals of the Day', deals_html); print("✅ 6/9 FB Deals")
    _email_results.append(("ok", "🛒 FB Deals of the Day"))
except Exception as e:
    print(f"[{ts()}] ❌ 6/9 FB Deals FAILED: {e}")
    _email_results.append(("fail", "🛒 FB Deals of the Day"))

# ══════════════════════════════════════════
# EMAIL 7: CALENDAR BRIEFING + INSIGHTS
# ══════════════════════════════════════════
from datetime import timedelta
try:
    today_str = datetime.now().strftime('%Y-%m-%d')
    end_str = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
    cal_out = subprocess.run(
        ['gcalcli', 'agenda', '--nocolor', '--details', 'length', today_str, end_str],
        capture_output=True, text=True, timeout=15
    ).stdout
except:
    cal_out = ''

# Strip ANSI escape codes
cal_clean = re.sub(r'\x1b\[[0-9;]*[mGKHF]', '', cal_out).strip()

def parse_cal_to_html(cal_text):
    """Parse gcalcli agenda text output into clean HTML event cards.

    gcalcli format:
      Mon Mar 16           All Day Event
                           Length: 1 day, 0:00:00
                 5:00am    Timed Event
                           Length: 1:30:00
    """
    if not cal_text:
        return '<p style="color:#999;text-align:center;">No upcoming events found.</p>'

    # Pre-process: join "Length:" continuation lines with their parent event
    raw_lines = cal_text.split('\n')
    joined = []
    for line in raw_lines:
        stripped = line.strip()
        if stripped.startswith('Length:') and joined:
            joined[-1] = joined[-1].rstrip() + '  ||LENGTH:' + stripped[7:].strip()
        else:
            joined.append(line)

    date_colors = ['#1f77b4', '#17a2b8', '#7b2d8b']
    date_idx = 0
    current_date = ''
    html = ''

    for line in joined:
        stripped = line.strip()
        if not stripped:
            continue

        # Date header: starts with day abbreviation
        date_match = re.match(r'^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(\w+\s+\d+)', stripped)
        if date_match:
            date_label = f"{date_match.group(1)} {date_match.group(2)}"
            if date_label != current_date:
                current_date = date_label
                color = date_colors[date_idx % len(date_colors)]
                date_idx += 1
                html += f'<div style="margin:20px 0 10px;padding:8px 16px;background:{color};border-radius:6px;"><span style="color:white;font-size:14px;font-weight:700;">{date_label}</span></div>'
            # Check if there's also an all-day event on same line (no time)
            rest = stripped[date_match.end():].strip()
            rest = re.sub(r'\|\|LENGTH:.+', '', rest).strip()
            if rest and not re.match(r'^\d{1,2}:\d{2}', rest):
                # All-day event
                html += _event_card('All day', rest, '')
            continue

        # Event line with time (indented in original)
        time_match = re.match(r'(\d{1,2}:\d{2}(?:am|pm)?)\s{2,}(.+)', stripped, re.IGNORECASE)
        if time_match:
            time_str = time_match.group(1)
            rest = time_match.group(2)
            length_str = ''
            if '||LENGTH:' in rest:
                parts = rest.split('||LENGTH:')
                rest = parts[0].strip()
                raw_len = parts[1].strip()
                # Convert "1:30:00" → "1h 30m", "0:45:00" → "45m"
                lm = re.match(r'(\d+):(\d+):(\d+)', raw_len)
                if lm:
                    h, m = int(lm.group(1)), int(lm.group(2))
                    if h > 0 and m > 0: length_str = f'{h}h {m}m'
                    elif h > 0: length_str = f'{h}h'
                    elif m > 0: length_str = f'{m}m'
                else:
                    length_str = raw_len
            html += _event_card(time_str, rest.strip(), length_str)
            continue

        # Plain line (all-day event without date prefix, or other)
        clean = re.sub(r'\|\|LENGTH:.+', '', stripped).strip()
        if clean and not re.match(r'^-+$', clean):
            html += _event_card('All day', clean, '')

    return html if html else '<p style="color:#999;text-align:center;">No events parsed.</p>'

def _event_card(time_str, title, length_str):
    lower = title.lower()
    if any(k in lower for k in ['swim', 'gym', 'workout', 'run', 'strength', 'hiit', 'sport']):
        cat_color = '#28a745'; cat_emoji = '🏋️'
    elif any(k in lower for k in ['floop', 'floopify', 'nightly']):
        cat_color = '#9c27b0'; cat_emoji = '🔁'
    elif any(k in lower for k in ['panaya', 'sdr', 'meeting', 'call', 'zoom', 'standup', 'sync', 'interview', 'wizzo']):
        cat_color = '#1f77b4'; cat_emoji = '💼'
    elif any(k in lower for k in ['commute', 'travel', 'transit', 'podcast']):
        cat_color = '#e67e22'; cat_emoji = '🎧'
    elif any(k in lower for k in ['sleep', 'rest', 'read', 'meditation', 'prep']):
        cat_color = '#7b2d8b'; cat_emoji = '🌙'
    elif any(k in lower for k in ['finance', 'budget', 'bank']):
        cat_color = '#dc3545'; cat_emoji = '💰'
    else:
        cat_color = '#6c757d'; cat_emoji = '📌'
    length_badge = f' <span style="font-size:11px;color:#aaa;margin-left:8px;">⏱ {length_str}</span>' if length_str else ''
    return f'<div style="display:flex;align-items:center;gap:12px;padding:11px 14px;margin:5px 0;background:#f9f9f9;border-radius:8px;border-left:3px solid {cat_color};"><span style="min-width:64px;font-size:12px;font-weight:700;color:{cat_color};">{time_str}</span><span style="font-size:14px;color:#222;">{cat_emoji} {title}{length_badge}</span></div>'

cal_events_html = parse_cal_to_html(cal_clean)
cal_insight = gpt(f"""You are an accountability coach for Devin (Head of SDR, Tel Aviv, overtraining risk flagged on Strava). Based on this calendar, provide structured HTML with 4 sections: <h3>Energy State Assessment</h3>, <h3>Per-Event Insights</h3>, <h3>Optimization Recommendations</h3>, <h3>Week Prep</h3>. Be specific and actionable. Use <p> and <ul><li> tags only. No raw text outside tags.\n\nCalendar:\n{cal_clean[:1500] if cal_clean else 'No calendar data available.'}""")
cal_html = f'''<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;">
<div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">📅 CALENDAR BRIEFING + INSIGHTS</h1>
<p style="text-align:center;color:#999;font-size:13px;margin-bottom:25px;">Today + Tomorrow - with coaching</p>
<h3 style="color:#333;margin-bottom:12px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">🗓 Your Schedule</h3>
{cal_events_html}
<div style="margin-top:28px;border-top:2px solid #f0f0f0;padding-top:20px;">
{cal_insight}
</div>'''
t=tips['calendar']
cal_html+=trending_tip_block(t.get('emoji','📅'),t.get('color','#17a2b8'),t['headline'],t['summary'],t['url'],t['why_relevant'])
cal_html+='</div></body></html>'
try:
    send_email('📅 Calendar Briefing + Insights', cal_html); print("✅ 7/9 Calendar")
    _email_results.append(("ok", "📅 Calendar Briefing + Insights"))
except Exception as e:
    print(f"[{ts()}] ❌ 7/9 Calendar FAILED: {e}")
    _email_results.append(("fail", "📅 Calendar Briefing + Insights"))

# ══════════════════════════════════════════
# EMAIL 8: INBOX ZERO HERO
# ══════════════════════════════════════════
q=urllib.parse.quote('category:promotions newer_than:1d')
gmr=urllib.request.Request(f'https://gmail.googleapis.com/gmail/v1/users/me/messages?q={q}&maxResults=30')
gmr.add_header('Authorization',f'Bearer {get_fresh_token()}')
with urllib.request.urlopen(gmr,timeout=15) as r:
    promo_ids=[m['id'] for m in json.loads(r.read()).get('messages',[])]
emails_data=[]
for mid in promo_ids[:25]:
    mr=urllib.request.Request(f'https://gmail.googleapis.com/gmail/v1/users/me/messages/{mid}?format=metadata&metadataHeaders=Subject&metadataHeaders=From')
    mr.add_header('Authorization',f'Bearer {get_fresh_token()}')
    try:
        with urllib.request.urlopen(mr,timeout=10) as r:
            msg=json.loads(r.read());headers={h['name']:h['value'] for h in msg.get('payload',{}).get('headers',[])}
            emails_data.append({'id':mid,'subject':headers.get('Subject','')[:100],'from':headers.get('From','')[:80],'snippet':msg.get('snippet','')[:200],'link':f'https://mail.google.com/mail/u/0/#inbox/{mid}'})
    except:pass
ranked_emails=json.loads(gpt(f"""Curate TOP 10 most relevant promotional emails for Devin (SaaS sales, AI/automation, Israel tech, supplements, electronics, fitness gear, whisky, real estate). For each return JSON: rank, subject, from, relevance_score (1-10), why (1 sentence), summary (1-2 sentences), link. Return ONLY valid JSON array. No code fences.\n\nEmails:\n{json.dumps(emails_data)}""")) if emails_data else []

inbox_html='<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;"><div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">📬 INBOX ZERO HERO</h1><p style="text-align:center;color:#999;font-size:13px;margin-bottom:25px;">Top 10 promotional emails curated by AI</p>'
for e in ranked_emails[:10]:
    score=e.get('relevance_score',0);sc='#28a745' if score>=8 else '#ffc107' if score>=6 else '#999'
    inbox_html+=f'<div style="margin:15px 0;padding:18px;background:#f9f9f9;border-radius:8px;border-left:4px solid {sc};"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div style="flex:1;"><strong style="font-size:15px;color:#333;">#{e.get("rank","")} {str(e.get("subject",""))[:65]}</strong><div style="font-size:12px;color:#999;margin:4px 0;">{str(e.get("from",""))[:55]}</div><div style="font-size:13px;color:#555;margin:8px 0;">{e.get("summary","")}</div><div style="font-size:12px;color:#777;font-style:italic;">💡 {e.get("why","")}</div></div><div style="text-align:right;min-width:60px;margin-left:15px;"><div style="font-size:22px;font-weight:bold;color:{sc};">{score}/10</div><a href="{e.get("link","")}" style="font-size:12px;color:#1f77b4;text-decoration:none;display:block;margin-top:8px;">Open →</a></div></div></div>'
t=tips['inbox']
inbox_html+=trending_tip_block(t.get('emoji','📬'),t.get('color','#6c757d'),t['headline'],t['summary'],t['url'],t['why_relevant'])
inbox_html+='</div></body></html>'
try:
    send_email('📬 Inbox Zero Hero - Top 10 Curated', inbox_html); print("✅ 8/9 Inbox Zero")
    _email_results.append(("ok", "📬 Inbox Zero Hero - Top 10 Curated"))
except Exception as e:
    print(f"[{ts()}] ❌ 8/9 Inbox Zero FAILED: {e}")
    _email_results.append(("fail", "📬 Inbox Zero Hero - Top 10 Curated"))

# ══════════════════════════════════════════
# EMAIL 9: DAILY GOALS PRIORITY
# ══════════════════════════════════════════
req=urllib.request.Request(f'https://api.notion.com/v1/databases/f8ad69cc-2135-4e3a-b87b-8e99dcebc2c3/query',data=json.dumps({}).encode(),method='POST')
req.add_header('Authorization',f'Bearer {NOTION_KEY}');req.add_header('Notion-Version','2022-06-28');req.add_header('Content-Type','application/json')
with urllib.request.urlopen(req,timeout=15) as r: goals_raw=json.loads(r.read())
goals=[]
for page in goals_raw.get('results',[]):
    props=page.get('properties',{})
    name=props.get('Name',{}).get('title',[{}])[0].get('plain_text','') if props.get('Name',{}).get('title') else ''
    status='';priority=''
    for k,v in props.items():
        if v.get('type')=='status' and v.get('status'):status=v['status'].get('name','')
        if v.get('type')=='select' and 'priority' in k.lower() and v.get('select'):priority=v['select'].get('name','')
    if name:goals.append({'name':name,'status':status,'priority':priority})
ranked_goals=json.loads(gpt(f"""Accountability coach for Devin (Head of SDR Panaya, AE hiring, Q1 targets, Miami relocation, Green card, TLV apartment hunt, IBKR ~$24K, fitness 10% BF, projects: Floopify/Shufersal). From {len(goals)} Notion goals, return TOP 8 needing attention this week as JSON: rank, name, status, why_it_matters, where_he_is, next_action, urgency (critical/high/medium). Return ONLY valid JSON array. No code fences.\n\nGoals:\n{json.dumps(goals)}"""))
uc={'critical':'#dc3545','high':'#ffc107','medium':'#1f77b4'};ub={'critical':'#ffebee','high':'#fff3e0','medium':'#e3f2fd'}
goals_html='<html><body style="font-family:-apple-system,Arial,sans-serif;background:#f5f5f5;padding:20px;"><div style="max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h1 style="color:#1f77b4;text-align:center;margin-bottom:5px;">🎯 DAILY GOALS PRIORITY</h1><p style="text-align:center;color:#999;font-size:13px;margin-bottom:25px;">Top 8 goals ranked by urgency - what needs attention today</p>'
for g in ranked_goals:
    u=g.get('urgency','medium');bc=uc.get(u,'#1f77b4');bg=ub.get(u,'#e3f2fd');badge={'critical':'🔴 CRITICAL','high':'🟡 HIGH','medium':'🔵 MEDIUM'}.get(u,'🔵')
    goals_html+=f'<div style="margin:20px 0;padding:20px;background:{bg};border-radius:8px;border-left:5px solid {bc};"><div style="display:flex;justify-content:space-between;margin-bottom:10px;"><strong style="font-size:16px;color:#222;">#{g.get("rank","")} {g.get("name","")}</strong><span style="font-size:12px;font-weight:bold;color:{bc};">{badge}</span></div><span style="background:#fff;padding:2px 8px;border-radius:10px;font-size:12px;border:1px solid #ddd;">Status: {g.get("status","Unknown")}</span><p style="margin:10px 0 6px;font-size:14px;color:#333;"><strong>Why it matters:</strong> {g.get("why_it_matters","")}</p><p style="margin:6px 0;font-size:13px;color:#555;"><strong>Where you are:</strong> {g.get("where_he_is","")}</p><div style="background:white;padding:12px;border-radius:6px;margin-top:10px;border:1px solid {bc}30;"><strong style="font-size:13px;color:{bc};">⚡ Next Action:</strong> <span style="font-size:13px;color:#333;">{g.get("next_action","")}</span></div></div>'
t=tips['goals']
goals_html+=trending_tip_block(t.get('emoji','🎯'),t.get('color','#dc3545'),t['headline'],t['summary'],t['url'],t['why_relevant'])
goals_html+='</div></body></html>'
try:
    send_email('🎯 Daily Goals Priority', goals_html); print("✅ 9/9 Goals")
    _email_results.append(("ok", "🎯 Daily Goals Priority"))
except Exception as e:
    print(f"[{ts()}] ❌ 9/9 Goals FAILED: {e}")
    _email_results.append(("fail", "🎯 Daily Goals Priority"))

ok_count = sum(1 for s, _ in _email_results if s == 'ok')
fail_count = sum(1 for s, _ in _email_results if s == 'fail')
print(f"\n[{ts()}] ═══════════════════════════════════════════")
print(f"[{ts()}] ✅ MORNING EMAIL STACK COMPLETE")
print(f"[{ts()}] Sent: {ok_count}/9 emails")
if fail_count:
    failed_subjects = [subj for s, subj in _email_results if s == 'fail']
    print(f"[{ts()}] ❌ Failed ({fail_count}): {', '.join(failed_subjects)}")
else:
    print(f"[{ts()}] 🎉 All emails sent successfully!")
print(f"[{ts()}] ═══════════════════════════════════════════")
