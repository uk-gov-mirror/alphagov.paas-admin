import React from 'react';

import { Template } from '../../src/layouts';

describe('OWASP Top 10 - Cross-Site Scripting XSS', () => {
  /**
   * The following test cases, will mimic our use of templates in combination
   * with API.
   *
   * The `content` constant, could equally be something that is passed on from
   * the user as well as our APIs such as CloudController.
   *
   * In theory, we're testing the test, but in practice, we're making the
   * assurance that our assumptions about the templating engine are correct and
   * we can safely carry on using this pattern.
   */
  const content = `<script id="test">
    document.querySelector('body').innerHTML = 'pwnd by <strong>tests</strong>';
  </script>`;

  let markup: string;

  beforeEach(() => {
    const template = new Template({
      csrf: 'CSRF_TOKEN',
      location: 'London',
      isPlatformAdmin: true,
    }, 'OWASP Top 10 - Cross-Site Scripting XSS');
    markup = template.render(<p>{content}</p>);
  });

  it('should parse the template without the attempted script tag injection', () => {
    expect(markup).not.toContain('<script id="test">');
  });

  it('should parse the template with safely escaped potentially malicious characters', () => {
    expect(markup).toContain('&lt;script id=&quot;test&quot;&gt;');
  });
});
