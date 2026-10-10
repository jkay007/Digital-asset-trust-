// Tiny SMTP sink for the local stack: accepts every message and writes it to
// .local-stack/mail/<timestamp>.eml so auth emails (password reset, magic links)
// can be inspected in development and end-to-end tests. Never use in production.
import net from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.SMTP_PORT ?? 2500);
const DIR = process.env.MAIL_DIR ?? '.local-stack/mail';
mkdirSync(DIR, { recursive: true });

net
  .createServer((socket) => {
    let buffer = '';
    let inData = false;
    let message = '';
    const reply = (line) => socket.write(`${line}\r\n`);
    reply('220 localhost ESMTP sink');
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      let idx;
      while ((idx = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        if (inData) {
          if (line === '.') {
            inData = false;
            writeFileSync(join(DIR, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.eml`), message);
            message = '';
            reply('250 OK: queued');
          } else {
            message += (line.startsWith('..') ? line.slice(1) : line) + '\n';
          }
          continue;
        }
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === 'EHLO' || cmd === 'HELO') reply('250 localhost');
        else if (cmd === 'MAIL' || cmd === 'RCPT' || cmd === 'RSET' || cmd === 'NOOP') reply('250 OK');
        else if (cmd === 'DATA') {
          inData = true;
          reply('354 End data with <CR><LF>.<CR><LF>');
        } else if (cmd === 'QUIT') {
          reply('221 Bye');
          socket.end();
        } else if (cmd === 'AUTH') reply('235 Authentication successful');
        else reply('250 OK');
      }
    });
    socket.on('error', () => {});
  })
  .listen(PORT, '127.0.0.1', () => console.log(`smtp sink on :${PORT}`));
