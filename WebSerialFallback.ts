// WEB SERIAL API FALLBACK FOR HOSTED ENVIRONMENTS
// Handles limitations when running on hosted platforms like Render.com

export class WebSerialFallback {
  
  // Check if Web Serial API is available and functional
  static async checkWebSerialSupport(): Promise<{
    supported: boolean;
    available: boolean;
    reason: string;
    solution: string;
  }> {
    const result = {
      supported: false,
      available: false,
      reason: '',
      solution: ''
    };

    // Check basic Web Serial API support
    if (!('serial' in navigator)) {
      result.reason = 'Web Serial API not supported in this browser';
      result.solution = 'Use Chrome 89+ or Edge 89+ browser';
      return result;
    }

    result.supported = true;

    // Check if we're in a secure context
    if (!window.isSecureContext) {
      result.reason = 'Web Serial API requires HTTPS or localhost';
      result.solution = 'Access via HTTPS or run locally on localhost';
      return result;
    }

    // Check if we can actually request ports (some hosted environments block this)
    try {
      // Try to get existing ports first
      const existingPorts = await (navigator as any).serial.getPorts();
      console.log('Existing serial ports:', existingPorts);
      
      result.available = true;
      result.reason = 'Web Serial API is available';
      result.solution = 'Ready to connect to printers';
      
    } catch (error) {
      result.reason = `Web Serial API blocked: ${(error as Error).message}`;
      result.solution = 'Use ESC/POS Direct method or run locally';
    }

    return result;
  }

  // Generate comprehensive connection instructions
  static getConnectionInstructions(domain: string): string {
    const isHosted = domain.includes('render.com') || domain.includes('netlify.app') || 
                    domain.includes('vercel.app') || domain.includes('github.io');

    if (isHosted) {
      return `🌐 HOSTED ENVIRONMENT DETECTED (${domain})

⚠️ WEB SERIAL API LIMITATIONS:
Hosted platforms like Render.com may have restrictions on direct USB access for security reasons.

🎯 RECOMMENDED SOLUTIONS:

1️⃣ ESC/POS DIRECT METHOD (BEST FOR HOSTED):
   • Click "ESC/POS DIRECT" button
   • Copy thermal printer commands
   • Use thermal printer software:
     - PrintNode (recommended)
     - Thermal Printer Driver utility
     - Direct printer software
   • 100% guaranteed to work

2️⃣ RUN LOCALLY (FULL USB ACCESS):
   • Download/clone the project
   • Run on localhost (http://localhost:3000)
   • Full Web Serial API access
   • Direct USB printer connection

3️⃣ BROWSER PRINT FALLBACK:
   • Use "THERMAL PRINT" button
   • Configure browser print settings
   • Print via system print dialog

💡 FOR PRODUCTION USE:
Consider running the POS system locally or on a local server for full hardware access.`;
    }

    return `🔧 LOCAL ENVIRONMENT TROUBLESHOOTING:

1. Ensure printers are powered on and connected via USB
2. Install official printer drivers
3. Use Chrome/Edge browser (not Firefox/Safari)
4. Allow serial port permissions when prompted
5. Check Windows Device Manager for printer recognition
6. Try different USB ports/cables`;
  }

  // Check if running on hosted platform
  static isHostedEnvironment(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('render.com') || 
           hostname.includes('netlify.app') || 
           hostname.includes('vercel.app') || 
           hostname.includes('github.io') ||
           hostname.includes('herokuapp.com') ||
           !hostname.includes('localhost') && !hostname.includes('127.0.0.1');
  }

  // Get platform-specific recommendations
  static getPlatformRecommendations(): {
    platform: string;
    usbAccess: boolean;
    recommendations: string[];
  } {
    const hostname = window.location.hostname;
    
    if (hostname.includes('render.com')) {
      return {
        platform: 'Render.com',
        usbAccess: false,
        recommendations: [
          'Use ESC/POS Direct method for guaranteed printing',
          'Consider running locally for full USB access',
          'Use PrintNode or similar thermal printer software',
          'Browser print method as fallback option'
        ]
      };
    }

    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return {
        platform: 'Local Development',
        usbAccess: true,
        recommendations: [
          'Full Web Serial API access available',
          'Direct USB printer connection supported',
          'Install printer drivers for best results',
          'Use Chrome/Edge for Web Serial API support'
        ]
      };
    }

    return {
      platform: 'Hosted Environment',
      usbAccess: false,
      recommendations: [
        'USB access may be limited on hosted platforms',
        'Use ESC/POS Direct method as primary option',
        'Consider local deployment for full features',
        'Browser print method available as fallback'
      ]
    };
  }
}

// Enhanced error messages for different environments
export const getEnvironmentSpecificError = (error: Error): string => {
  const isHosted = WebSerialFallback.isHostedEnvironment();
  
  if (isHosted) {
    return `🌐 HOSTED ENVIRONMENT LIMITATION

${error.message}

💡 SOLUTION FOR RENDER.COM:
Since you're running on a hosted platform, direct USB access may be restricted.

RECOMMENDED APPROACH:
1. Use "ESC/POS DIRECT" method
2. Copy printer commands to clipboard  
3. Use thermal printer software (PrintNode, etc.)
4. This bypasses browser limitations completely

ALTERNATIVE:
Run the POS system locally for full USB access:
• Download the project files
• Run on localhost:3000
• Full Web Serial API support`;
  }

  return `🔧 LOCAL ENVIRONMENT ERROR

${error.message}

TROUBLESHOOTING STEPS:
1. Ensure printer is powered on and connected
2. Install official printer drivers
3. Use Chrome/Edge browser
4. Allow serial port permissions
5. Check USB cable and ports
6. Try connecting one printer at a time`;
};