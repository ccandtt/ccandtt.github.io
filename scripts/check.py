"""Check local resources, anchors, accessibility relationships and JS syntax."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs, self.errors = [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        for key in ['src', 'href', 'data-framework-src']:
            if attrs.get(key):
                self.refs.append(attrs[key])
        for key in ['aria-controls', 'aria-labelledby']:
            self.refs.extend('#' + value for value in attrs.get(key, '').split())
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Image missing alt text')
        if tag == 'a' and attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', ''):
            self.errors.append('External target missing noopener')


doc = Document()
doc.feed((ROOT / 'index.html').read_text())
errors = doc.errors
for value, count in Counter(doc.ids).items():
    if count > 1:
        errors.append('Duplicate ID: ' + value)
for ref in doc.refs:
    parts = urlsplit(ref)
    if parts.scheme or parts.netloc:
        continue
    if parts.path:
        path = ROOT / unquote(parts.path.lstrip('/'))
        if not path.is_file():
            errors.append('Missing local resource: ' + ref)
    elif parts.fragment and unquote(parts.fragment) not in doc.ids:
        errors.append('Missing target: ' + ref)
for css in (ROOT / 'assets/css').glob('*.css'):
    for ref in re.findall(r'url\(\s*[\"\']?([^\s\)\"\']+)', css.read_text()):
        if urlsplit(ref).scheme or ref.startswith('#'):
            continue
        if not (css.parent / unquote(urlsplit(ref).path)).resolve().is_file():
            errors.append(f'Missing CSS resource: {css.name} -> {ref}')
for path in list((ROOT / 'assets/js').glob('*.js')) + [ROOT / 'scripts/serve.mjs']:
    result = subprocess.run(['node', '--check', str(path)], text=True, capture_output=True)
    if result.returncode:
        errors.append(result.stderr)
cv = ROOT / 'assets/documents/xinchang-wang-cv.pdf'
if not cv.read_bytes().startswith(b'%PDF-'):
    errors.append('CV is not a PDF')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(doc.refs)} local/external references inspected, {len(doc.ids)} unique IDs, all local assets and anchors exist, JS syntax valid, CV is a PDF.')
