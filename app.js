const baseUrlInput = document.querySelector('#api-base-url');
const statusLabel = document.querySelector('#response-status');
const responseMeta = document.querySelector('#response-meta');
const responseOutput = document.querySelector('#response-output');
const buttons = [...document.querySelectorAll('[data-run]')];

try {
  const savedBaseUrl = localStorage.getItem('local-api-bench-base-url');
  if (savedBaseUrl) baseUrlInput.value = savedBaseUrl;
} catch {
  // The page remains usable when browser storage is unavailable.
}

baseUrlInput.addEventListener('change', () => {
  try {
    localStorage.setItem('local-api-bench-base-url', baseUrlInput.value.trim());
  } catch {
    // Saving the URL is optional; it can still be used for the current page.
  }
});

function formatResponse(value, rawText) {
  if (value !== null && value !== undefined) return JSON.stringify(value, null, 2);
  return rawText || '(空のレスポンス)';
}

async function runEndpoint(button) {
  const endpoint = button.dataset.run;
  let baseUrl;
  try {
    baseUrl = new URL(baseUrlInput.value.trim());
    if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('http または https の URL を入力してください。');
  } catch (error) {
    statusLabel.textContent = '入力エラー';
    statusLabel.dataset.state = 'error';
    responseMeta.textContent = `${endpoint} は実行されていません`;
    responseOutput.textContent = error.message === 'Invalid URL' ? '有効な API ベース URL を入力してください。' : error.message;
    responseOutput.dataset.state = 'error';
    return;
  }

  baseUrlInput.value = baseUrl.href.replace(/\/$/, '');
  const requestUrl = new URL(endpoint, `${baseUrlInput.value}/`);
  buttons.forEach((runButton) => { runButton.disabled = true; });
  button.querySelector('span:first-child').textContent = '実行中';
  statusLabel.textContent = '通信中';
  statusLabel.dataset.state = 'loading';
  responseMeta.textContent = `GET ${requestUrl.href}`;
  responseOutput.textContent = 'サーバーからの応答を待っています…';
  responseOutput.dataset.state = 'loading';

  const startedAt = performance.now();
  let httpStatusError = false;
  try {
    const response = await fetch(requestUrl, { headers: { Accept: 'application/json, text/plain;q=0.9, */*;q=0.8' } });
    const rawText = await response.text();
    let body;
    try { body = rawText ? JSON.parse(rawText) : null; } catch { body = null; }
    const duration = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      httpStatusError = true;
      const detail = formatResponse(body, rawText);
      throw new Error(`HTTP ${response.status} ${response.statusText}${detail ? `\n${detail}` : ''}`);
    }

    statusLabel.textContent = `成功 · ${response.status}`;
    statusLabel.dataset.state = 'success';
    responseMeta.textContent = `GET ${requestUrl.href} · ${duration} ms`;
    responseOutput.textContent = formatResponse(body, rawText);
    responseOutput.dataset.state = 'success';
  } catch (error) {
    statusLabel.textContent = httpStatusError ? 'HTTP エラー' : '通信エラー';
    statusLabel.dataset.state = 'error';
    responseMeta.textContent = `GET ${requestUrl.href}`;
    responseOutput.textContent = !httpStatusError && error instanceof TypeError
      ? `API に接続できませんでした。バックエンドが起動しているか、CORS の設定を確認してください。\n\n${error.message}`
      : error.message;
    responseOutput.dataset.state = 'error';
  } finally {
    buttons.forEach((runButton) => { runButton.disabled = false; });
    button.querySelector('span:first-child').textContent = '実行';
  }
}

buttons.forEach((button) => button.addEventListener('click', () => runEndpoint(button)));
