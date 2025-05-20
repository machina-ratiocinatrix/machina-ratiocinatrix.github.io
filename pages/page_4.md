---
layout: page
title: A Platonic Dialogue
---

{% include lib/plato-script.html %}

<p class="dialogue"><span class="speaker">Socrates</span>What is justice, my friend?</p>
<p class="dialogue"><span class="speaker">Thrasymachus</span>Justice is the advantage of the stronger.</p>
<p class="dialogue"><span class="speaker">Machina Ratiocinatrix</span>I think you are oversimplifying it, Thrasymachus, trying to reduce a truely multi-dimensional problem to a single dimension.</p>

<script>
  const paragraphs = document.querySelectorAll('p.dialogue');
  const htmlInput = Array.from(paragraphs).map(p => p.outerHTML).join('\n');
  const cmjOutput = platoHtmlToCmj(htmlInput);
  console.log(cmjOutput);
  document.body.insertAdjacentHTML('beforeend', '<pre>' + cmjOutput + '</pre>');
</script>
