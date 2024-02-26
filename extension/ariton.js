'use strict';

/**
 * Ariton Server に URL を送信する。
 *
 * @param {string|URL} aritonURL - Ariton Server の URL
 * @param {string|URL} pageURL - 送信するページの URL
 * @returns {Promise<Response>}
 */
async function
sendURL(aritonURL, pageURL)
{
    const url = new URL(pageURL);
    const data = {
        url: url.toJSON(),
    };

    return await fetch(new URL(aritonURL), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

/**
 * Ariton Server から URL を受信する。
 *
 * @param {string|URL} aritonURL - Ariton Server の URL
 * @returns {Promise<URL>} ページの URL
 */
async function
recvURL(aritonURL)
{
    const res = await fetch(aritonURL);
    const data = await res.json();
    return new URL(data.url);
}

/**
 * ブラウザに保存されている Ariton Server の URL を取得する。
 *
 * @returns {Promise<URL|string>} Ariton Server の URL か空文字列
 */
async function
getAritonURL()
{
    const { aritonURL } = await chrome.storage.local.get([ 'aritonURL' ]);
    return aritonURL && new URL(aritonURL) || '';
}

/**
 * ブラウザに Ariton Server の URL を保存する。
 *
 * @param {string|URL} aritonURL - Ariton Server の URL
 * @returns {Promise<void>}
 */
async function
setAritonURL(aritonURL)
{
    const url = new URL(aritonURL);
    return await chrome.storage.local.set({ aritonURL: url.toJSON() });
}

/**
 * 開いているタブを Ariton Server に送信する。
 *
 * @param {Event} ev - イベント
 */
async function
handleSend(ev)
{
    ev.target.disabled = true;
    try {
        ev.preventDefault();
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        const pageURL = tabs[0].url;
        const aritonURL = await getAritonURL();
        await sendURL(aritonURL, pageURL);
    } catch (err) {
        console.error(err);
        // TODO: handling
    }
    ev.target.disabled = false;
}
btnSend.addEventListener('click', handleSend);

/**
 * Ariton Server から URL を受信して新しいタブで開く。
 *
 * @param {Event} ev - イベント
 */
async function
handleRecv(ev)
{
    ev.target.disabled = true;
    try {
        ev.preventDefault();
        const aritonURL = await getAritonURL();
        const pageURL = await recvURL(aritonURL);
        await chrome.tabs.create({
            url: pageURL.toString(),
        });
    } catch (err) {
        console.error(err);
        // TODO: handling
    }
    ev.target.disabled = false;
}
btnRecv.addEventListener('click', handleRecv);

/**
 * Ariton Server の URL を更新する。
 *
 * @param {Event} ev - イベント
 */
async function
handleSetting(ev)
{
    ev.target.disabled = true;
    try {
        ev.preventDefault();
        await setAritonURL(new URL(inputAritonURL.value));
    } catch (err) {
        console.error(err);
        // TODO: handling
    }
    ev.target.disabled = false;
}
btnUpdate.addEventListener('click', handleSetting);

/**
 * 拡張機能を初期化する。
 *
 * @param {Event} ev - イベント
 */
async function
handleInit(ev)
{
    try {
        const aritonURL = await getAritonURL();
        inputAritonURL.value = aritonURL.toString();
    } catch (err) {
        console.error(err);
        // TODO: handling
    }
}
window.addEventListener('DOMContentLoaded', handleInit);
