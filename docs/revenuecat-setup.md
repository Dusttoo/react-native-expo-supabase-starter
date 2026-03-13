# RevenueCat Setup

This document covers the RevenueCat dashboard configuration required before subscriptions will work in the app.

The SDK is already integrated. What you need to do is configure your products, entitlements, and offerings in the RevenueCat dashboard so the SDK has something to work with.

---

## 1. Create a RevenueCat project

Go to [app.revenuecat.com](https://app.revenuecat.com) and create a new project. Give it the same name as your app.

---

## 2. Add your iOS and Android apps

Inside your project, add an app for each platform:

- **iOS**: provide your iOS bundle identifier (matches `ios.bundleIdentifier` in `app.json`)
- **Android**: provide your Android package name (matches `android.package` in `app.json`)

Each app will have its own API key. Copy these into your `.env` file:

```
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxx
```

---

## 3. Create your products in the App Store / Play Store

RevenueCat doesn't create products — it reads them from Apple and Google after you've set them up there. You need to create the subscription products in App Store Connect and Google Play Console before you can attach them in RevenueCat.

Minimum required products for this starter's three-tier model:

| Product | Suggested ID | Type |
|---|---|---|
| Pro Monthly | `pro_monthly` | Auto-renewable subscription |
| Pro Annual | `pro_annual` | Auto-renewable subscription |
| Premium Monthly | `premium_monthly` | Auto-renewable subscription |
| Premium Annual | `premium_annual` | Auto-renewable subscription |

> App Store Connect requires a paid developer account and a completed app record before you can create in-app purchases. For early testing, you can use StoreKit configuration files in Xcode to simulate purchases without a real App Store product.

---

## 4. Create entitlements

Entitlements are what the app checks to determine what a user can access. The `subscription-service.ts` file checks for two entitlements by name — these names must match exactly.

In the RevenueCat dashboard: **Entitlements → + New**

Create these two entitlements:

| Identifier | Description |
|---|---|
| `pro` | Access to Pro features |
| `premium` | Access to Premium features |

The identifiers are case-sensitive. `pro` and `premium` are the values used in `subscription-service.ts`:

```typescript
const ENTITLEMENTS = {
  pro: 'pro',
  premium: 'premium',
}
```

If you want to rename them, update both the dashboard and this file to match.

---

## 5. Attach products to entitlements

After creating entitlements, attach your App Store / Play Store products to them:

- Attach `pro_monthly` and `pro_annual` to the `pro` entitlement
- Attach `premium_monthly` and `premium_annual` to the `premium` entitlement

A user who purchases any product attached to an entitlement will have that entitlement marked active.

---

## 6. Create an offering

Offerings are what the paywall displays. The `useOfferings()` hook fetches `offerings.current`, which is the offering marked as default in the RevenueCat dashboard.

In the dashboard: **Offerings → + New Offering**

- Identifier: `default` (or any name — just make sure one offering is set as Current)
- Add packages to the offering:

| Package identifier | Type | Product |
|---|---|---|
| `$rc_monthly` | Monthly | `pro_monthly` (or `premium_monthly`) |
| `$rc_annual` | Annual | `pro_annual` (or `premium_annual`) |

RevenueCat's built-in package identifiers (`$rc_monthly`, `$rc_annual`, `$rc_lifetime`) map to the `monthly`, `annual`, and `lifetime` shorthand properties on the offering object. The `PaywallScreen` uses `offering.annual` and `offering.monthly` directly, so using these standard identifiers is recommended.

---

## 7. Test with sandbox accounts

**iOS**: Create a Sandbox tester in App Store Connect (Users and Access → Sandbox Testers). Sign into the sandbox account on your device under Settings → App Store → Sandbox Account. Purchases made with the sandbox account are free and instant.

**Android**: Add a license tester email in the Google Play Console (Setup → License Testing). Purchases made with that account are free.

RevenueCat's dashboard has a separate Sandbox view — switch to it to see test purchases as they come in.

---

## How the tier logic works

`SubscriptionService.identifyUser()` calls `Purchases.logIn(userId)` with the Supabase user ID, then reads `customerInfo.entitlements.active` to determine the tier:

```
active['premium'] → 'premium'
active['pro']     → 'pro'
neither active    → 'free'
```

Note that `premium` is checked first. If a user somehow has both entitlements active, they are treated as `premium`. In practice, a user should only ever have one active tier, but the ordering makes the intent explicit.

---

## Checklist

- [ ] RevenueCat project created
- [ ] iOS and Android apps added with correct bundle identifiers
- [ ] Products created in App Store Connect and/or Google Play Console
- [ ] `pro` and `premium` entitlements created in RevenueCat
- [ ] Products attached to entitlements
- [ ] Default offering created with monthly and annual packages
- [ ] API keys added to `.env`
- [ ] Sandbox test account configured for your platform
