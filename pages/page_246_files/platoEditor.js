document.addEventListener('DOMContentLoaded', () => {
    // Get the main content container
    const contentContainer = document.querySelector('.container-md.markdown-body');
    if (!contentContainer) return;

    // Create textarea for editing
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control';
    textarea.style.width = '100%';
    textarea.style.minHeight = '400px';
    textarea.style.display = 'none';

    // Insert textarea after content container
    contentContainer.parentNode.insertBefore(textarea, contentContainer.nextSibling);

    // Load from localStorage if available
    const savedText = localStorage.getItem('platoText');
    if (savedText) {
        contentContainer.innerHTML = platoTextToPlatoHtml(savedText);
    }

    // Toggle to editor mode on click
    contentContainer.addEventListener('click', () => {
        const plainText = platoHtmlToPlatoText(contentContainer.innerHTML);
        textarea.value = plainText;
        contentContainer.style.display = 'none';
        textarea.style.display = 'block';
        textarea.focus();
    });

    // Handle Ctrl+Enter to save and render
    textarea.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            const newText = textarea.value;
            localStorage.setItem('platoText', newText);
            contentContainer.innerHTML = platoTextToPlatoHtml(newText);
            textarea.style.display = 'none';
            contentContainer.style.display = 'block';
        }
    });

    // Auto-save to localStorage on input
    textarea.addEventListener('input', () => {
        localStorage.setItem('platoText', textarea.value);
    });
});
