import './clipboard.min.js';
import './dgraph.js';
import './runnable.js';

import hljs from 'highlight.js/lib/highlight';
import golang from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/default.css';

import '../css/theme.css';

window.hljs = hljs;

hljs.registerLanguage('go', golang);
hljs.registerLanguage('java', java);

hljs.initHighlightingOnLoad();
