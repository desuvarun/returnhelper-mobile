const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG icon design for ReturnHelper - a return arrow with a box
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" rx="220" fill="#2563EB"/>

  <!-- Box/Package icon -->
  <g transform="translate(262, 280)">
    <!-- Box body -->
    <rect x="50" y="120" width="400" height="320" rx="20" fill="white" opacity="0.95"/>

    <!-- Box flaps (top) -->
    <path d="M50 140 L250 40 L450 140" stroke="white" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Box center line -->
    <line x1="250" y1="40" x2="250" y2="200" stroke="#2563EB" stroke-width="16" stroke-linecap="round"/>

    <!-- Return arrow -->
    <g transform="translate(100, 220)">
      <!-- Arrow curve -->
      <path d="M200 0 C 320 0, 320 120, 200 120 L 80 120"
            stroke="#2563EB" stroke-width="32" fill="none" stroke-linecap="round"/>
      <!-- Arrow head -->
      <path d="M120 70 L 60 120 L 120 170"
            stroke="#2563EB" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

// Adaptive icon foreground (just the icon on transparent background)
const adaptiveIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Box/Package icon centered for adaptive icon safe zone -->
  <g transform="translate(262, 280)">
    <!-- Box body -->
    <rect x="50" y="120" width="400" height="320" rx="20" fill="white"/>

    <!-- Box flaps (top) -->
    <path d="M50 140 L250 40 L450 140" stroke="white" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Box center line -->
    <line x1="250" y1="40" x2="250" y2="200" stroke="#2563EB" stroke-width="16" stroke-linecap="round"/>

    <!-- Return arrow -->
    <g transform="translate(100, 220)">
      <!-- Arrow curve -->
      <path d="M200 0 C 320 0, 320 120, 200 120 L 80 120"
            stroke="#2563EB" stroke-width="32" fill="none" stroke-linecap="round"/>
      <!-- Arrow head -->
      <path d="M120 70 L 60 120 L 120 170"
            stroke="#2563EB" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

// Splash icon (simpler, centered)
const splashIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Box/Package icon -->
  <g transform="translate(56, 80)">
    <!-- Box body -->
    <rect x="25" y="80" width="350" height="260" rx="16" fill="#2563EB"/>

    <!-- Box flaps (top) -->
    <path d="M25 96 L200 16 L375 96" stroke="#2563EB" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Box center line -->
    <line x1="200" y1="16" x2="200" y2="140" stroke="white" stroke-width="12" stroke-linecap="round"/>

    <!-- Return arrow -->
    <g transform="translate(60, 160)">
      <!-- Arrow curve -->
      <path d="M160 0 C 260 0, 260 100, 160 100 L 60 100"
            stroke="white" stroke-width="24" fill="none" stroke-linecap="round"/>
      <!-- Arrow head -->
      <path d="M100 55 L 45 100 L 100 145"
            stroke="white" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

// Notification icon (simple, white for Android status bar)
const notificationIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Simple box with return arrow for notification -->
  <g transform="translate(8, 12)">
    <!-- Box -->
    <rect x="5" y="20" width="70" height="55" rx="4" fill="white"/>
    <path d="M5 24 L40 8 L75 24" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>

    <!-- Return arrow -->
    <g transform="translate(12, 35)">
      <path d="M35 0 C 55 0, 55 25, 35 25 L 12 25" stroke="#2563EB" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M20 14 L 8 25 L 20 36" stroke="#2563EB" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

// Favicon
const faviconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="8" fill="#2563EB"/>
  <g transform="translate(6, 8)">
    <rect x="3" y="10" width="30" height="24" rx="2" fill="white"/>
    <path d="M3 12 L18 4 L33 12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g transform="translate(6, 16)">
      <path d="M16 0 C 24 0, 24 10, 16 10 L 6 10" stroke="#2563EB" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M10 5 L 4 10 L 10 15" stroke="#2563EB" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Generate main app icon (1024x1024)
    await sharp(Buffer.from(iconSVG))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✓ Generated icon.png (1024x1024)');

    // Generate adaptive icon foreground (1024x1024)
    await sharp(Buffer.from(adaptiveIconSVG))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✓ Generated adaptive-icon.png (1024x1024)');

    // Generate splash icon (512x512)
    await sharp(Buffer.from(splashIconSVG))
      .resize(512, 512)
      .png()
      .toFile(path.join(assetsDir, 'splash-icon.png'));
    console.log('✓ Generated splash-icon.png (512x512)');

    // Generate notification icon (96x96)
    await sharp(Buffer.from(notificationIconSVG))
      .resize(96, 96)
      .png()
      .toFile(path.join(assetsDir, 'notification-icon.png'));
    console.log('✓ Generated notification-icon.png (96x96)');

    // Generate favicon (48x48)
    await sharp(Buffer.from(faviconSVG))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ Generated favicon.png (48x48)');

    console.log('\nAll icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
