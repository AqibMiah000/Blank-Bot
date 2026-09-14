const { rcedit } = require('rcedit');
const path = require('path');
const fs = require('fs');

async function applyIcon() {
  const exePath = path.resolve(__dirname, '../release/win-unpacked/Blank.exe');
  const iconPath = path.resolve(__dirname, '../build/icon.ico');

  if (!fs.existsSync(exePath)) {
    console.error('Executable not found at:', exePath);
    process.exit(1);
  }

  if (!fs.existsSync(iconPath)) {
    console.error('Icon not found at:', iconPath);
    process.exit(1);
  }

  console.log('Applying blank icon to', exePath);
  try {
    await rcedit(exePath, {
      icon: iconPath,
      'version-string': {
        ProductName: 'Blank',
        FileDescription: 'Blank — High-Frequency Retail Automation',
        CompanyName: 'Blank Bot',
        LegalCopyright: 'Copyright © 2026 Blank Bot Contributors'
      }
    });
    console.log('Successfully updated Blank.exe icon and metadata.');
  } catch (err) {
    console.error('Failed to apply icon to Blank.exe:', err);
    process.exit(1);
  }
}

applyIcon();
