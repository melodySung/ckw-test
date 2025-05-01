// ==UserScript==
// @name         Mock All IP Check & Blockify Interfaces
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Mock Cloudflare and Blockify interfaces to bypass anti-bot detection on ckw.jp site.
// @author       You
// @match        https://*.chiikawamarket.jp/*
// @match        https://chiikawamarket.jp/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const INJECT_SCRIPT = `
        (function () {
            const MOCKS = {
                "/block/check-auto": {
                    autoBlock: false,
                    ip: "126.77.89.142"
                },
                "/block/check-ip": {
                    isBlock: false,
                    ip: "126.77.89.142"
                }
            };

            function matchMockUrl(url) {
                for (const key in MOCKS) {
                    if (url.includes(key)) return MOCKS[key];
                }
                return null;
            }

            const originalOpen = XMLHttpRequest.prototype.open;
            const originalSend = XMLHttpRequest.prototype.send;

            XMLHttpRequest.prototype.open = function(method, url) {
                this._mockData = matchMockUrl(url);
                return originalOpen.apply(this, arguments);
            };

            XMLHttpRequest.prototype.send = function() {
                if (this._mockData) {
                    this.addEventListener('readystatechange', function() {
                        if (this.readyState === 4) {
                            Object.defineProperty(this, 'responseText', {
                                get: () => JSON.stringify(this._mockData)
                            });
                            Object.defineProperty(this, 'response', {
                                get: () => JSON.stringify(this._mockData)
                            });
                        }
                    });
                }
                return originalSend.apply(this, arguments);
            };

            const originalJson = Response.prototype.json;
            Response.prototype.json = function() {
                const mockData = matchMockUrl(this.url);
                if (mockData) {
                    console.log('[inject-mock] intercepted fetch to', this.url);
                    return Promise.resolve(mockData);
                }
                return originalJson.apply(this, arguments);
            };
        })();
    `;

    const script = document.createElement('script');
    script.textContent = INJECT_SCRIPT;
    document.documentElement.appendChild(script);
})();
