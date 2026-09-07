DOCTOR CONTACT WEB FRONTEND — FULL CONSOLIDATED UPDATE
==========================================================
Everything from this session in ONE package (21 files, dewasi-group
monorepo — apps/web + packages/shared).

HOW TO APPLY
------------
1. Copy every file into the matching path in your repo (overwrite
   existing, add new).
2. npm install    (adds firebase to apps/web)
3. Copy apps/web/.env.local.example to apps/web/.env.local and fill
   in the Firebase values (see below) and your NEXT_PUBLIC_API_URL.
4. This depends on the BACKEND package from the same session
   (backend-FULL-final.zip) actually being deployed and reachable —
   none of this works against the old backend.

FIREBASE SETUP NEEDED (blocking — patient login won't work without this)
----------------------------------------------------------------------------
1. Firebase Console -> your project -> Project Settings -> General ->
   "Your apps" -> Add app -> Web. Copy the config values into
   apps/web/.env.local (NEXT_PUBLIC_FIREBASE_*).
2. Authentication -> Sign-in method -> enable "Phone".
3. Authentication -> Settings -> Authorized domains -> add your
   actual deployed domain (localhost is allowed by default for dev).
4. Phone Auth needs the Blaze (pay-as-you-go) plan for production —
   the free Spark plan has a very small daily test quota. Worth
   confirming your Firebase project's billing plan before launch.

WHAT'S IN HERE
--------------

1. PATIENT LOGIN/SIGNUP — completely rebuilt (phone + OTP)
   - lib/firebase.ts — Firebase client SDK init
   - lib/hooks/usePhoneAuth.ts — wraps invisible reCAPTCHA + send/confirm OTP
   - components/auth/OtpInput.tsx — 6-digit code input
   - app/[locale]/register/page.tsx — now phone+OTP only (old
     email+password form removed; backend retired that route)
   - app/[locale]/login/page.tsx — now has a Patient / Staff toggle:
       Patient tab: same phone+OTP flow (login AND signup in one)
       Staff tab: existing email-or-phone + password form (Doctor/
       Clinic/Receptionist/Admin/Super Admin) — unchanged UX, just now
       accepts phone as an alternative to email
   - packages/shared/src/schemas/auth.ts — loginSchema now accepts
     email OR phone; added patientPhoneAuthSchema,
     resetPasswordByPhoneSchema

2. DOCTOR SEARCH + BOOKING — fixed a real breaking bug
   - lib/hooks/useDoctorSearch.ts now calls the correct backend
     endpoint (/doctors/search — specialization/city/fee/live/
     available filters) instead of a basic legacy endpoint that
     didn't support any of that.
   - **Booking used to send a free-typed date+time with no
     scheduleId at all** — this could never have worked against the
     current backend, which requires a specific session (scheduleId)
     to book against. Replaced with: pick a clinic (existing) -> pick
     an actual session from that doctor's real schedules at that
     clinic (new, fetched on-demand via useDoctorSchedules) -> pick a
     date -> book. This was blocking ALL online booking, not a minor
     gap.
   - Doctor cards now show a "Live Now" badge (with booked/max count)
     and a "Running late" indicator when applicable, reading the
     backend's real evaluateDoctorStatus output instead of the old
     static isAvailable flag.
   - packages/shared/src/types.ts — Doctor type now has liveStatus
     (isAvailable/isLive/reason/capacity/operationalStatus/
     delayMinutes) and an optional schedules array type.

3. HEADER — Step 60 done
   - components/LiveDoctorsButton.tsx (new) replaces the old
     ThemeToggle (which was a disabled dark-mode button doing
     nothing). Links to /doctors?live=true.
   - app/[locale]/doctors/page.tsx reads ?live=true and shows a
     "Live Now" banner + filters the grid to isLive doctors only.

4. FOOTER / ABOUT / TERMS / PRIVACY (from earlier in this session,
   included here again since it was never packaged into a "full"
   zip before)
   - Real links (previously all three went to "#"), a Dewasi Group
     brand strip, social icons (Facebook/Instagram/WhatsApp Channel/X
     placeholder), real contact info.
   - Three new pages with content in en/bn/hi.
   - Still needs: your actual Dewasi Group logo file at
     apps/web/public/dewasi-group-logo.png (not included — I don't
     have it), and a real X/Twitter URL (currently "#").

KNOWN GAPS / NOT DONE
------------------------
- Queue screens (doctor/receptionist queue pages) still don't
  subscribe to Socket.io for live updates — flagged earlier in this
  session, not fixed. They still work, just require a manual refresh
  instead of updating live.
- Schedule Exceptions UI, Follow-up UI, per-doctor online-booking
  toggle UI, Doctor persistent status display (beyond the search
  card), Clinic search filters UI — backend is ready for all of
  these (see backend-FULL-final.zip), frontend UI not built yet.
- Nothing in this package has been run through an actual build
  (next build) or dev server — only manually reviewed. TypeScript
  errors, if any, haven't been caught by a compiler. Recommend
  running `npm run build` locally before deploying and fixing
  whatever it flags.
- useSearchParams() in app/[locale]/doctors/page.tsx may need a
  <Suspense> boundary depending on how Next.js's build handles this
  particular page — worth checking the build output.


QUEUE LIVE UPDATES (Socket.io) — no more manual refresh
============================================================
Stacks on top of frontend-FULL-final.zip from before (this is
additive — same files where they overlap, just the newer version).

WHAT CHANGED
------------
1. lib/hooks/useDoctor.ts — useDoctorQueue (used by BOTH the doctor
   queue page and the receptionist queue page — one shared hook, one
   fix covers both screens) now joins the backend's
   queue:{doctorId}:{clinicId} Socket.io room and refetches
   automatically on queueUpdate / tokenCalled / appointmentCompleted
   / doctorDelay. No setInterval, no polling — purely push-driven,
   matching the "no polling" rule from the master spec.

2. lib/hooks/useAppointments.ts — useMyAppointments (patient's own
   "my appointments" list, showing patientsAhead/estimatedWait) now
   joins the queue room for every doctor+clinic the patient currently
   has an active (WAITING/CHECKED_IN) appointment with, and refetches
   the whole list live as the queue moves — so "patients ahead: 3"
   updates in real time instead of only on page reload.

3. packages/shared/src/types.ts — Appointment type was missing
   doctorId/clinicId (the backend already returns them, the type
   just didn't declare them — needed them for the room-joining logic
   above).

4. app/[locale]/doctors/page.tsx — unchanged from the previous zip,
   included here again since it's in the same diff; no new edits.

NOT DONE YET
------------
- Doctor's OWN dashboard/profile pages (outside the queue screen)
  don't have live updates — this only covers the queue view and the
  patient's appointment list.
- Still no build/compile check — same caveat as before.
