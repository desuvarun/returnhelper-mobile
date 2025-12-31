# ReturnHelper - App Store Publishing Guide

This guide covers everything you need to publish ReturnHelper to the Apple App Store and Google Play Store.

## Prerequisites

### Developer Accounts (Required)
- **Apple Developer Account**: $99/year at [developer.apple.com](https://developer.apple.com)
- **Google Play Console**: $25 one-time at [play.google.com/console](https://play.google.com/console)

### EAS CLI Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Link project (run from project directory)
eas init
```

This will create a project ID - update `app.json` with your project ID:
```json
{
  "extra": {
    "eas": {
      "projectId": "YOUR_PROJECT_ID"
    }
  }
}
```

---

## Step 1: Configure Credentials

### iOS (Apple)

1. **Create App ID** in Apple Developer Portal:
   - Go to Certificates, Identifiers & Profiles
   - Create new App ID with bundle ID: `com.returnhelper.app`
   - Enable Push Notifications capability

2. **Create Push Notification Key**:
   - Go to Keys in Apple Developer Portal
   - Create new key with Apple Push Notifications service (APNs)
   - Download the `.p8` file (save it securely!)

3. **EAS will handle certificates automatically** when you run your first build

### Android (Google)

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project named "ReturnHelper"
   - Enable Firebase Cloud Messaging API

2. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Add project linked to your Google Cloud project
   - Download `google-services.json` and place in project root

3. **Create Service Account for EAS Submit**:
   - In Google Cloud Console → IAM & Admin → Service Accounts
   - Create service account with "Service Account User" role
   - Create JSON key and save as `google-service-account.json`
   - In Google Play Console, invite this service account with "Release manager" access

---

## Step 2: Build the Apps

### Development Build (for testing)
```bash
# iOS Simulator
eas build --platform ios --profile development

# Android APK
eas build --platform android --profile development
```

### Preview Build (for TestFlight/Internal Testing)
```bash
# Both platforms
eas build --platform all --profile preview
```

### Production Build (for store submission)
```bash
# Build for both platforms
eas build --platform all --profile production
```

---

## Step 3: Prepare Store Listings

### App Store Connect (iOS)

1. **Create App**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click + to create new app
   - Select iOS platform
   - Enter bundle ID: `com.returnhelper.app`

2. **App Information**:
   - Name: ReturnHelper
   - Subtitle: Easy Package Returns
   - Category: Shopping (Primary), Lifestyle (Secondary)
   - Content Rights: Does not contain third-party content
   - Age Rating: 4+

3. **Pricing**: Choose Free (revenue from subscriptions)

4. **App Privacy**:
   - Privacy Policy URL: https://returnhelper.vercel.app/privacy
   - Data types collected:
     - Contact Info (Name, Email, Phone)
     - Location (Coarse Location)
     - Identifiers (Device ID)
     - Usage Data (Product Interaction)

5. **Screenshots** (required sizes):
   - 6.7" (iPhone 14 Pro Max): 1290 × 2796
   - 6.5" (iPhone 14 Plus): 1284 × 2778
   - 5.5" (iPhone 8 Plus): 1242 × 2208
   - iPad Pro 12.9": 2048 × 2732

### Google Play Console (Android)

1. **Create App**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Click "Create app"
   - Enter app name: ReturnHelper

2. **Store Listing**:
   - Short description: "Schedule hassle-free package pickups for your online returns"
   - Full description: (see store/metadata.json)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG

3. **Content Rating**:
   - Complete the questionnaire
   - Expected rating: Everyone

4. **App Content**:
   - Privacy policy URL: https://returnhelper.vercel.app/privacy
   - Ads: No
   - Target audience: 18+

5. **Screenshots** (required):
   - Phone: 1080x1920 (at least 2)
   - 7" tablet: 1200x1920
   - 10" tablet: 1600x2560

---

## Step 4: Submit for Review

### iOS Submission
```bash
# Using EAS Submit (recommended)
eas submit --platform ios --profile production

# Or manually:
# 1. Download .ipa from EAS dashboard
# 2. Upload via Transporter app or Application Loader
```

**Before submitting:**
- [ ] Test on multiple devices
- [ ] Verify all screenshots are correct
- [ ] Review App Store guidelines
- [ ] Prepare for demo account if requested

### Android Submission
```bash
# Using EAS Submit
eas submit --platform android --profile production

# Or manually:
# 1. Download .aab from EAS dashboard
# 2. Upload in Play Console → Release → Production
```

**Release tracks:**
1. Internal testing (up to 100 testers)
2. Closed testing (invite-only beta)
3. Open testing (public beta)
4. Production (full release)

---

## Step 5: Configure In-App Purchases (Subscriptions)

### App Store Connect

1. Go to Features → In-App Purchases
2. Create subscription group: "ReturnHelper Plans"
3. Add subscriptions:
   - `basic_monthly` - $9.99/month
   - `standard_monthly` - $19.99/month
   - `unlimited_monthly` - $29.99/month

### Google Play Console

1. Go to Monetize → Products → Subscriptions
2. Create subscriptions with same product IDs
3. Configure pricing for each tier

---

## Step 6: Push Notifications Setup

### iOS (APNs)

```bash
# Configure APNs key in EAS
eas credentials
# Select iOS → Push Notifications → Add new
# Upload your .p8 file
```

### Android (FCM)

1. Ensure `google-services.json` is in project root
2. FCM is configured automatically via the file

---

## Checklist Before Submission

### General
- [ ] App works offline gracefully
- [ ] All API endpoints are production URLs
- [ ] Error handling is user-friendly
- [ ] Loading states are implemented
- [ ] Deep links work correctly

### iOS
- [ ] App runs on oldest supported iOS (iOS 14+)
- [ ] iPad layout is acceptable
- [ ] No private APIs used
- [ ] All permissions have usage descriptions
- [ ] Screenshots show only app content

### Android
- [ ] App runs on oldest supported Android (API 24+)
- [ ] Tablet layout is acceptable
- [ ] Target SDK is current (34+)
- [ ] All permissions are justified
- [ ] 64-bit support included

---

## Common Rejection Reasons

### iOS
1. **Guideline 2.1 - App Completeness**: Crashes or obvious bugs
2. **Guideline 4.2 - Minimum Functionality**: Not enough features
3. **Guideline 5.1.1 - Data Collection**: Missing privacy policy
4. **Metadata Rejection**: Screenshots don't match app

### Android
1. **Policy 4.8 - Deceptive Behavior**: Misleading claims
2. **Sensitive Permissions**: Location/camera without justification
3. **Target API Level**: Must target recent Android version

---

## Update Process

### Over-the-Air Updates (Minor fixes)
```bash
# Push JavaScript updates without new build
eas update --branch production
```

### Full App Updates (Native changes)
```bash
# Increment version in app.json
eas build --platform all --profile production
eas submit --platform all
```

---

## Support Links

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction
- **EAS Submit**: https://docs.expo.dev/submit/introduction
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines
- **Google Play Policies**: https://play.google.com/console/about/guides

---

## File Locations

| File | Purpose |
|------|---------|
| `app.json` | App configuration |
| `eas.json` | Build configuration |
| `store/metadata.json` | Store listing text |
| `assets/icon.png` | App icon (1024x1024) |
| `assets/splash-icon.png` | Splash screen |
| `google-services.json` | Android Firebase config |
