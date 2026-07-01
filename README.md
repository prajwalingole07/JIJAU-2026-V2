# Jijau SchoolConnect

This is a NextJS app (originally scaffolded in Firebase Studio) for running
Jijau English School's day-to-day admin: students, staff, attendance, fees,
fee receipts and homework tracking.

## Enabling live, cross-device sync (important)

By default, if no Firebase keys are configured, the app saves data only to
the browser's local storage on that one device — so changes made on one
phone will **not** appear when logging in from another phone. A small
"Local mode" banner appears at the top of every page when this is the case.

To turn on live sync so that every phone/browser sees the same data instantly:

1. Open the [Firebase Console](https://console.firebase.google.com) for this
   project (project id: `studio-8965989657-abdd6`).
2. Project Settings -> General -> "Your apps" -> add a Web app (if not
   already added) and copy the `firebaseConfig` values shown there.
3. Copy `.env.example` to `.env.local` and fill in the `NEXT_PUBLIC_FIREBASE_*`
   values from step 2.
4. In the console, go to Build -> Firestore Database -> "Create database"
   (any region close to you, production mode is fine).
5. Deploy the starting-point security rules in `firestore.rules` (or paste
   them into the Firestore "Rules" tab in the console) and tighten them with
   your developer before going live with real data.
6. Restart the app (`npm run dev` or redeploy). The "Local mode" banner
   should disappear, and changes made on any device will now sync live to
   every other device signed in with the same credentials.

## What's new

- **Live sync**: students, staff, payments, fee receipts, attendance and
  homework all sync in real time across devices once Firebase is configured
  (see above). Login sessions remain per-device, as expected.
- **Mobile-friendly dialogs**: forms and lists that didn't fit small screens
  now scroll properly and stack on mobile.
- **Attendance fix**: Present/Absent is now a single choice per student
  (previously both could appear selected at once).
- **Fee receipts**: redesigned to show the school's WhatsApp number, hide the
  transaction number for cash payments, drop the QR code, and add a Total
  Fees / Total Paid / Remaining summary plus a full payment history with
  dates. The only action button left is "Share via WhatsApp", which builds a
  PDF of the receipt and opens the native share sheet (or downloads the PDF
  and opens WhatsApp as a fallback on devices/browsers that don't support
  direct file sharing).
- **Homework**: teachers can attach a photo to a homework post from their
  portal. From the Homework Tracker page, Admin/Founder accounts get a
  "Share" button per class that sends the homework text (and photo, where
  the browser allows direct file sharing) straight to WhatsApp; otherwise the
  photo is downloaded automatically so it can be attached manually.

To get started exploring the code, take a look at `src/app/page.tsx` and
`src/lib/store.tsx`.
