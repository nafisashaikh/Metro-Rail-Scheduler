# Metro Rail Scheduler — Full Project Audit Report

---

## ✅ Build & Compilation

| Check | Result |
|---|---|
| `tsc --noEmit` (TypeScript strict check) | ✅ **PASS** — zero errors |
| `npm run build` (production bundle) | ✅ **PASS** — completes in ~6.5s |
| Bundle sizes (gzipped) | CSS: 27 KB · App JS: 56 KB · Charts: 113 KB · Maps: 43 KB |
| ESLint | ⚠️ **5 warnings, 0 errors** (see below) |

All code compiles perfectly and the bundle is highly optimized.

---

## ⚠️ Lint Warnings (Technical Debt)

| File | Line | Issue |
|---|---|---|
| `Header.tsx` | 208, 226 | `(user as any).employeeId` / `.department` |
| `SatelliteMap.tsx` | 105, 106, 122 | `(mapRef.current as any).streetLayer` / `.satelliteLayer` |

TypeScript checker passes these via the `as any` escape hatch, but they are design flaws:
- **Header.tsx**: It accepts either a `User` or a `PassengerUser`, but its prop is typed only as `User`, forcing an unsafe cast.
- **SatelliteMap.tsx**: The Leaflet map object is extended directly via `any` instead of proper TypeScript augmentation.

---

## 🔐 Authentication & Security — The Brutal Truth

### Staff Portal 
> [!CAUTION] 
> **Credentials are stored and compared in plaintext in source code.** 

Passwords (`admin123`, etc.) are hardcoded and checked as `===` plaintext strings. Even worse, the UI literally prints these credentials directly on the screen for anyone to use. There's no backend validation, just a simulated 600ms network layout.

### Passenger Portal 
> [!WARNING]
> **False Sense of Security.**

While you correctly use `crypto.subtle.digest('SHA-256')` to hash password inputs during login, **you still store the raw `passwordPlain` strings inside `PASSENGER_ACCOUNTS`**. The source code leaks the passwords, meaning anyone with access to the client bundle can see them. Hash comparison is useless if the plaintext is sitting right next to it!

---

## 🐛 6 Real Bugs Found in Logic & Architecture

1. **[CRITICAL] Journey Planner Doesn't Filter by Direction:** When a passenger looks up a train from `A` to `B`, the search returns trains going in **both directions**. The `toStation` is ignored logically (`trains` array just fetches all departures from the origin station).
2. **[HIGH] Leaflet Map Memory Leak:** When switching between Staff/Passenger or Metro/Railway sections, the component remounts but Leaflet isn't cleaned up. You end up with multiple Leaflet instances trying to attach to the same `div`, causing double-initialization errors in the console.
3. **[MEDIUM] Inaccurate Geographic Station Routes:** In `metroData.ts` Line 3 (Aqua Line), the station sequence jumps around geographically near BKC/Santacruz/Airport. Since your Leaflet map links stations sequentially, it draws weird zigzag lines instead of following actual routes.
4. **[LOW] DRY Violations:** `generateTrainHealth()` and `generateTrainCapacity()` are copy-pasted identically into both `metroData.ts` and `railwayData.ts`.
5. **[LOW] Alert Interval Race Conditions:** Alerts are generated every 90 seconds. If a user quickly toggles sections, stale closures could trigger wrong section alerts right before the interval clears.
6. **[LOW] package.json Configuration:** `react` is listed as both a direct `dependency` AND a `peerDependency`. As an application, peerDependencies should not be used here.

---

## 📋 Summary Scorecard

**Overall Score: 71/100**
Beautifully designed UI and great component structure, but severely lacks secure data practices and has some functional feature bugs that make it currently unfit for real-world usage. 

### Prioritized Fix List
1. Filter the train outputs in `PassengerJourneyPlanner` to consider the Destination.
2. Remove plaintext passwords; use pre-hashed values for validation.
3. Clean up the Leaflet map `useEffect` in `SatelliteMap.tsx` using `.remove()`.
4. Fix the `any` types in your components using Discriminated Unions.
