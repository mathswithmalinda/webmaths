# Student payment panel

## Files

- `admin-panel.html` — separate admin panel; it reads/writes **only** `users/STU...` records.
- `login-script-replacement.js` — replaces the script at the bottom of your existing login HTML.
- `admin.css`, `admin.js` — assets used by the panel.

`grades/` is never read or written. Your link changer remains unchanged.

## Install

1. Upload these four web files to a new folder in your website, for example `/student-admin/`.
2. Open `admin-panel.html` on the hosted site. Sign in with the existing `users/admin` passcode.
3. In the existing login page, keep the Firebase SDK scripts and replace its current Firebase login `<script>...</script>` with the contents of `login-script-replacement.js` (omit the top two comment lines).

## Payment rule

The first 14 calendar days of every month are free. From the 15th, a student can log in only when both values are set:

```json
{ "paymentActive": true, "paidFor": "YYYY-MM" }
```

The panel writes these automatically when you verify a payment. Since `paidFor` must equal the current `YYYY-MM`, every payment automatically expires on the first day of the next month—without touching `grades/` or requiring a mass database update. The dashboard button is available for a manual immediate reset too.

## Student fields added

The panel keeps each current account key such as `users/STU0001` and can add these fields: `fullName`, `phone`, `status`, `paymentActive`, `paidFor`, `paymentNote`, and `paymentVerifiedAt`. Existing `page`, `passcode`, and `last_active` remain compatible.

## Important security note

The supplied old login system stores passcodes in Realtime Database and performs password checks in browser JavaScript. That means it is not secure if your database rules allow public reads. This panel is compatible with the current design, but before using real payment details, migrate to Firebase Authentication and restrict Realtime Database rules to authenticated admins/writers. Never store bank receipt images or sensitive payment data in a public database.
