const isUserAllowed = (userId) => {
  const ids = (process.env.ALLOWED_TELEGRAM_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
  return ids.length > 0 && ids.includes(userId);
};

const splitMessage = (msg, max = 4000) => {
  if (!msg || msg.length <= max) return [msg || 'No response'];
  const chunks = [];
  let rest = msg;
  while (rest.length > 0) {
    if (rest.length <= max) { chunks.push(rest); break; }
    let i = rest.lastIndexOf('\n', max);
    if (i < max / 2) i = rest.lastIndexOf(' ', max);
    if (i < max / 2) i = max;
    chunks.push(rest.slice(0, i));
    rest = rest.slice(i).trimStart();
  }
  return chunks;
};

const markdownToHtml = (text) => {
  if (!text) return text;

  // First, convert markdown tables to readable format (before HTML escaping)
  text = convertTablesToReadable(text);

  // Escape HTML entities but preserve our formatting tags
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore our formatting tags that were added by convertTablesToReadable
  text = text
    .replace(/&lt;b&gt;/g, '<b>')
    .replace(/&lt;\/b&gt;/g, '</b>')
    .replace(/&lt;i&gt;/g, '<i>')
    .replace(/&lt;\/i&gt;/g, '</i>');

  // Apply markdown formatting
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre>$2</pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<b>$1</b>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>')  // *italic*
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<i>$1</i>')        // _italic_
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Convert markdown bullet points to cleaner format
    .replace(/^(\s*)[-*]\s+/gm, '$1• ')
    // Convert numbered lists
    .replace(/^(\s*)\d+\.\s+/gm, '$1▪️ ');
};

// Check if a line is a table separator (|---|---|)
const isTableSeparator = (line) => {
  const trimmed = line.trim();
  // Match lines like |---|---|, |:---:|---:|, |-----|-----|, or just ---|---
  return /^[\|\s]*[:|-]+[\|\s:|-]*$/.test(trimmed) && trimmed.includes('-');
};

// Check if a line looks like a table row
const isTableRow = (line) => {
  const trimmed = line.trim();
  // Must have at least one pipe and some content, but not be a separator
  if (!trimmed.includes('|')) return false;
  if (isTableSeparator(line)) return false;
  // Count pipes - tables typically have 2+ pipes
  const pipeCount = (trimmed.match(/\|/g) || []).length;
  return pipeCount >= 2;
};

// Convert markdown tables to a cleaner readable format
const convertTablesToReadable = (text) => {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this looks like a table row
    if (isTableRow(line)) {
      // Collect all table lines
      const tableLines = [];
      let hasSeparator = false;

      while (i < lines.length) {
        const currentLine = lines[i];
        if (isTableSeparator(currentLine)) {
          hasSeparator = true;
          i++;
          continue;
        }
        if (isTableRow(currentLine)) {
          tableLines.push(currentLine.trim());
          i++;
        } else {
          break;
        }
      }

      if (tableLines.length > 0) {
        // Parse table into rows
        const rows = tableLines.map(row => {
          // Remove leading/trailing pipes and split
          let cleaned = row;
          if (cleaned.startsWith('|')) cleaned = cleaned.slice(1);
          if (cleaned.endsWith('|')) cleaned = cleaned.slice(0, -1);
          return cleaned
            .split('|')
            .map(cell => cell.trim());
        });

        if (rows.length > 0) {
          const headers = rows[0];
          const dataRows = rows.slice(1);

          // Format as clean card-style entries
          if (dataRows.length > 0) {
            result.push(''); // Add spacing before table
            for (let idx = 0; idx < dataRows.length; idx++) {
              const row = dataRows[idx];
              let entry = '';

              // First column as bold title with emoji
              if (row[0]) {
                entry += `<b>📌 ${row[0]}</b>`;
              }

              // Other columns with header label
              for (let j = 1; j < row.length && j < headers.length; j++) {
                const value = row[j] || '';
                const header = headers[j] || '';
                if (value) {
                  entry += `\n    ${header}: ${value}`;
                }
              }

              result.push(entry);

              // Add small separator between entries (not after last)
              if (idx < dataRows.length - 1) {
                result.push('');
              }
            }
            result.push(''); // Add spacing after table
          } else {
            // Just headers, display as list
            result.push(headers.map(h => `<b>${h}</b>`).join(' • '));
          }
        }
      }
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
};

module.exports = { isUserAllowed, splitMessage, markdownToHtml };
