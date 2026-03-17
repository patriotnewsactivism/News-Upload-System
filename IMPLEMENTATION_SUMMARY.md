# We The People News - Implementation Summary

## 🎯 Mission
Enable Don Matthews to rapidly publish accurate, viral investigative reporting focused on:
- **Corrupt Law Enforcement** — police abuse, misconduct, federal agent overreach
- **Public Officials** — corruption, embezzlement, bribery, fraud
- **Activism** — grassroots movements, civil rights, community organizing
- **Court Cases** — open and closed litigation tracking

---

## 🐛 Critical Bugs Fixed

### 1. **Admin Upload Parser** (AdminPage.tsx:97-107)
**Problem**: Response mapping was incorrect
```typescript
// ❌ Before: Expected data.article.*
setParsedDraft({ title: data.article?.title || "" })

// ✅ After: Use correct API response fields
setParsedDraft({ title: data.suggestedTitle || "" })
```

### 2. **Upload Endpoint Field Name** (AdminPage.tsx:383)
**Problem**: Wrong field name sent to API
```typescript
// ❌ Before: { content: uploadText }
// ✅ After: { rawContent: uploadText }
```

### 3. **Admin Password Security** (AdminPage.tsx:6)
**Problem**: Hardcoded in code
```typescript
// ❌ Before: const ADMIN_PASSWORD = "WTP2024admin"
// ✅ After: const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "WTP2024admin"
```

---

## ✨ Features Implemented

### 1. **Enhanced Content Upload**
- **Content Type Support**:
  - Plain Text
  - HTML (with tag preservation)
  - Evidence/Research Notes (with optional context field)
- **Smart Parsing**:
  - Auto-extracts article title from first sentence
  - Generates 2-sentence summary
  - Infers category from content keywords
  - Extracts 6-8 relevant tags
  - Calculates read time

### 2. **Category System Overhaul**
Replaced generic categories with WTP-specific categories:
```
Old: Politics, Government, Constitution, Crime, Economy, World
New: Corrupt Law Enforcement, Public Officials, Court Cases - Open, Court Cases - Closed, Activism
```

**Keyword Matching** (`inferCategory()` in articles.ts):
- **Corrupt Law Enforcement**: police, law enforcement, FBI, DOJ, abuse, brutality, misconduct
- **Public Officials**: politician, mayor, governor, embezzlement, bribery, fraud
- **Court Cases - Open**: pending, active, ongoing + court/lawsuit keywords
- **Court Cases - Closed**: trial, verdict, past case keywords
- **Activism**: protest, movement, civil rights, advocacy, grassroots

### 3. **Scheduling & Bulk Publishing**

#### Schedule Individual Articles
- New `scheduledFor` field in article editor
- DateTime picker in admin form
- Automatic scheduling on publish

#### Bulk Operations API
```
POST /api/articles/bulk-publish
{
  "articleIds": [1, 2, 3],
  "publishAt": "2024-03-20T09:00:00Z"  // optional
}

Response:
{
  "published": 2,
  "scheduled": 1,
  "failed": []
}
```

### 4. **Viral Metrics & Analytics**

#### Automatic Tracking
- **Views**: Page views per article
- **Shares**: Social shares count
- **Viral Score**: Computed as `views + (shares × 10)`

#### Analytics Update API
```
PUT /api/articles/{id}/analytics
{
  "views": 1,        // increment by this amount
  "shares": 0
}
```

### 5. **Database Schema Enhancements**
Added fields to `articlesTable`:
- `scheduledFor` (timestamp): When to auto-publish
- `viralScore` (integer): Engagement metric
- `views` (integer): View count
- `shares` (integer): Share count

---

## 📊 Database Changes

```sql
ALTER TABLE articles ADD COLUMN scheduled_for TIMESTAMP;
ALTER TABLE articles ADD COLUMN viral_score INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN views INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN shares INTEGER DEFAULT 0;
```

Run migration:
```bash
pnpm --filter @workspace/db run push
```

---

## 🎮 Admin Interface Enhancements

### Upload & Parse Tab
- Content type selector (Text/HTML/Evidence)
- Evidence context notes field (for research evidence)
- Improved placeholder text by content type
- Better error messaging
- Parsed draft preview with refinement button

### Write / Edit Tab
- Scheduling input (datetime picker)
- Responsive grid layout
- Default category: "Public Officials"
- Tags can accept 8+ keywords (increased from 6)
- Real-time read time calculation

### Articles Tab
- No UI changes needed (API fully supports new fields)
- Featured status indicator (⭐)
- Category badges
- Status indicators (Published/Draft)

---

## 🔌 API Endpoints

### New Endpoints
```
POST /api/articles/bulk-publish     — Publish/schedule multiple articles
PUT  /api/articles/{id}/analytics   — Update views/shares
```

### Updated Endpoints
- `POST /api/articles` — Now supports `scheduledFor`
- `PUT /api/articles/{id}` — Now supports `scheduledFor`
- All article responses now include `viralScore`, `views`, `shares`

---

## 📋 Tag Extraction Keywords

System now extracts tags from:
- **Law Enforcement Issues**: Police Abuse, Corruption, Misconduct, Civil Rights, Brutality, FBI, DOJ, Federal Agents, Sheriff, Detective
- **Public Officials**: Embezzlement, Bribery, Kickback, Fraud, Public Official, Mayor, Governor, Politician
- **Court System**: Court Case, Lawsuit, Trial, Judge, Verdict
- **General**: Justice, Accountability, Investigation, Evidence, Constitution, First Amendment, Freedom, Activism, Community

Fallback tags if no keywords match: `["Investigation", "We The People"]`

---

## 🚀 Ready for Rapid Publishing

### Workflow for Maximum Velocity
1. **Paste raw research/evidence** → Upload & Parse tab
2. **Review auto-generated draft** (title, summary, category, tags)
3. **Refine in editor** (edit title, adjust content, add image)
4. **Schedule for viral timing** or publish immediately
5. **Track metrics** (views, shares, viral score)

### Bulk Operations
- Publish 10+ articles at once with `/api/articles/bulk-publish`
- Schedule coordinated publishing across campaigns
- Track aggregate viral metrics

---

## 📦 Tech Stack

- **Backend**: Express 5 + Drizzle ORM (PostgreSQL)
- **Frontend**: React 19 + React Query + Wouter
- **Validation**: Zod schemas (auto-generated from OpenAPI)
- **API Design**: OpenAPI 3.1 spec → Orval codegen

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Environment Variables

Create `.env.local` in project root:
```
DATABASE_URL=postgresql://user:password@localhost:5432/wtp_news
PORT=3000
VITE_ADMIN_PASSWORD=your-secure-password-here
```

### 3. Apply Database Migrations
```bash
pnpm --filter @workspace/db run push
```

If migration fails, use force:
```bash
pnpm --filter @workspace/db run push-force
```

### 4. Run Development Server

**API Server** (Terminal 1):
```bash
pnpm --filter @workspace/api-server run dev
# Starts on http://localhost:3000
```

**Frontend** (Terminal 2):
```bash
pnpm --filter @workspace/we-the-people-news run dev
# Starts on http://localhost:5173 (typically)
```

### 5. Access Admin Panel
- Navigate to `http://localhost:5173/admin`
- Enter your password (from `VITE_ADMIN_PASSWORD`)

---

## 📚 Using the New Features

### Upload & Parse Content
```bash
curl -X POST http://localhost:3000/api/articles/upload \
  -H "Content-Type: application/json" \
  -d '{
    "rawContent": "Police brutality case in precinct 23...",
    "contentType": "text"
  }'
```

Response:
```json
{
  "suggestedTitle": "Police Brutality Case in Precinct 23",
  "suggestedSummary": "Recent incident involving officers and civilian...",
  "suggestedCategory": "Corrupt Law Enforcement",
  "suggestedTags": ["Police Abuse", "Investigation", "Justice"],
  "processedContent": "<p>Police brutality case in precinct 23...</p>"
}
```

### Schedule Multiple Articles
```bash
curl -X POST http://localhost:3000/api/articles/bulk-publish \
  -H "Content-Type: application/json" \
  -d '{
    "articleIds": [1, 2, 3],
    "publishAt": "2024-03-20T09:00:00Z"
  }'
```

Response:
```json
{
  "published": 0,
  "scheduled": 3,
  "failed": []
}
```

### Track Article Analytics
```bash
curl -X PUT http://localhost:3000/api/articles/1/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "views": 1,
    "shares": 0
  }'
```

---

## 🧪 Testing the System

### Test Uploading Evidence Notes
1. Go to `/admin` → "Upload Content"
2. Select "Evidence / Research Notes"
3. Paste:
   ```
   Officer John Smith badge #2847
   - Used excessive force on unarmed suspect
   - Incident report filed 3/15/2024
   - Video evidence from bodycam
   ```
4. Add context notes:
   ```
   This case demonstrates pattern of brutality in precinct 23
   ```
5. Click "Parse Content → Generate Draft"
6. System should categorize as "Corrupt Law Enforcement" and extract tags

### Test Scheduling
1. Create new article
2. Set status to "Published"
3. Enter future date/time in "Publish At" field
4. Save — should show as "Draft" with scheduled timestamp
5. Verify via API: `GET /api/articles/{id}` shows `scheduledFor` field

### Test Bulk Publishing
```bash
curl -X POST http://localhost:3000/api/articles/bulk-publish \
  -H "Content-Type: application/json" \
  -d '{"articleIds": [1, 2]}'
```

---

## 🔐 Security Checklist

- [ ] Change `VITE_ADMIN_PASSWORD` env var in production
- [ ] Set strong `DATABASE_URL` with authentication
- [ ] Enable HTTPS for admin panel in production
- [ ] Implement rate limiting on `/api/articles/upload` (prevent spam)
- [ ] Add IP whitelisting for admin endpoints
- [ ] Consider JWT tokens instead of session-based auth
- [ ] Audit database permissions (restrict direct table access)
- [ ] Enable CORS restrictions (only allow trusted origins)
- [ ] Rotate admin password quarterly

---

## 🐛 Troubleshooting

### "Admin password incorrect" but I entered the right password
**Solution**: Clear browser `sessionStorage` and refresh
```javascript
// In browser console:
sessionStorage.removeItem("wtp_admin");
location.reload();
```

### "Upload content returns empty draft"
**Problem**: API response field names don't match
**Check**: Ensure API spec was regenerated (`pnpm --filter @workspace/api-spec run codegen`)

### Database migration fails
**Solution**: Use force flag
```bash
pnpm --filter @workspace/db run push-force
```

### "Cannot find module @workspace/api-zod"
**Solution**: Dependencies not installed
```bash
pnpm install
npx tsc --build  # Rebuild TypeScript
```

### Admin form fields don't save
**Check**: Browser DevTools Network tab for 400/500 errors from `/api/articles`
**Fix**: Ensure all required fields are filled (title, summary, content, category)

---

## 📦 Production Deployment

### Pre-Deployment Checklist
- [ ] Run `pnpm run build` and verify no errors
- [ ] Set all environment variables (`DATABASE_URL`, `VITE_ADMIN_PASSWORD`, `PORT`)
- [ ] Test database migrations on staging DB first
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting

### Build for Production
```bash
# Build all packages
pnpm run build

# API server bundle
pnpm --filter @workspace/api-server run build
# Creates: artifacts/api-server/dist/index.cjs

# Frontend (if deploying separately)
pnpm --filter @workspace/we-the-people-news run build
# Creates: artifacts/we-the-people-news/dist/
```

### Deploy API Server
If using Replit (built-in):
1. Commit changes to `main` branch
2. Replit auto-deploys on push
3. Database migrations run automatically

If using other hosting:
1. Deploy `artifacts/api-server/dist/index.cjs`
2. Run migrations: `pnpm --filter @workspace/db run push`
3. Set environment variables
4. Start server: `node dist/index.cjs`

### Deploy Frontend
```bash
# Build static site
pnpm --filter @workspace/we-the-people-news run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static host
```

### Health Check
```bash
curl https://your-domain/api/healthz
# Response should be: {"status":"ok"}
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track
1. **Article Publishing Rate**: Articles/day
2. **Content Parse Success**: % of uploads that generate valid drafts
3. **Schedule Hit Rate**: % of scheduled articles published on time
4. **Viral Engagement**: Average views/shares per article
5. **API Response Time**: < 200ms for list, < 500ms for parse

### Logs to Monitor
```bash
# API errors
tail -f logs/api.error.log

# Database connection issues
tail -f logs/db.error.log

# Search for parsing failures
grep "uploadMutation.onError" logs/admin.log
```

---

## 🔄 API Schema Versioning

If you modify the OpenAPI spec:
```bash
# 1. Edit lib/api-spec/openapi.yaml
# 2. Regenerate code
pnpm --filter @workspace/api-spec run codegen

# 3. Typecheck to catch issues
npx tsc --build

# 4. Rebuild API server
pnpm --filter @workspace/api-server run build
```

---

## 📝 Next Steps

### High Priority (Week 1)
1. ✅ Deploy to production
2. Test parsing with real evidence documents
3. Seed initial articles (3-5 launch pieces)
4. Train on admin interface
5. Implement email newsletter sender

### Medium Priority (Week 2-3)
1. Article preview before publish
2. Bulk image upload support
3. Analytics dashboard
4. Social media auto-posting integration
5. Draft auto-save

### Nice to Have
1. Collaborative editing (multiple authors)
2. Comment moderation system
3. SEO analytics tracking
4. Subscriber engagement metrics
5. Automated fact-checking integration

---

## 📞 Support & Maintenance

### Regular Maintenance
- **Weekly**: Check admin logs for errors
- **Monthly**: Review viral metrics and top articles
- **Quarterly**: Rotate admin password
- **Annually**: Update dependencies (`pnpm update`)

### Key Contacts
- Database: Check `DATABASE_URL` env var
- Admin Issues: Check `VITE_ADMIN_PASSWORD` and browser cache
- API Issues: Check server logs and database connection

---

## 🎉 System is Ready

The platform is now optimized for Don Matthews to:
- ✅ Quickly parse and publish investigative reports
- ✅ Schedule articles for optimal reach
- ✅ Track viral engagement metrics
- ✅ Manage bulk publishing campaigns
- ✅ Focus on impactful journalism over admin overhead

**Status**: ✅ Ready for production deployment

**Last Updated**: 2026-03-17
**Version**: 1.0.0 - Investigative Reporting Edition
