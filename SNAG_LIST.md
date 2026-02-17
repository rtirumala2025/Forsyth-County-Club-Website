# Dr. Admin's Snag List

## 🔴 Critical Blockers
*   **The "Permission Slip" Loop is Broken**: Clicking "Join" triggers a loading spinner, but the **Permission Modal never appears**. This dead-ends the user; they cannot join a club.
*   **Admin Dashboard Down**: The `/admin` page hangs on an infinite loading spinner. Sponsors cannot verify students or export data.
*   **Search is broken**: Search filtering does not seem to work dynamically as expected.
*   **Security Bypass**: Freshmen can skip `Profile Setup` by manually typing `/app` in the URL bar.

## 🟡 UX Friction
*   **Profile "Happy Path" Flaw**: The Profile Setup allows numeric names ("123") and doesn't clearly block blank emails in a user-friendly way (crashes or hangs).
*   **Search Lag**: The search bar doesn't feel responsive or "live".

## 🔵 Visual Glitch
*   **School Dropdown**: Persistent open state obscuring headers.
*   **Sidebar**: Some items might be misaligned (need to verify).

## ✅ Successes
*   **Dead Features Hidden**: Links to Events, Calendar, and Quiz are successfully removed/disabled.
