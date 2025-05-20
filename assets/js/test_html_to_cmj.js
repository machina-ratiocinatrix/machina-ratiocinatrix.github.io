<script>
    const paragraphs = document.querySelectorAll('p.dialogue');
    const htmlInput = Array.from(paragraphs).map(p => p.outerHTML).join('\n');
    const cmjOutput = platoHtmlToCmj(htmlInput); console.log(cmjOutput);
    const contentDiv = document.querySelector('.markdown-body');
    if (contentDiv) {
        contentDiv.insertAdjacentHTML('beforeend', '<pre>' + cmjOutput + '</pre>');}
    else {  console.error('Error: .markdown-body div not found');}
</script>
