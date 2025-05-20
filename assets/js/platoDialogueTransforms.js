/**
 * Transforms platoHtml format to CMJ (Chat Messages JSON) format.
 * @param {string} htmlText - The platoHtml formatted string.
 * @returns {string} - JSON stringified array of message objects.
 */
function platoHtmlToCmj(htmlText) {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid input: htmlText must be a non-empty string');
  }

  const messages = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const paragraphs = doc.querySelectorAll('p.dialogue');

  paragraphs.forEach(p => {
    const speakerSpan = p.querySelector('span.speaker');
    if (!speakerSpan) return; // Skip malformed paragraphs

    const speaker = speakerSpan.textContent.trim();
    // Extract utterance by removing speaker span and trimming
    const utterance = p.textContent.replace(speakerSpan.textContent, '').replace(/:\s*/, '').trim();

    let role = 'user';
    if (speaker.toUpperCase() === 'MACHINA-RATIOCINATRIX') {
      role = 'assistant';
    } else if (speaker.toUpperCase() === 'INSTRUCTIONS') {
      role = 'system';
    }

    messages.push({
      role: role,
      name: speaker,
      content: utterance
    });
  });

  try {
    return JSON.stringify(messages, null, 2);
  } catch (e) {
    throw new Error('Failed to stringify JSON: ' + e.message);
  }
}

/**
 * Transforms platoHtml format to platoText format.
 * @param {string} htmlText - The platoHtml formatted string.
 * @returns {string} - The platoText formatted string.
 */
function platoHtmlToPlatoText(htmlText) {
  if (!htmlText || typeof htmlText !== 'string') {
    throw new Error('Invalid input: htmlText must be a non-empty string');
  }

  let result = '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const paragraphs = doc.querySelectorAll('p.dialogue');

  paragraphs.forEach(p => {
    const speakerSpan = p.querySelector('span.speaker');
    if (!speakerSpan) return; // Skip malformed paragraphs

    const speaker = speakerSpan.textContent.trim();
    const utterance = p.textContent.replace(speakerSpan.textContent, '').replace(/:\s*/, '').trim();
    result += `${speaker.toUpperCase()}: ${utterance}\n\n`;
  });

  return result.trimEnd();
}

/**
 * Transforms platoText format to platoHtml format.
 * @param {string} platoText - The platoText formatted string.
 * @returns {string} - The platoHtml formatted string.
 */
function platoTextToPlatoHtml(platoText) {
  if (!platoText || typeof platoText !== 'string') {
    throw new Error('Invalid input: platoText must be a non-empty string');
  }

  const regex = /([A-Za-z0-9_ -]+):\s*(.*?)\n\n/gs;
  let result = '';
  let match;

  while ((match = regex.exec(platoText)) !== null) {
    const speaker = match[1].trim();
    const utterance = match[2].trim().replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Escape HTML characters
    result += `<p class="dialogue"><span class="speaker">${speaker}</span>: ${utterance}</p>\n`;
  }

  return result.trimEnd();
}

/**
 * Transforms platoText format to CMJ (Chat Messages JSON) format.
 * @param {string} platoText - The platoText formatted string.
 * @returns {string} - JSON stringified array of message objects.
 */
function platoTextToCmj(platoText) {
  if (!platoText || typeof platoText !== 'string') {
    throw new Error('Invalid input: platoText must be a non-empty string');
  }

  const regex = /([A-Za-z0-9_ -]+):\s*(.*?)\n\n/gs;
  const messages = [];
  let match;

  while ((match = regex.exec(platoText)) !== null) {
    const speaker = match[1].trim();
    const utterance = match[2].trim();

    let role = 'user';
    if (speaker.toUpperCase() === 'MACHINA-RATIOCINATRIX') {
      role = 'assistant';
    } else if (speaker.toUpperCase() === 'INSTRUCTIONS') {
      role = 'system';
    }

    messages.push({
      role: role,
      name: speaker,
      content: utterance
    });
  }

  try {
    return JSON.stringify(messages, null, 2);
  } catch (e) {
    throw new Error('Failed to stringify JSON: ' + e.message);
  }
}
