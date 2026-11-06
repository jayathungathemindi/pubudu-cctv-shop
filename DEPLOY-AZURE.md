# Put the shop online on Azure (not used now — see DEPLOY.md for Cloudflare Pages)

Follow the parts in order. It takes about 1 hour the first time.
After that, every `git push` updates the live shop by itself.

> Azure's screens change sometimes. If a button has a slightly different name, look for the closest match.

---

## Part 1 — Create the Azure account (10 min)

1. Go to **https://azure.microsoft.com/free** and click **Start free** / **Try Azure for free**.
2. Sign in with a Microsoft account (or create one).
3. Enter your phone number and **card** (only to check who you are — the free plans below do not charge it).

### Set a $1 budget alert (so you are emailed if anything ever costs money)
1. In the Azure Portal (**https://portal.azure.com**) search **Cost Management** → **Budgets** → **+ Add**.
2. Amount: **1** (USD) → Next → alert at **100%** → enter your email → **Create**.

---

## Part 2 — Create the free database (10 min)

1. In the Portal search **Azure SQL** → **+ Create** → **SQL databases: Single database** → **Create**.
2. At the top, if you see **"Want to try Azure SQL Database for free?" → click Apply offer**. ✅ This is the free database.
3. **Basics** tab:
   - Resource group: **Create new** → `pubudu-shop`
   - Database name: `ElectricShop`
   - Server: **Create new**
     - Server name: e.g. `pubudu-cctv-sql` (must be unique — add numbers if taken)
     - Location: **Southeast Asia** or **Central India** (closest to Sri Lanka)
     - Authentication: **Use SQL authentication**
     - Server admin login: e.g. `shopadmin`
     - Password: a strong password — **write it down**
   - ⚠️ **Behavior when free limit reached:** choose **"Auto-pause the database until next month"**
     (NOT "Continue using database for additional charges" — that one costs money)
4. **Networking** tab:
   - Connectivity method: **Public endpoint**
   - **Allow Azure services and resources to access this server: Yes**
   - **Add current client IP address: Yes**
5. **Review + create** → **Create**. Wait until it says *Deployment complete*.

Your database server address is: `pubudu-cctv-sql.database.windows.net`
(your server name + `.database.windows.net`)

---

## Part 3 — Copy your products to Azure (5 min)

1. Open `server/.env` on your computer and add these 4 lines at the bottom (use your own values from Part 2):

   ```
   AZURE_DB_SERVER=pubudu-cctv-sql.database.windows.net
   AZURE_DB_DATABASE=ElectricShop
   AZURE_DB_USER=shopadmin
   AZURE_DB_PASSWORD=your-database-password
   ```

   (`.env` is never uploaded to GitHub, so the password stays on your computer.)

2. Make sure your local SQL Server is running, then in a terminal:

   ```
   cd "C:\PUBUDU CCTV\server"
   npm run copy-to-azure
   ```

3. You should see:

   ```
   Products: 21 rows copied
   Admins: 1 rows copied
   ProductSpecs: 36 rows copied
   ProductImages: 39 rows copied
   ✅ Done! Your shop data is now on Azure.
   ```

   Your admin username and password are copied too — you log in online with the same ones.

**If it says it can't connect:** your internet IP may have changed. In the Portal open your SQL **server** → **Networking** → **+ Add your client IPv4 address** → **Save**, then try again.

---

## Part 4 — Create the free Web App (10 min)

1. In the Portal search **App Services** → **+ Create** → **Web App**.
2. **Basics** tab:
   - Resource group: `pubudu-shop` (the same one)
   - Name: `pubudu-cctv-shop` (must be unique — if taken, pick another, e.g. `pubudu-cctv-shop-lk`)
     → this becomes your address: `https://<name>.azurewebsites.net`
   - Publish: **Code**
   - Runtime stack: **Node 22 LTS**
   - Operating System: **Linux**
   - Region: the **same** region as the database
   - Pricing plan: **Create new** → ⚠️ click **Explore pricing plans** / **Change size** and choose **Free F1**
     (Azure often picks a paid plan by default — make sure it says **Free F1**)
     If Free F1 is not offered in that region, try another nearby region.
3. **Deployment** tab: leave **Continuous deployment: Disable** (GitHub does this for us).
4. **Review + create** → **Create**.

**If your Web App name is not `pubudu-cctv-shop`:** open `.github/workflows/deploy-azure.yml` and change
`AZURE_WEBAPP_NAME: pubudu-cctv-shop` to your name.

---

## Part 5 — Give the Web App its settings (5 min)

1. Open your Web App → **Settings** → **Environment variables** → **App settings** tab.
2. Click **+ Add** for each of these (Name → Value):

   | Name | Value |
   |---|---|
   | `DB_SERVER` | `pubudu-cctv-sql.database.windows.net` |
   | `DB_DATABASE` | `ElectricShop` |
   | `DB_USER` | your database login (e.g. `shopadmin`) |
   | `DB_PASSWORD` | your database password |
   | `DB_ENCRYPT` | `true` |
   | `JWT_SECRET` | a long random text (see below) |
   | `UPLOAD_DIR` | `/home/uploads` |

   Make a random `JWT_SECRET` by running this on your computer and copying the result:

   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Do **not** add `PORT` — Azure sets it by itself.
3. Click **Apply** → **Confirm**.
4. Go to **Settings** → **Configuration** → **General settings**:
   - **Startup Command:** `npm start`
   - **SCM Basic Auth Publishing Credentials:** **On**
   - Click **Save** → **Continue**.

---

## Part 6 — Connect GitHub to Azure (5 min)

1. Web App → **Overview** → **Download publish profile**. A file downloads.
2. Open that file in Notepad and copy **everything**.
3. Go to **https://github.com/jayathungathemindi/pubudu-cctv-shop** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Secret: paste the whole file
   - **Add secret**
4. **Delete the downloaded file** from your computer (it works like a password).

---

## Part 7 — Put it online

1. Send the code to GitHub:

   ```
   cd "C:\PUBUDU CCTV"
   git add .
   git commit -m "Prepare shop for Azure"
   git push
   ```

2. On GitHub open the **Actions** tab → **Deploy to Azure**. Wait until it shows a green ✅ (about 3–5 minutes).
3. Open **https://pubudu-cctv-shop.azurewebsites.net** (your Web App name).
   The first visit can take up to 1 minute while Azure wakes up.
4. Admin: **https://pubudu-cctv-shop.azurewebsites.net/admin/login** — same username and password as on your computer.

🎉 Your shop is public.

---

## Updating the shop later

Change the code on your computer → test with `npm run dev` → then:

```
git add .
git commit -m "what you changed"
git push
```

GitHub puts the new version online in about 3–5 minutes.

---

## Important to know

- **Two separate databases now.** Products you add on the **online** admin are only online. Products you add on your **computer** (`localhost`) are only on your computer. Use the **online admin** for the real shop.
- **Photos uploaded online** are kept on Azure in `/home/uploads`. To back them up: Web App → **Advanced Tools** → **Go** → **File Manager** (or **Bash**) → `/home/uploads`.
- **Sleeping:** with no visitors for a while, the site and database sleep. The first visitor after that waits up to ~1 minute.
- **Free limits:** website 60 CPU minutes/day and about 165 MB/day sent to visitors; database about 50 awake hours/month. When a limit is reached the site pauses — it does **not** charge you (because of the choices in Parts 2 and 4).
- **Keep photos small** (under ~300 KB) so the daily limit lasts longer.

## If something goes wrong

| Problem | What to check |
|---|---|
| GitHub Actions shows a red ❌ | Click it and read the red step. Most often: the secret name in Part 6, or the Web App name in the workflow file. |
| Site says "Application Error" | Web App → **Log stream** — read the last red lines. |
| "Could not load products" | Wait 1 minute and refresh (database waking up). If it continues: check the settings in Part 5 and **Allow Azure services = Yes** in Part 2. |
| Admin login says "Server error" | `JWT_SECRET` is missing in Part 5. |
| Site stopped for the day | You reached the free daily limit — it comes back the next day. |
