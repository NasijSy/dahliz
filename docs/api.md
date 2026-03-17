# Dahliz API

All endpoints are read-only, pre-rendered as static JSON files, and served under the `/api/v1/` path prefix.

## Base URL

```
https://dahliz.nasij.org/api/v1
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | [`/api/v1/profiles.json`](#get-apiv1profilesjson) | All profiles |
| GET | [`/api/v1/profiles/:username.json`](#get-apiv1profilesusernamejson) | Single profile |
| GET | [`/api/v1/cases.json`](#get-apiv1casesjson) | All cases |
| GET | [`/api/v1/cases/:slug.json`](#get-apiv1casesslugjson) | Single case |
| GET | [`/api/v1/stats.json`](#get-apiv1statsjson) | Aggregate statistics |

---

## GET /api/v1/profiles.json

Returns all profiles sorted by case count (descending), each enriched with a `caseCount` field.
Filtering by `classification` or `tags`, and alternative sort orders, can be applied client-side
using the fields present in every profile object.

### Response

```json
{
  "data": [
    {
      "username": "alexmouawad",
      "name": "Lutfallah (Alex) Mouawad",
      "type": "person",
      "classification": "reliable",
      "caseCount": 3,
      "dateAdded": "2026-02-26",
      "lastUpdated": "2026-02-26",
      "summary": "كوميدي سوري يقيم في فرنسا ويتناول الأحداث السياسية بطابع ساخر",
      "imagePath": "/media/profiles/alexmouawad/profile.jpg",
      "platformLinks": [
        {
          "platform": "facebook",
          "alias": "Lutfallah Mouawad",
          "url": "https://www.facebook.com/loutfallah.mouawad/"
        }
      ],
      "tags": []
    }
  ],
  "meta": {
    "total": 26,
    "byClassification": {
      "reliable": 8,
      "unreliable": 12,
      "disinformation": 6
    }
  }
}
```

### Field reference

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | Unique identifier used in URLs |
| `name` | string | Display name |
| `type` | `"person"` \| `"org"` \| `"anon"` \| `"bot"` | Whether the profile is an individual, an organisation, an anonymous account, or an automated bot |
| `classification` | `"reliable"` \| `"unreliable"` \| `"disinformation"` | Editorial reliability classification (see values below) |
| `caseCount` | number | Total number of cases this profile appears in |
| `dateAdded` | string \| null | ISO 8601 date the profile was added |
| `lastUpdated` | string \| null | ISO 8601 date of the last edit |
| `summary` | string \| null | Short description |
| `imagePath` | string \| null | Path to the profile image |
| `platformLinks` | array | Social platform links (see below) |
| `tags` | string[] | Behaviour tags, e.g. `"coordinated-amplification"`, `"fake-identity"` |

**`classification` values**

| Value | Meaning |
|-------|---------|
| `"reliable"` | Relatively reliable — limited errors |
| `"unreliable"` | Unreliable — repeatedly shares unverified rumours |
| `"disinformation"` | Misleading — intentional and systematic spread of false information |

**`platformLinks` item**

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `"twitter"` \| `"facebook"` \| `"youtube"` \| `"telegram"` \| `"instagram"` \| `"website"` | Social platform identifier |
| `alias` | string | Display name on that platform |
| `url` | string | Direct URL to the account |

### Example request

```js
const res = await fetch('https://dahliz.nasij.org/api/v1/profiles.json');
const { data, meta } = await res.json();

// Filter to unreliable profiles client-side
const unreliable = data.filter(p => p.classification === 'unreliable');

// Sort by name instead of caseCount
const byName = [...data].sort((a, b) =>
  (a.name ?? '').localeCompare(b.name ?? '', 'ar')
);
```

---

## GET /api/v1/profiles/:username.json

Returns the full profile record plus a lightweight list of every case the profile appears in.

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `username` | The profile's unique username |

### Response

```json
{
  "data": {
    "username": "alexmouawad",
    "name": "Lutfallah (Alex) Mouawad",
    "type": "person",
    "classification": "reliable",
    "caseCount": 3,
    "dateAdded": "2026-02-26",
    "lastUpdated": "2026-02-26",
    "summary": "كوميدي سوري يقيم في فرنسا ويتناول الأحداث السياسية بطابع ساخر",
    "imagePath": "/media/profiles/alexmouawad/profile.jpg",
    "platformLinks": [
      {
        "platform": "facebook",
        "alias": "Lutfallah Mouawad",
        "url": "https://www.facebook.com/loutfallah.mouawad/"
      }
    ],
    "tags": [],
    "cases": [
      {
        "slug": "aleppo-castle-strike",
        "title": "قصف طائرة في محيط قلعة حلب",
        "dateAdded": "2026-01-04",
        "type": "misinfo"
      }
    ]
  }
}
```

The top-level fields are identical to those in the profiles list. The additional `cases` array contains lightweight summaries; fetch `/api/v1/cases/:slug.json` to obtain full case details.

### Error

Returns `404` when the username does not exist:

```json
{ "message": "Profile not found" }
```

### Example request

```js
const res = await fetch('https://dahliz.nasij.org/api/v1/profiles/alexmouawad.json');
if (!res.ok) throw new Error(`Profile not found`);
const { data } = await res.json();
console.log(data.name, '—', data.caseCount, 'cases');
```

---

## GET /api/v1/cases.json

Returns all cases. Each entry includes a lightweight `profiles` array with the username and
classification of every involved profile, so that clients can filter by classification without
an extra request. `meta.byType` counts cases per type across the full dataset.

### Response

```json
{
  "data": [
    {
      "slug": "aleppo-castle-strike",
      "title": "قصف طائرة في محيط قلعة حلب",
      "dateAdded": "2026-01-04",
      "type": "misinfo",
      "profileCount": 1,
      "profiles": [
        {
          "username": "ronahitv",
          "classification": "disinformation"
        }
      ]
    }
  ],
  "meta": {
    "total": 69,
    "byType": {
      "misinfo": 45,
      "rumor": 14,
      "defamation": 10
    }
  }
}
```

### Field reference

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Unique identifier used in URLs |
| `title` | string | Case title |
| `dateAdded` | string \| null | ISO 8601 date the case was added |
| `type` | `"misinfo"` \| `"rumor"` \| `"hate"` \| `"fraud"` \| `"violence"` \| `"defamation"` | Type of case |
| `profileCount` | number | Number of profiles involved |
| `profiles` | array | Lightweight profile references (username + classification) |

**`type` values**

| Value | Meaning |
|-------|---------|
| `"misinfo"` | Misinformation — false or misleading content |
| `"rumor"` | Unverified rumour spread without fact-checking |
| `"hate"` | Incitement or hate speech |
| `"fraud"` | Scam or deceptive content |
| `"violence"` | Content promoting or depicting violence |
| `"defamation"` | Defamatory content targeting individuals or groups |

### Example request

```js
const res = await fetch('https://dahliz.nasij.org/api/v1/cases.json');
const { data, meta } = await res.json();

// Filter to misinfo cases involving an unreliable profile
const filtered = data.filter(c =>
  c.type === 'misinfo' &&
  c.profiles.some(p => p.classification === 'unreliable')
);

console.log(`${meta.total} cases total`);
```

---

## GET /api/v1/cases/:slug.json

Returns the full case record including every profile involvement with its sources and analysis links.

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `slug` | The case's unique slug |

### Response

```json
{
  "data": {
    "slug": "aleppo-castle-strike",
    "title": "قصف طائرة في محيط قلعة حلب",
    "dateAdded": "2026-01-04",
    "type": "misinfo",
    "profileCount": 1,
    "profiles": [
      {
        "username": "ronahitv",
        "name": "Ronahi TV",
        "classification": "disinformation",
        "imagePath": "/media/profiles/ronahitv/profile.jpg",
        "description": "ادعت القناة أن أعمدة الدخان...",
        "source": [
          {
            "url": "https://www.facebook.com/reel/25155471304135218",
            "archiveURL": "https://archive.ph/vClXf",
            "date": "2026-01-02",
            "label": "",
            "mediaPath": "/media/cases/aleppo-castle-strike/ronahitv-source.jpg"
          }
        ],
        "analysis": [
          {
            "url": "https://www.verify-sy.com/ar/factcheck/aleppo-citadel-airstrike",
            "archiveURL": "https://web.archive.org/web/...",
            "date": "2026-01-02",
            "label": "",
            "mediaPath": "/media/cases/aleppo-castle-strike/fact.jpg"
          }
        ]
      }
    ]
  }
}
```

### Field reference — profile involvement

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | Profile identifier |
| `name` | string \| null | Display name |
| `classification` | string \| null | Editorial classification |
| `imagePath` | string \| null | Path to the profile image |
| `description` | string \| null | Description of this profile's involvement |
| `source` | array | Original content items that were checked |
| `analysis` | array | Fact-check or analysis articles |

**`source` / `analysis` item** — all fields are optional

| Field | Type | Description |
|-------|------|-------------|
| `url` | string \| null | Direct URL to the content |
| `archiveURL` | string \| null | Archive copy URL |
| `date` | string \| null | ISO 8601 date |
| `label` | string \| null | Optional display label |
| `mediaPath` | string \| null | Path to the cached media file |

Media rendering type is inferred by clients from the `mediaPath` extension.

### Error

Returns `404` when the slug does not exist:

```json
{ "message": "Case not found" }
```

### Example request

```js
const res = await fetch('https://dahliz.nasij.org/api/v1/cases/aleppo-castle-strike.json');
if (!res.ok) throw new Error('Case not found');
const { data } = await res.json();

for (const profile of data.profiles) {
  console.log(profile.username, '—', profile.source.length, 'source(s)');
}
```

---

## GET /api/v1/stats.json

Returns aggregate counts useful for dashboards and overview displays.

### Response

```json
{
  "data": {
    "profiles": {
      "total": 26,
      "byClassification": {
        "reliable": 8,
        "unreliable": 12,
        "disinformation": 6
      },
      "byType": {
        "person": 15,
        "org": 8,
        "anon": 3
      }
    },
    "cases": {
      "total": 69,
      "byType": {
        "misinfo": 45,
        "rumor": 14,
        "defamation": 10
      }
    }
  }
}
```

### Example request

```js
const res = await fetch('https://dahliz.nasij.org/api/v1/stats.json');
const { data } = await res.json();
console.log(`Tracking ${data.profiles.total} profiles across ${data.cases.total} cases`);
```

---

## Caching

All responses include `Cache-Control` headers. The values below are defaults; a CDN or edge
layer may serve a cached copy within these windows.

| Endpoint | `max-age` (browser) | `s-maxage` (edge) | `stale-while-revalidate` |
|----------|--------------------|--------------------|--------------------------|
| `/api/v1/profiles.json` | 5 min | 1 hour | 24 hours |
| `/api/v1/profiles/:username.json` | 10 min | 24 hours | 7 days |
| `/api/v1/cases.json` | 5 min | 1 hour | 24 hours |
| `/api/v1/cases/:slug.json` | 10 min | 24 hours | 7 days |
| `/api/v1/stats.json` | 5 min | 1 hour | 24 hours |

To always receive fresh data during development, append a cache-busting query string or set
`Cache-Control: no-cache` on the request.
