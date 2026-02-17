# State of the Union Report

| Feature | Status | The Bug/Issue | Fix Required |
| :--- | :--- | :--- | :--- |
| **Auth** | 🟢 SOLID | `useAuth` hook is used consistently. Protected routes redirect correctly. | None. |
| **Dashboard** | 🟡 RISKY | Search/Filter logic is solid (client-side), BUT the page uses an **inline, legacy `ClubCard` component** instead of the shared one. | **Refactor**: Replace the inline `ClubCard` in `ClubsWebsite.tsx` with `src/components/club/ClubCard.tsx`. |
| **Club Interaction** | 🔴 BROKEN | **Crucial Data Disconnect**: `ClubsWebsite` inserts `profile_id`, but the DB/Hooks expect `user_id`. The "Join" button on the main dashboard likely **fails silently or corrupts data**. | **Standardize**: Use `useClubMembership` hook everywhere. Ensure `signatures` table uses `user_id`. |
| **Profile** | 🟡 RISKY | No check for **Student ID uniqueness**. Multiple users could potentially claim the same ID. | **Data Integrity**: Add a pre-check query or DB constraint for unique `student_id`. |
| **Admin** | 🟡 RISKY | Table joins on `user_id` (correct per migration), but this assumes data was inserted correctly (which the Dashboard fails to do). | **Schema Audit**: verify `signatures` table columns. Fix the upstream data insertion. |
| **Public** | 🟢 SOLID | `ParentVerify` defensive coding handled `profiles` join array/object differences well. | Ensure `signatures` table has `user_id` FK effectively linked to profiles. |

## Exhaustive Feature Audit (Add-on)

| Feature | Status | The Bug/Issue | Fix Required |
| :--- | :--- | :--- | :--- |
| **Chatbot** | 🟡 RISKY | Hardcoded API URL (`localhost:8000`). State is local and lost on reload. | **Config**: Use `VITE_API_URL`. **State**: Move to Context or LocalStorage persistence. |
| **Club Quiz** | 🔴 BROKEN | **Mock Save**: `saveQuizResults` only logs to console. It does **not** save to the database. | **Backend**: Implement `supabase.from('quiz_results').insert(...)`. |
| **Compare** | 🟡 RISKY | Functional, but relies on `meeting_details` which might be missing. Hard limit of 3 clubs. | **Robustness**: exact null checks for data. **UI**: Improve "full" state feedback. |
| **Smart/Enhanced Recs** | 🔴 DECEPTIVE | The "AI" service checks `localhost:8000`. If offline, it falls back to **static JSON data**, not the live DB. | **Integration**: Connect "Fallback" logic to Supabase, not `clubDiscoveryData.ts`. |
| **Events** | 🔴 BROKEN | **Prototype Only**. "Add Event" updates local state (clears on reload). No Supabase connection. | **Implementation**: Create `events` table in Supabase. Connect `useQuery` and `useMutation`. |
| **Calendar** | 🔴 BROKEN | **Prototype Only**. Uses hardcoded `eventsData` array. Week view is "Coming Soon". | **Integration**: Connect to the same `events` table as above. |
| **About Page** | 🟢 SOLID | Good use of `useSupabaseClubs` for dynamic stats. | None. |
| **Landing Page** | 🟢 SOLID | Good animations. Mock data in "Smart Discovery" card is acceptable for a landing page. | None. |
| **User Menu** | 🟢 SOLID | Works as expected. | None. |
| **Error Boundary** | 🟢 SOLID | Good production logging stub and dev logging. | None. |

## Top 5 Critical Fixes

1.  **Stop the Bleeding (Data Fix)**: The main Dashboard (`ClubsWebsite.tsx`) attempts to insert `profile_id` into `signatures`, while the `useClubMembership` hook uses `user_id`. **Resolution**: Refactor `ClubsWebsite.tsx` to use the `useClubMembership` hook for joining, ensuring consistent `user_id` usage.
2.  **Fix the Hook (`useClubMembership`)**: The `useClubMembership` hook's `useQuery` **fails to select the `id`** of the signature. This causes the `PermissionModal` to fail opening (cannot find ID). **Resolution**: Update the select query to include `id`.
3.  **Enforce Uniqueness**: `ProfileSetup.tsx` allows duplicate Student IDs. **Resolution**: Add a `checkDuplicate` query before submission.
4.  **Realize the Events Feature**: The entire Events/Calendar section is a UI shell with no backend. **Resolution**: Create an `events` table and wire up `Events.tsx` and `Calendar.tsx` to it, or hide these pages if not ready for release.
5.  **Connect the Quiz**: The Club Quiz is a dead end. **Resolution**: Create a `quiz_results` table and actually save the user's results so they can be viewed in their profile later.
