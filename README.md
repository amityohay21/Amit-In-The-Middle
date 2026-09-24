# MeetMid

אפליקציית ווב למציאת נקודת מפגש אופטימלית: 2–4 כתובות → רשימת בתי קפה / מסעדות / ברים שממזערים את זמן הנסיעה (Minimax או Sum of Times).

כל קריאות Google Maps מתבצעות **רק מהשרת**. מפתח ה-API לא נחשף ללקוח.

## דרישות

- Node.js 18+ (כולל `npm`)
- מפתח [Google Maps Platform](https://console.cloud.google.com/) עם:
  - Geocoding API
  - Places API
  - Distance Matrix API

## התקנה

```bash
cd server
npm install
copy .env.example .env
# ערוך את server/.env והדבק את GOOGLE_MAPS_API_KEY

cd ../client
npm install
```

## הרצה

טרמינל 1 — שרת:

```bash
cd server
npm run dev
```

השרת מאזין בברירת מחדל על `http://localhost:3001`.

טרמינל 2 — לקוח:

```bash
cd client
npm run dev
```

Vite רץ על `http://localhost:5173` ומעביר `/api` לשרת (proxy).

## API

`POST /api/search`

```json
{
  "addresses": ["תל אביב", "רמת גן"],
  "optimizationMode": "minimax"
}
```

`optimizationMode`: `"minimax"` | `"sum"`.
