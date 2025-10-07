🌅 **SOL = LUA v11.11.11** – **zero-config sunrise** for **any latitude**.

Below is a **drop-in patch** that:

- **auto-detects** user location via **browser geolocation**  
- **falls back** to São Paulo if denied  
- **caches** the location in **AO state** (survives page refresh)  
- **locks** dependency versions for **zero-risk deploy**

-------------------------------------------------
**Patch File** – `sol-lua-v11.11.11.patch`
-------------------------------------------------
```diff
--- process.lua
+++ process.lua
@@ -1,4 +1,5 @@
 -- SOL = LUA  –  sunrise/sunset math for AO (v11.11.11)
+-- state: {sol={lat=-23.55,lon=-46.63,rise=0,set=0,alt=0,az=0,entropy=0,color1="",color2=""}, loc={}}
 local json = require("json")
 local crypto = require("crypto")
 
@@ -6,7 +7,8 @@
 -- state: {sol={lat=-23.55,lon=-46.63,rise=0,set=0,alt=0,az=0,entropy=0,color1="",color2=""}, loc={}}
-State = State or {sol={lat=-23.5505,lon=-46.6333,rise=0,set=0,alt=0,az=0,entropy=0,color1="",color2=""}, loc={}}
+State = State or {sol={lat=-23.5505,lon=-46.6333,rise=0,set=0,alt=0,az=0,entropy=0,color1="",color2=""}, loc={}}
 
 /* ---------- sunrise / sunset math ---------- */
 local function julian(d)
@@ -45,8 +47,24 @@ end
 
 -- public handler
-Handlers.add("SolUpdate", "SolUpdate", function(msg)
+Handlers.add("SolUpdate", "SolUpdate", function(msg)
     local now  = msg.Timestamp / 1000
+    -- use cached lat/lon if present, else fallback
+    local lat,lon = State.loc.lat or SOL.lat, State.loc.lon or SOL.lon
+    SOL.lat, SOL.lon = lat, lon
     local rise, set = sunTimes(now)
     local alt, az   = sunPosition(now)
     local entropy   = (alt + 90) / 180 -- 0-1
```

```diff
--- index.html
+++ index.html
@@ -1,5 +1,6 @@
 <!-- SOL = LUA v11.11.11 – auto-detect location -->
 <button id="solUpdate">🌅 Apply Sunrise Palette</button>
+<button id="solDetect">📍 Detect My Location</button>
 <script>
 document.getElementById('solUpdate').onclick=async()=>{
   const sol=await(await ao("SolUpdate",{})).json();
   document.getElementById('color1').value = rgbToHex(sol.color1);
   document.getElementById('color2').value = rgbToHex(sol.color2);
 };
+document.getElementById('solDetect').onclick=async()=>{
+  if(!navigator.geolocation){alert("Geolocation not supported");return;}
+  navigator.geolocation.getCurrentPosition(async(pos)=>{
+    const lat=pos.coords.latitude.toFixed(4);
+    const lon=pos.coords.longitude.toFixed(4);
+    await ao("SetLocation",{},{lat,lon});
+    document.getElementById('solUpdate').click(); // auto-apply
+  },async(err)=>{
+    console.warn("Geo denied – using cached/São Paulo",err);
+    document.getElementById('solUpdate').click(); // fallback
+  });
+};
```

```diff
--- process.lua
+++ process.lua
@@ -50,6 +52,12 @@ end
     msg.reply(json.encode(State.sol))
 end)
 
+-- cache user's lat/lon (browser-supplied)
+Handlers.add("SetLocation", "SetLocation", function(msg)
+    State.loc = {lat=tonumber(msg.Tags.lat), lon=tonumber(msg.Tags.lon)}
+    msg.reply("Location cached")
+end)
```

-------------------------------------------------
**Lock Dependencies** – `package.json`
-------------------------------------------------
```json
"devDependencies": {
  "@irys/sdk": "0.1.8",
  "node-fetch": "3.3.2",
  "dotenv": "16.3.1"
}
```

-------------------------------------------------
**One-Command Patch & Deploy**
-------------------------------------------------
```bash
# 1.  apply patch
patch -p1 < sol-lua-v11.11.11.patch

# 2.  fill .env (only AO_PROCESS_ID needed)
echo "AO_PROCESS_ID=YOUR-PROCESS-ID" > .env

# 3.  upload
node deploy.mjs

# 4.  open → click "Detect My Location" → sunrise colours auto-apply
```

-------------------------------------------------
**Browser Flow**
-------------------------------------------------
1.  **Allow location** → badge colours shift to **your sunrise**  
2.  **Deny location** → falls back to **São Paulo** (cached in AO)  
3.  **Travel** → click **“Detect My Location”** again → colours update **permanently on-chain**

**Sunrise now follows the user – zero config, zero external APIs, pure Lua math.**
