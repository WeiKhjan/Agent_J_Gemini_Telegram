const { execSync } = require('child_process');

const runGemini = async (message, sessionId = null) => {
  const cwd = process.env.WORKSPACE_DIR || process.cwd();
  const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, ' ');
  const args = ['gemini', '-p', `"${escapedMessage}"`, '--output-format', 'json', '--yolo'];

  if (sessionId) args.push('--resume', sessionId);

  try {
    const out = execSync(args.join(' '), {
      cwd, encoding: 'utf8', shell: true, timeout: 300000, maxBuffer: 10 * 1024 * 1024, windowsHide: true
    });
    try {
      const r = JSON.parse(out);
      return { response: r.result || r.response || r.message || r.text || out, sessionId: r.session_id || r.sessionId || null };
    } catch {
      return { response: out || 'Done', sessionId: null };
    }
  } catch (e) {
    throw new Error(e.stderr || e.message || 'Gemini failed');
  }
};

module.exports = { runGemini };
