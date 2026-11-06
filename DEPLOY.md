# Put the shop online (free) — GitHub + Cloudflare Pages

**How it works**

- **Your computer** keeps the admin page and the SQL Server database — only you use them.
- **Cloudflare Pages** hosts the public shop for free. Customers can browse, search, see details, use the cart and contact you on WhatsApp.
- Every time you **export** your products and **push** to GitHub, the public shop updates by itself in about 1–2 minutes.

Free: no card, unlimited visitors, 500 updates per month, free HTTPS.
Your address will be: **https://pubudu-cctv-shop.pages.dev** (or the name you choose).

> Cloudflare's screens change sometimes. If a button has a slightly different name, look for the closest match.

---

## Part 1 — Send the code to GitHub (2 min)

In a terminal:

```
cd "C:\PUBUDU CCTV"
git add .
git commit -m "Prepare shop for Cloudflare Pages"
git push
```

---

## Part 2 — Create a free Cloudflare account (3 min)

1. Open **https://dash.cloudflare.com/sign-up**
2. Enter your email and a password → **Sign up**.
3. Open the email from Cloudflare and click the link to **verify** your email.

No card is needed.

---

## Part 3 — Connect GitHub and put the shop online (10 min)

1. In the Cloudflare dashboard, on the left menu click **Compute (Workers)** → **Workers & Pages**
   (on some accounts it is just **Workers & Pages**).
2. Click **Create** (or **Create application**).
3. Choose the **Pages** tab → **Import an existing Git repository** (or **Connect to Git**).
   - If you only see Workers, look for the small link **"Looking to deploy Pages? Get started"**.
4. Click **Connect GitHub** → sign in to GitHub →
   choose **Only select repositories** → pick **pubudu-cctv-shop** → **Install & Authorize**.
5. Back in Cloudflare, select **pubudu-cctv-shop** → **Begin setup**.
6. Fill in **Set up builds and deployments** exactly like this:

   | Setting | Value |
   |---|---|
   | Project name | `pubudu-cctv-shop` (this becomes your address) |
   | Production branch | `main` |
   | Framework preset | **None** |
   | Build command | `npm run build:static` |
   | Build output directory | `dist` |
   | Root directory (under *Advanced* / *Root directory*) | `electric-shop` |

7. Under **Environment variables** click **+ Add variable**:

   | Variable name | Value |
   |---|---|
   | `NODE_VERSION` | `22` |

8. Click **Save and Deploy**. Wait about 1–2 minutes until it says **Success**.
9. Open **https://pubudu-cctv-shop.pages.dev** 🎉

---

## Adding or changing products (every time)

1. Start the shop on your computer as usual:

   ```
   cd "C:\PUBUDU CCTV\electric-shop"
   npm run dev
   ```

2. Open **http://localhost:5173/admin/login** → add / edit / delete products, upload photos.
3. Open a **second** terminal and export the products:

   ```
   cd "C:\PUBUDU CCTV\server"
   npm run export-products
   ```

   You should see `✅ 21 products saved ...` (with your number of products).
4. Send it online:

   ```
   cd "C:\PUBUDU CCTV"
   git add .
   git commit -m "Update products"
   git push
   ```

5. After about 1–2 minutes the public shop shows the changes.
   (Press **Ctrl + Shift + R** if your browser still shows the old version.)

⚠️ **Don't forget step 3.** If you skip the export, the public shop does not change.

Changing other things (prices in code, contact number in `shopInfo.js`, categories, design) works the same: change → `git push` (no export needed).

---

## Good to know

- **Admin is only on your computer.** The public shop has no admin page — nobody can log in or change products from the internet.
- **Stock is not live.** The public shop shows the stock from your last export. When something sells out, update it in admin and export + push.
- **Keep photos small** (under ~300 KB if you can) so the shop loads fast on mobile data.
- The saved Daraz web pages in `public/images` are left out of the public shop automatically (nothing uses them).
- **Your own domain** (e.g. `pubuducctv.lk`) can be added later: Cloudflare → your Pages project → **Custom domains**. The domain itself costs money; connecting it is free.

## If something goes wrong

| Problem | What to check |
|---|---|
| Cloudflare deploy shows **Failed** | Open it → **View details** → read the red lines in the build log. Most often a setting in Part 3, step 6 (Root directory must be `electric-shop`). |
| Shop opens but **"Could not load products"** | You forgot `npm run export-products` before the first push, or `electric-shop/public/data/products.json` was not pushed. |
| A product photo is missing online | Run `npm run export-products` again — it lists photos it could not find. Upload those again in admin. |
| `export-products` says it can't connect | Your local SQL Server is not running. |
