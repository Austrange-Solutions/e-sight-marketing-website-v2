/**
 * Security Headers Validator
 * 
 * This script tests the security headers of your Next.js application
 * to ensure clickjacking and other protections are properly configured.
 * 
 * Usage:
 *   node scripts/test-security-headers.js
 *   node scripts/test-security-headers.js https://maceazy.com
 *   node scripts/test-security-headers.js https://donate.maceazy.com
 */

const https = require('https');
const http = require('http');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Get URL from command line argument or use default
const targetUrl = process.argv[2] || 'http://localhost:3000';

console.log(`${colors.bright}${colors.cyan}🔍 Security Headers Validator${colors.reset}\n`);
console.log(`Testing: ${colors.bright}${targetUrl}${colors.reset}\n`);

// Parse URL
const url = new URL(targetUrl);
const protocol = url.protocol === 'https:' ? https : http;

// Expected headers and their values
const expectedHeaders = {
  'x-frame-options': {
    expected: 'DENY',
    alternatives: ['SAMEORIGIN'],
    description: 'Prevents clickjacking by blocking iframe embedding',
    critical: true,
  },
  'content-security-policy': {
    contains: ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'"],
    description: 'Comprehensive security policy including clickjacking protection',
    critical: true,
  },
  'strict-transport-security': {
    contains: ['max-age='],
    description: 'Forces HTTPS connections (HSTS)',
    critical: true,
  },
  'x-content-type-options': {
    expected: 'nosniff',
    description: 'Prevents MIME type sniffing',
    critical: false,
  },
  'referrer-policy': {
    expected: 'strict-origin-when-cross-origin',
    alternatives: ['no-referrer', 'strict-origin'],
    description: 'Controls referrer information',
    critical: false,
  },
  'permissions-policy': {
    contains: ['camera=', 'microphone=', 'geolocation='],
    description: 'Restricts browser features',
    critical: false,
  },
  'x-dns-prefetch-control': {
    expected: 'on',
    alternatives: ['off'],
    description: 'Controls DNS prefetching',
    critical: false,
  },
};

// Make HTTP request
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'GET',
};

protocol.get(options, (res) => {
  console.log(`${colors.bright}Response Status:${colors.reset} ${res.statusCode} ${res.statusMessage}\n`);
  
  const headers = res.headers;
  let totalTests = 0;
  let passedTests = 0;
  let criticalIssues = 0;

  console.log(`${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  // Test each expected header
  for (const [headerName, config] of Object.entries(expectedHeaders)) {
    totalTests++;
    const headerValue = headers[headerName];
    const isCritical = config.critical;
    
    console.log(`${colors.bright}Testing: ${headerName}${colors.reset}`);
    console.log(`${colors.cyan}└─ ${config.description}${colors.reset}`);
    
    if (!headerValue) {
      passedTests--;
      if (isCritical) criticalIssues++;
      console.log(`   ${colors.red}✗ MISSING${isCritical ? ' (CRITICAL)' : ''}${colors.reset}`);
    } else {
      // Check expected value
      if (config.expected) {
        if (headerValue.toLowerCase() === config.expected.toLowerCase() ||
            (config.alternatives && config.alternatives.some(alt => 
              headerValue.toLowerCase() === alt.toLowerCase()))) {
          passedTests++;
          console.log(`   ${colors.green}✓ PASS${colors.reset} - Value: ${headerValue}`);
        } else {
          if (isCritical) criticalIssues++;
          console.log(`   ${colors.yellow}⚠ WARNING${colors.reset} - Expected: ${config.expected}, Got: ${headerValue}`);
        }
      }
      
      // Check contains
      if (config.contains) {
        const allFound = config.contains.every(substring => 
          headerValue.toLowerCase().includes(substring.toLowerCase())
        );
        
        if (allFound) {
          passedTests++;
          console.log(`   ${colors.green}✓ PASS${colors.reset} - Contains required directives`);
          console.log(`   ${colors.cyan}└─ Value: ${headerValue.substring(0, 80)}...${colors.reset}`);
        } else {
          if (isCritical) criticalIssues++;
          const missing = config.contains.filter(substring => 
            !headerValue.toLowerCase().includes(substring.toLowerCase())
          );
          console.log(`   ${colors.red}✗ FAIL${isCritical ? ' (CRITICAL)' : ''}${colors.reset} - Missing: ${missing.join(', ')}`);
        }
      }
    }
    
    console.log();
  }
  
  console.log(`${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  // Summary
  const passRate = ((passedTests / totalTests) * 100).toFixed(0);
  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  console.log(`  Critical Issues: ${criticalIssues > 0 ? colors.red : colors.green}${criticalIssues}${colors.reset}`);
  console.log(`  Pass Rate: ${passRate}%\n`);
  
  // Overall grade
  let grade = 'F';
  let gradeColor = colors.red;
  
  if (criticalIssues === 0 && passedTests === totalTests) {
    grade = 'A+';
    gradeColor = colors.green;
  } else if (criticalIssues === 0 && passRate >= 80) {
    grade = 'A';
    gradeColor = colors.green;
  } else if (criticalIssues <= 1 && passRate >= 70) {
    grade = 'B';
    gradeColor = colors.yellow;
  } else if (passRate >= 60) {
    grade = 'C';
    gradeColor = colors.yellow;
  } else {
    grade = 'F';
    gradeColor = colors.red;
  }
  
  console.log(`${colors.bright}Overall Grade: ${gradeColor}${grade}${colors.reset}\n`);
  
  // Recommendations
  if (criticalIssues > 0) {
    console.log(`${colors.bright}${colors.red}⚠️  CRITICAL SECURITY ISSUES DETECTED${colors.reset}`);
    console.log(`${colors.red}Please fix the critical issues above before deploying to production.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ All critical security headers are properly configured!${colors.reset}\n`);
  }
  
  // Clickjacking specific check
  const xFrameOptions = headers['x-frame-options'];
  const csp = headers['content-security-policy'];
  const hasClickjackingProtection = 
    (xFrameOptions && (xFrameOptions.toLowerCase() === 'deny' || xFrameOptions.toLowerCase() === 'sameorigin')) ||
    (csp && csp.toLowerCase().includes("frame-ancestors"));
  
  if (hasClickjackingProtection) {
    console.log(`${colors.bright}${colors.green}🛡️  Clickjacking Protection: ENABLED${colors.reset}`);
    console.log(`${colors.green}Your site is protected against iframe-based clickjacking attacks.${colors.reset}\n`);
  } else {
    console.log(`${colors.bright}${colors.red}⚠️  Clickjacking Protection: DISABLED${colors.reset}`);
    console.log(`${colors.red}Your site may be vulnerable to clickjacking attacks!${colors.reset}\n`);
  }
  
  // Exit with appropriate code
  process.exit(criticalIssues > 0 ? 1 : 0);
  
}).on('error', (error) => {
  console.error(`${colors.red}Error fetching headers:${colors.reset}`, error.message);
  console.error(`\n${colors.yellow}Make sure your server is running and the URL is correct.${colors.reset}`);
  console.error(`${colors.cyan}For local testing, run: bun dev${colors.reset}\n`);
  process.exit(1);
});
