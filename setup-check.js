const fs = require('fs');
const path = require('path');

console.log('🔍 GenZ Laundry Billing - Setup Verification\n');

// Check required files
const requiredFiles = [
    'package.json',
    'server.js',
    'public/index.html',
    'public/styles.css',
    'public/thermal-print.css',
    'public/app.js',
    'README.md'
];

const requiredDirs = [
    'public',
    'uploads'
];

let allGood = true;

// Check directories
console.log('📁 Checking directories...');
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`   ✅ ${dir}/`);
    } else {
        console.log(`   ❌ ${dir}/ - MISSING`);
        allGood = false;
    }
});

// Check files
console.log('\n📄 Checking files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`   ✅ ${file} (${size} KB)`);
    } else {
        console.log(`   ❌ ${file} - MISSING`);
        allGood = false;
    }
});

// Check node_modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
    console.log('   ✅ node_modules/ - Dependencies installed');
} else {
    console.log('   ❌ node_modules/ - Run "npm install" first');
    allGood = false;
}

// Check package.json content
if (fs.existsSync('package.json')) {
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        console.log('\n📋 Package info:');
        console.log(`   • Name: ${pkg.name}`);
        console.log(`   • Version: ${pkg.version}`);
        console.log(`   • Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
    } catch (e) {
        console.log('   ❌ package.json - Invalid JSON');
        allGood = false;
    }
}

console.log('\n🎯 System Requirements:');
console.log('   • Node.js v14+ ✅');
console.log('   • 80mm Thermal Printer (USB/LAN) 🖨️');
console.log('   • Modern Web Browser 🌐');

console.log('\n🚀 Quick Start:');
console.log('   1. npm install (if not done)');
console.log('   2. npm start');
console.log('   3. Open http://localhost:3000');
console.log('   4. Login: admin@genzlaundry.com / admin123');

console.log('\n🖨️ Thermal Printer Setup:');
console.log('   • Install printer drivers');
console.log('   • Set paper size to 80mm');
console.log('   • Test print from browser');
console.log('   • Configure auto-cut (if available)');

if (allGood) {
    console.log('\n🎉 Setup verification PASSED!');
    console.log('   Your GenZ Laundry Billing system is ready to use.');
} else {
    console.log('\n⚠️  Setup verification FAILED!');
    console.log('   Please fix the missing files/directories above.');
}

console.log('\n📚 For detailed instructions, see README.md');
console.log('💡 For support, check the troubleshooting section in README.md');