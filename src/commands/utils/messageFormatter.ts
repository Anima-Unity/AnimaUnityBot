const formatMessage = (text: string): string => {
  let formattedText = '';
  const lines = text.split('\n');
  
  let insideCodeBlock = false;
  let codeBlock = '';

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      if (!insideCodeBlock) {
        formattedText += `<pre>${codeBlock.trim()}</pre>\n`;
        codeBlock = '';
      }
    } else if (insideCodeBlock) {
      codeBlock += `${line}\n`;
    } else if (line.startsWith('>')) {
      formattedText += `<blockquote>${line.substring(1).trim()}</blockquote>\n`;
    } else {
      if (line.startsWith('•')) {
        formattedText += `• ${line.substring(1).trim()}\n`;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        formattedText += `<b>${line.slice(2, -2)}</b>\n`;
      } else if (line.includes('**')) {
        const boldParts = line.split('**');
        formattedText += boldParts.map((part, index) =>
          index % 2 === 1 ? `<b>${part}</b>` : part
        ).join('') + '\n';
      } else {
        formattedText += `${line}\n`;
      }
    }
  });

  if (insideCodeBlock) {
    formattedText += `<pre>${codeBlock.trim()}</pre>\n`;
  }

  return formattedText.trim();
};

export { formatMessage };