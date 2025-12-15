import { n as __require, t as __export } from "../_/rolldown-runtime.mjs";
import nodeHTTP from "node:http";
import { Readable } from "node:stream";
import nodeHTTPS from "node:https";
import nodeHTTP2 from "node:http2";
import require$$0$2 from "stream";
import require$$0$3 from "events";
import require$$2 from "http";
import require$$1 from "crypto";
import require$$0$1 from "buffer";
import require$$0 from "zlib";
import require$$1$1 from "https";
import require$$3 from "net";
import require$$4 from "tls";
import require$$7 from "url";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import path, { dirname, resolve } from "node:path";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { and, desc, eq, gte, lte, relations } from "drizzle-orm";
import { z } from "zod";
import { createMiddleware } from "hono/factory";
import { isDevelopment } from "std-env";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
var services = {};
globalThis.__nitro_vite_envs__ = services;
function lazyInherit(target, source, sourceKey) {
	for (const key$1 of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
		if (key$1 === "constructor") continue;
		const targetDesc = Object.getOwnPropertyDescriptor(target, key$1);
		const desc$1 = Object.getOwnPropertyDescriptor(source, key$1);
		let modified = false;
		if (desc$1.get) {
			modified = true;
			desc$1.get = targetDesc?.get || function() {
				return this[sourceKey][key$1];
			};
		}
		if (desc$1.set) {
			modified = true;
			desc$1.set = targetDesc?.set || function(value) {
				this[sourceKey][key$1] = value;
			};
		}
		if (!targetDesc?.value && typeof desc$1.value === "function") {
			modified = true;
			desc$1.value = function(...args) {
				return this[sourceKey][key$1](...args);
			};
		}
		if (modified) Object.defineProperty(target, key$1, desc$1);
	}
}
var FastURL = /* @__PURE__ */ (() => {
	const NativeURL = globalThis.URL;
	const FastURL$1 = class URL$1 {
		#url;
		#href;
		#protocol;
		#host;
		#pathname;
		#search;
		#searchParams;
		#pos;
		constructor(url) {
			if (typeof url === "string") this.#href = url;
			else {
				this.#protocol = url.protocol;
				this.#host = url.host;
				this.#pathname = url.pathname;
				this.#search = url.search;
			}
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeURL;
		}
		get _url() {
			if (this.#url) return this.#url;
			this.#url = new NativeURL(this.href);
			this.#href = void 0;
			this.#protocol = void 0;
			this.#host = void 0;
			this.#pathname = void 0;
			this.#search = void 0;
			this.#searchParams = void 0;
			this.#pos = void 0;
			return this.#url;
		}
		get href() {
			if (this.#url) return this.#url.href;
			if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
			return this.#href;
		}
		#getPos() {
			if (!this.#pos) {
				const url = this.href;
				const protoIndex = url.indexOf("://");
				const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
				this.#pos = [
					protoIndex,
					pathnameIndex,
					pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex)
				];
			}
			return this.#pos;
		}
		get pathname() {
			if (this.#url) return this.#url.pathname;
			if (this.#pathname === void 0) {
				const [, pathnameIndex, queryIndex] = this.#getPos();
				if (pathnameIndex === -1) return this._url.pathname;
				this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
			}
			return this.#pathname;
		}
		get search() {
			if (this.#url) return this.#url.search;
			if (this.#search === void 0) {
				const [, pathnameIndex, queryIndex] = this.#getPos();
				if (pathnameIndex === -1) return this._url.search;
				const url = this.href;
				this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
			}
			return this.#search;
		}
		get searchParams() {
			if (this.#url) return this.#url.searchParams;
			if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
			return this.#searchParams;
		}
		get protocol() {
			if (this.#url) return this.#url.protocol;
			if (this.#protocol === void 0) {
				const [protocolIndex] = this.#getPos();
				if (protocolIndex === -1) return this._url.protocol;
				this.#protocol = this.href.slice(0, protocolIndex + 1);
			}
			return this.#protocol;
		}
		toString() {
			return this.href;
		}
		toJSON() {
			return this.href;
		}
	};
	lazyInherit(FastURL$1.prototype, NativeURL.prototype, "_url");
	Object.setPrototypeOf(FastURL$1.prototype, NativeURL.prototype);
	Object.setPrototypeOf(FastURL$1, NativeURL);
	return FastURL$1;
})();
function resolvePortAndHost(opts) {
	const _port = opts.port ?? globalThis.process?.env.PORT ?? 3e3;
	const port$2 = typeof _port === "number" ? _port : Number.parseInt(_port, 10);
	if (port$2 < 0 || port$2 > 65535) throw new RangeError(`Port must be between 0 and 65535 (got "${port$2}").`);
	return {
		port: port$2,
		hostname: opts.hostname ?? globalThis.process?.env.HOST
	};
}
function fmtURL(host$1, port$2, secure) {
	if (!host$1 || !port$2) return;
	if (host$1.includes(":")) host$1 = `[${host$1}]`;
	return `http${secure ? "s" : ""}://${host$1}:${port$2}/`;
}
function printListening(opts, url) {
	if (!url || (opts.silent ?? globalThis.process?.env?.TEST)) return;
	const _url = new URL(url);
	const allInterfaces = _url.hostname === "[::]" || _url.hostname === "0.0.0.0";
	if (allInterfaces) {
		_url.hostname = "localhost";
		url = _url.href;
	}
	let listeningOn = `➜ Listening on:`;
	let additionalInfo = allInterfaces ? " (all interfaces)" : "";
	if (globalThis.process.stdout?.isTTY) {
		listeningOn = `\u001B[32m${listeningOn}\u001B[0m`;
		url = `\u001B[36m${url}\u001B[0m`;
		additionalInfo = `\u001B[2m${additionalInfo}\u001B[0m`;
	}
	console.log(`${listeningOn} ${url}${additionalInfo}`);
}
function resolveTLSOptions(opts) {
	if (!opts.tls || opts.protocol === "http") return;
	const cert$1 = resolveCertOrKey(opts.tls.cert);
	const key$1 = resolveCertOrKey(opts.tls.key);
	if (!cert$1 && !key$1) {
		if (opts.protocol === "https") throw new TypeError("TLS `cert` and `key` must be provided for `https` protocol.");
		return;
	}
	if (!cert$1 || !key$1) throw new TypeError("TLS `cert` and `key` must be provided together.");
	return {
		cert: cert$1,
		key: key$1,
		passphrase: opts.tls.passphrase
	};
}
function resolveCertOrKey(value) {
	if (!value) return;
	if (typeof value !== "string") throw new TypeError("TLS certificate and key must be strings in PEM format or file paths.");
	if (value.startsWith("-----BEGIN ")) return value;
	const { readFileSync } = process.getBuiltinModule("node:fs");
	return readFileSync(value, "utf8");
}
function createWaitUntil() {
	const promises$1 = /* @__PURE__ */ new Set();
	return {
		waitUntil: (promise) => {
			if (typeof promise?.then !== "function") return;
			promises$1.add(Promise.resolve(promise).catch(console.error).finally(() => {
				promises$1.delete(promise);
			}));
		},
		wait: () => {
			return Promise.all(promises$1);
		}
	};
}
var noColor = /* @__PURE__ */ (() => {
	const env = globalThis.process?.env ?? {};
	return env.NO_COLOR === "1" || env.TERM === "dumb";
})();
var _c = (c, r$1 = 39) => (t) => noColor ? t : `\u001B[${c}m${t}\u001B[${r$1}m`;
var red = /* @__PURE__ */ _c(31);
var gray = /* @__PURE__ */ _c(90);
function wrapFetch(server$1) {
	const fetchHandler = server$1.options.fetch;
	const middleware = server$1.options.middleware || [];
	return middleware.length === 0 ? fetchHandler : (request) => callMiddleware$1(request, fetchHandler, middleware, 0);
}
function callMiddleware$1(request, fetchHandler, middleware, index$1) {
	if (index$1 === middleware.length) return fetchHandler(request);
	return middleware[index$1](request, () => callMiddleware$1(request, fetchHandler, middleware, index$1 + 1));
}
var errorPlugin = (server$1) => {
	const errorHandler$1 = server$1.options.error;
	if (!errorHandler$1) return;
	server$1.options.middleware.unshift((_req, next) => {
		try {
			const res = next();
			return res instanceof Promise ? res.catch((error) => errorHandler$1(error)) : res;
		} catch (error) {
			return errorHandler$1(error);
		}
	});
};
var gracefulShutdownPlugin = (server$1) => {
	const config = server$1.options?.gracefulShutdown;
	if (!globalThis.process?.on || config === false || config === void 0 && (process.env.CI || process.env.TEST)) return;
	const gracefulShutdown = config === true || !config?.gracefulTimeout ? Number.parseInt(process.env.SERVER_SHUTDOWN_TIMEOUT || "") || 3 : config.gracefulTimeout;
	const forceShutdown = config === true || !config?.forceTimeout ? Number.parseInt(process.env.SERVER_FORCE_SHUTDOWN_TIMEOUT || "") || 5 : config.forceTimeout;
	let isShuttingDown = false;
	const shutdown = async () => {
		if (isShuttingDown) return;
		isShuttingDown = true;
		const w = process.stderr.write.bind(process.stderr);
		w(gray(`\nShutting down server in ${gracefulShutdown}s...`));
		let timeout;
		await Promise.race([server$1.close().finally(() => {
			clearTimeout(timeout);
			w(gray(" Server closed.\n"));
		}), new Promise((resolve$1) => {
			timeout = setTimeout(() => {
				w(gray(`\nForce closing connections in ${forceShutdown}s...`));
				timeout = setTimeout(() => {
					w(red("\nCould not close connections in time, force exiting."));
					resolve$1();
				}, forceShutdown * 1e3);
				return server$1.close(true);
			}, gracefulShutdown * 1e3);
		})]);
		globalThis.process.exit(0);
	};
	for (const sig of ["SIGINT", "SIGTERM"]) globalThis.process.on(sig, shutdown);
};
var NodeResponse = /* @__PURE__ */ (() => {
	const NativeResponse = globalThis.Response;
	const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
	class NodeResponse$1 {
		#body;
		#init;
		#headers;
		#response;
		constructor(body, init) {
			this.#body = body;
			this.#init = init;
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeResponse;
		}
		get status() {
			return this.#response?.status || this.#init?.status || 200;
		}
		get statusText() {
			return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
		}
		get headers() {
			if (this.#response) return this.#response.headers;
			if (this.#headers) return this.#headers;
			const initHeaders = this.#init?.headers;
			return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
		}
		get ok() {
			if (this.#response) return this.#response.ok;
			const status = this.status;
			return status >= 200 && status < 300;
		}
		get _response() {
			if (this.#response) return this.#response;
			this.#response = new NativeResponse(this.#body, this.#headers ? {
				...this.#init,
				headers: this.#headers
			} : this.#init);
			this.#init = void 0;
			this.#headers = void 0;
			this.#body = void 0;
			return this.#response;
		}
		_toNodeResponse() {
			const status = this.status;
			const statusText = this.statusText;
			let body;
			let contentType;
			let contentLength;
			if (this.#response) body = this.#response.body;
			else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
			else if (typeof this.#body === "string") {
				body = this.#body;
				contentType = "text/plain; charset=UTF-8";
				contentLength = Buffer.byteLength(this.#body);
			} else if (this.#body instanceof ArrayBuffer) {
				body = Buffer.from(this.#body);
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof Uint8Array) {
				body = this.#body;
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof DataView) {
				body = Buffer.from(this.#body.buffer);
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof Blob) {
				body = this.#body.stream();
				contentType = this.#body.type;
				contentLength = this.#body.size;
			} else if (typeof this.#body.pipe === "function") body = this.#body;
			else body = this._response.body;
			const headers$1 = [];
			const initHeaders = this.#init?.headers;
			const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k, v]) => [k.toLowerCase(), v]) : void 0);
			let hasContentTypeHeader;
			let hasContentLength;
			if (headerEntries) for (const [key$1, value] of headerEntries) {
				if (Array.isArray(value)) for (const v of value) headers$1.push([key$1, v]);
				else headers$1.push([key$1, value]);
				if (key$1 === "content-type") hasContentTypeHeader = true;
				else if (key$1 === "content-length") hasContentLength = true;
			}
			if (contentType && !hasContentTypeHeader) headers$1.push(["content-type", contentType]);
			if (contentLength && !hasContentLength) headers$1.push(["content-length", String(contentLength)]);
			this.#init = void 0;
			this.#headers = void 0;
			this.#response = void 0;
			this.#body = void 0;
			return {
				status,
				statusText,
				headers: headers$1,
				body
			};
		}
	}
	lazyInherit(NodeResponse$1.prototype, NativeResponse.prototype, "_response");
	Object.setPrototypeOf(NodeResponse$1, NativeResponse);
	Object.setPrototypeOf(NodeResponse$1.prototype, NativeResponse.prototype);
	return NodeResponse$1;
})();
async function sendNodeResponse(nodeRes, webRes) {
	if (!webRes) {
		nodeRes.statusCode = 500;
		return endNodeResponse(nodeRes);
	}
	if (webRes._toNodeResponse) {
		const res = webRes._toNodeResponse();
		writeHead(nodeRes, res.status, res.statusText, res.headers);
		if (res.body) {
			if (res.body instanceof ReadableStream) return streamBody(res.body, nodeRes);
			else if (typeof res.body?.pipe === "function") {
				res.body.pipe(nodeRes);
				return new Promise((resolve$1) => nodeRes.on("close", resolve$1));
			}
			nodeRes.write(res.body);
		}
		return endNodeResponse(nodeRes);
	}
	const rawHeaders = [...webRes.headers];
	writeHead(nodeRes, webRes.status, webRes.statusText, rawHeaders);
	return webRes.body ? streamBody(webRes.body, nodeRes) : endNodeResponse(nodeRes);
}
function writeHead(nodeRes, status, statusText, rawHeaders) {
	const writeHeaders = globalThis.Deno ? rawHeaders : rawHeaders.flat();
	if (!nodeRes.headersSent) if (nodeRes.req?.httpVersion === "2.0") nodeRes.writeHead(status, writeHeaders);
	else nodeRes.writeHead(status, statusText, writeHeaders);
}
function endNodeResponse(nodeRes) {
	return new Promise((resolve$1) => nodeRes.end(resolve$1));
}
function streamBody(stream$1, nodeRes) {
	if (nodeRes.destroyed) {
		stream$1.cancel();
		return;
	}
	const reader = stream$1.getReader();
	function streamCancel(error) {
		reader.cancel(error).catch(() => {});
		if (error) nodeRes.destroy(error);
	}
	function streamHandle({ done, value }) {
		try {
			if (done) nodeRes.end();
			else if (nodeRes.write(value)) reader.read().then(streamHandle, streamCancel);
			else nodeRes.once("drain", () => reader.read().then(streamHandle, streamCancel));
		} catch (error) {
			streamCancel(error instanceof Error ? error : void 0);
		}
	}
	nodeRes.on("close", streamCancel);
	nodeRes.on("error", streamCancel);
	reader.read().then(streamHandle, streamCancel);
	return reader.closed.catch(streamCancel).finally(() => {
		nodeRes.off("close", streamCancel);
		nodeRes.off("error", streamCancel);
	});
}
var NodeRequestURL = class extends FastURL {
	#req;
	constructor({ req }) {
		const path$1 = req.url || "/";
		if (path$1[0] === "/") {
			const qIndex = path$1.indexOf("?");
			const pathname = qIndex === -1 ? path$1 : path$1?.slice(0, qIndex) || "/";
			const search = qIndex === -1 ? "" : path$1?.slice(qIndex) || "";
			const host$1 = req.headers.host || req.headers[":authority"] || `${req.socket.localFamily === "IPv6" ? "[" + req.socket.localAddress + "]" : req.socket.localAddress}:${req.socket?.localPort || "80"}`;
			const protocol = req.socket?.encrypted || req.headers["x-forwarded-proto"] === "https" || req.headers[":scheme"] === "https" ? "https:" : "http:";
			super({
				protocol,
				host: host$1,
				pathname,
				search
			});
		} else super(path$1);
		this.#req = req;
	}
	get pathname() {
		return super.pathname;
	}
	set pathname(value) {
		this._url.pathname = value;
		this.#req.url = this._url.pathname + this._url.search;
	}
};
var NodeRequestHeaders = /* @__PURE__ */ (() => {
	const NativeHeaders = globalThis.Headers;
	class Headers$1 {
		#req;
		#headers;
		constructor(req) {
			this.#req = req;
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeHeaders;
		}
		get _headers() {
			if (!this.#headers) {
				const headers$1 = new NativeHeaders();
				const rawHeaders = this.#req.rawHeaders;
				const len = rawHeaders.length;
				for (let i = 0; i < len; i += 2) {
					const key$1 = rawHeaders[i];
					if (key$1.charCodeAt(0) === 58) continue;
					const value = rawHeaders[i + 1];
					headers$1.append(key$1, value);
				}
				this.#headers = headers$1;
			}
			return this.#headers;
		}
		get(name) {
			if (this.#headers) return this.#headers.get(name);
			const value = this.#req.headers[name.toLowerCase()];
			return Array.isArray(value) ? value.join(", ") : value || null;
		}
		has(name) {
			if (this.#headers) return this.#headers.has(name);
			return name.toLowerCase() in this.#req.headers;
		}
		getSetCookie() {
			if (this.#headers) return this.#headers.getSetCookie();
			const value = this.#req.headers["set-cookie"];
			return Array.isArray(value) ? value : value ? [value] : [];
		}
		*_entries() {
			const rawHeaders = this.#req.rawHeaders;
			const len = rawHeaders.length;
			for (let i = 0; i < len; i += 2) {
				const key$1 = rawHeaders[i];
				if (key$1.charCodeAt(0) === 58) continue;
				yield [key$1.toLowerCase(), rawHeaders[i + 1]];
			}
		}
		entries() {
			return this.#headers ? this.#headers.entries() : this._entries();
		}
		[Symbol.iterator]() {
			return this.entries();
		}
	}
	lazyInherit(Headers$1.prototype, NativeHeaders.prototype, "_headers");
	Object.setPrototypeOf(Headers$1, NativeHeaders);
	Object.setPrototypeOf(Headers$1.prototype, NativeHeaders.prototype);
	return Headers$1;
})();
var NodeRequest = /* @__PURE__ */ (() => {
	const NativeRequest = globalThis[Symbol.for("srvx.nativeRequest")] ??= globalThis.Request;
	const PatchedRequest = class Request$1$1 extends NativeRequest {
		static _srvx = true;
		static [Symbol.hasInstance](instance) {
			if (this === PatchedRequest) return instance instanceof NativeRequest;
			else return Object.prototype.isPrototypeOf.call(this.prototype, instance);
		}
		constructor(input, options) {
			if (typeof input === "object" && "_request" in input) input = input._request;
			if ((options?.body)?.getReader !== void 0) options.duplex ??= "half";
			super(input, options);
		}
	};
	if (!globalThis.Request._srvx) globalThis.Request = PatchedRequest;
	class Request$1 {
		runtime;
		#req;
		#url;
		#bodyStream;
		#request;
		#headers;
		#abortController;
		constructor(ctx) {
			this.#req = ctx.req;
			this.runtime = {
				name: "node",
				node: ctx
			};
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeRequest;
		}
		get ip() {
			return this.#req.socket?.remoteAddress;
		}
		get method() {
			if (this.#request) return this.#request.method;
			return this.#req.method || "GET";
		}
		get _url() {
			return this.#url ||= new NodeRequestURL({ req: this.#req });
		}
		set _url(url) {
			this.#url = url;
		}
		get url() {
			if (this.#request) return this.#request.url;
			return this._url.href;
		}
		get headers() {
			if (this.#request) return this.#request.headers;
			return this.#headers ||= new NodeRequestHeaders(this.#req);
		}
		get _abortController() {
			if (!this.#abortController) {
				this.#abortController = new AbortController();
				const { req, res } = this.runtime.node;
				const abortController = this.#abortController;
				const abort = (err) => abortController.abort?.(err);
				req.once("error", abort);
				if (res) res.once("close", () => {
					const reqError = req.errored;
					if (reqError) abort(reqError);
					else if (!res.writableEnded) abort();
				});
				else req.once("close", () => {
					if (!req.complete) abort();
				});
			}
			return this.#abortController;
		}
		get signal() {
			return this.#request ? this.#request.signal : this._abortController.signal;
		}
		get body() {
			if (this.#request) return this.#request.body;
			if (this.#bodyStream === void 0) {
				const method = this.method;
				this.#bodyStream = !(method === "GET" || method === "HEAD") ? Readable.toWeb(this.#req) : null;
			}
			return this.#bodyStream;
		}
		text() {
			if (this.#request) return this.#request.text();
			if (this.#bodyStream !== void 0) return this.#bodyStream ? new Response(this.#bodyStream).text() : Promise.resolve("");
			return readBody(this.#req).then((buf) => buf.toString());
		}
		json() {
			if (this.#request) return this.#request.json();
			return this.text().then((text$1) => JSON.parse(text$1));
		}
		get _request() {
			if (!this.#request) {
				this.#request = new PatchedRequest(this.url, {
					method: this.method,
					headers: this.headers,
					body: this.body,
					signal: this._abortController.signal
				});
				this.#headers = void 0;
				this.#bodyStream = void 0;
			}
			return this.#request;
		}
	}
	lazyInherit(Request$1.prototype, NativeRequest.prototype, "_request");
	Object.setPrototypeOf(Request$1.prototype, NativeRequest.prototype);
	return Request$1;
})();
function readBody(req) {
	return new Promise((resolve$1, reject) => {
		const chunks = [];
		const onData = (chunk) => {
			chunks.push(chunk);
		};
		const onError = (err) => {
			reject(err);
		};
		const onEnd = () => {
			req.off("error", onError);
			req.off("data", onData);
			resolve$1(Buffer.concat(chunks));
		};
		req.on("data", onData).once("end", onEnd).once("error", onError);
	});
}
function serve(options) {
	return new NodeServer(options);
}
var NodeServer = class {
	runtime = "node";
	options;
	node;
	serveOptions;
	fetch;
	#isSecure;
	#listeningPromise;
	#wait;
	constructor(options) {
		this.options = {
			...options,
			middleware: [...options.middleware || []]
		};
		for (const plugin of options.plugins || []) plugin(this);
		errorPlugin(this);
		gracefulShutdownPlugin(this);
		const fetchHandler = this.fetch = wrapFetch(this);
		this.#wait = createWaitUntil();
		const handler = (nodeReq, nodeRes) => {
			const request = new NodeRequest({
				req: nodeReq,
				res: nodeRes
			});
			request.waitUntil = this.#wait.waitUntil;
			const res = fetchHandler(request);
			return res instanceof Promise ? res.then((resolvedRes) => sendNodeResponse(nodeRes, resolvedRes)) : sendNodeResponse(nodeRes, res);
		};
		const tls = resolveTLSOptions(this.options);
		const { port: port$2, hostname: host$1 } = resolvePortAndHost(this.options);
		this.serveOptions = {
			port: port$2,
			host: host$1,
			exclusive: !this.options.reusePort,
			...tls ? {
				cert: tls.cert,
				key: tls.key,
				passphrase: tls.passphrase
			} : {},
			...this.options.node
		};
		let server$1;
		this.#isSecure = !!this.serveOptions.cert && this.options.protocol !== "http";
		if (this.options.node?.http2 ?? this.#isSecure) if (this.#isSecure) server$1 = nodeHTTP2.createSecureServer({
			allowHTTP1: true,
			...this.serveOptions
		}, handler);
		else throw new Error("node.http2 option requires tls certificate!");
		else if (this.#isSecure) server$1 = nodeHTTPS.createServer(this.serveOptions, handler);
		else server$1 = nodeHTTP.createServer(this.serveOptions, handler);
		this.node = {
			server: server$1,
			handler
		};
		if (!options.manual) this.serve();
	}
	serve() {
		if (this.#listeningPromise) return Promise.resolve(this.#listeningPromise).then(() => this);
		this.#listeningPromise = new Promise((resolve$1) => {
			this.node.server.listen(this.serveOptions, () => {
				printListening(this.options, this.url);
				resolve$1();
			});
		});
	}
	get url() {
		const addr = this.node?.server?.address();
		if (!addr) return;
		return typeof addr === "string" ? addr : fmtURL(addr.address, addr.port, this.#isSecure);
	}
	ready() {
		return Promise.resolve(this.#listeningPromise).then(() => this);
	}
	async close(closeAll) {
		await Promise.all([this.#wait.wait(), new Promise((resolve$1, reject) => {
			const server$1 = this.node?.server;
			if (!server$1) return resolve$1();
			if (closeAll && "closeAllConnections" in server$1) server$1.closeAllConnections();
			server$1.close((error) => error ? reject(error) : resolve$1());
		})]);
	}
};
Symbol.toPrimitive;
Symbol.toPrimitive, Symbol.toStringTag;
Error;
var bufferUtil = { exports: {} };
var constants;
var hasRequiredConstants;
function requireConstants() {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;
	const BINARY_TYPES = [
		"nodebuffer",
		"arraybuffer",
		"fragments"
	];
	const hasBlob = typeof Blob !== "undefined";
	if (hasBlob) BINARY_TYPES.push("blob");
	constants = {
		BINARY_TYPES,
		EMPTY_BUFFER: Buffer.alloc(0),
		GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
		hasBlob,
		kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
		kListener: Symbol("kListener"),
		kStatusCode: Symbol("status-code"),
		kWebSocket: Symbol("websocket"),
		NOOP: () => {}
	};
	return constants;
}
var hasRequiredBufferUtil;
function requireBufferUtil() {
	if (hasRequiredBufferUtil) return bufferUtil.exports;
	hasRequiredBufferUtil = 1;
	const { EMPTY_BUFFER } = requireConstants();
	const FastBuffer = Buffer[Symbol.species];
	function concat(list, totalLength) {
		if (list.length === 0) return EMPTY_BUFFER;
		if (list.length === 1) return list[0];
		const target = Buffer.allocUnsafe(totalLength);
		let offset = 0;
		for (let i = 0; i < list.length; i++) {
			const buf = list[i];
			target.set(buf, offset);
			offset += buf.length;
		}
		if (offset < totalLength) return new FastBuffer(target.buffer, target.byteOffset, offset);
		return target;
	}
	function _mask(source, mask, output, offset, length) {
		for (let i = 0; i < length; i++) output[offset + i] = source[i] ^ mask[i & 3];
	}
	function _unmask(buffer, mask) {
		for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
	}
	function toArrayBuffer(buf) {
		if (buf.length === buf.buffer.byteLength) return buf.buffer;
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
	}
	function toBuffer(data) {
		toBuffer.readOnly = true;
		if (Buffer.isBuffer(data)) return data;
		let buf;
		if (data instanceof ArrayBuffer) buf = new FastBuffer(data);
		else if (ArrayBuffer.isView(data)) buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
		else {
			buf = Buffer.from(data);
			toBuffer.readOnly = false;
		}
		return buf;
	}
	bufferUtil.exports = {
		concat,
		mask: _mask,
		toArrayBuffer,
		toBuffer,
		unmask: _unmask
	};
	/* istanbul ignore else  */
	if (!process.env.WS_NO_BUFFER_UTIL) try {
		const bufferUtil$1 = __require("bufferutil");
		bufferUtil.exports.mask = function(source, mask, output, offset, length) {
			if (length < 48) _mask(source, mask, output, offset, length);
			else bufferUtil$1.mask(source, mask, output, offset, length);
		};
		bufferUtil.exports.unmask = function(buffer, mask) {
			if (buffer.length < 32) _unmask(buffer, mask);
			else bufferUtil$1.unmask(buffer, mask);
		};
	} catch (e) {}
	return bufferUtil.exports;
}
var limiter;
var hasRequiredLimiter;
function requireLimiter() {
	if (hasRequiredLimiter) return limiter;
	hasRequiredLimiter = 1;
	const kDone = Symbol("kDone");
	const kRun = Symbol("kRun");
	class Limiter {
		constructor(concurrency) {
			this[kDone] = () => {
				this.pending--;
				this[kRun]();
			};
			this.concurrency = concurrency || Infinity;
			this.jobs = [];
			this.pending = 0;
		}
		add(job) {
			this.jobs.push(job);
			this[kRun]();
		}
		[kRun]() {
			if (this.pending === this.concurrency) return;
			if (this.jobs.length) {
				const job = this.jobs.shift();
				this.pending++;
				job(this[kDone]);
			}
		}
	}
	limiter = Limiter;
	return limiter;
}
var permessageDeflate;
var hasRequiredPermessageDeflate;
function requirePermessageDeflate() {
	if (hasRequiredPermessageDeflate) return permessageDeflate;
	hasRequiredPermessageDeflate = 1;
	const zlib = require$$0;
	const bufferUtil$1 = requireBufferUtil();
	const Limiter = requireLimiter();
	const { kStatusCode } = requireConstants();
	const FastBuffer = Buffer[Symbol.species];
	const TRAILER = Buffer.from([
		0,
		0,
		255,
		255
	]);
	const kPerMessageDeflate = Symbol("permessage-deflate");
	const kTotalLength = Symbol("total-length");
	const kCallback = Symbol("callback");
	const kBuffers = Symbol("buffers");
	const kError = Symbol("error");
	let zlibLimiter;
	class PerMessageDeflate {
		constructor(options, isServer, maxPayload) {
			this._maxPayload = maxPayload | 0;
			this._options = options || {};
			this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
			this._isServer = !!isServer;
			this._deflate = null;
			this._inflate = null;
			this.params = null;
			if (!zlibLimiter) zlibLimiter = new Limiter(this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10);
		}
		static get extensionName() {
			return "permessage-deflate";
		}
		offer() {
			const params = {};
			if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
			if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
			if (this._options.serverMaxWindowBits) params.server_max_window_bits = this._options.serverMaxWindowBits;
			if (this._options.clientMaxWindowBits) params.client_max_window_bits = this._options.clientMaxWindowBits;
			else if (this._options.clientMaxWindowBits == null) params.client_max_window_bits = true;
			return params;
		}
		accept(configurations) {
			configurations = this.normalizeParams(configurations);
			this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
			return this.params;
		}
		cleanup() {
			if (this._inflate) {
				this._inflate.close();
				this._inflate = null;
			}
			if (this._deflate) {
				const callback = this._deflate[kCallback];
				this._deflate.close();
				this._deflate = null;
				if (callback) callback(/* @__PURE__ */ new Error("The deflate stream was closed while data was being processed"));
			}
		}
		acceptAsServer(offers) {
			const opts = this._options;
			const accepted = offers.find((params) => {
				if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) return false;
				return true;
			});
			if (!accepted) throw new Error("None of the extension offers can be accepted");
			if (opts.serverNoContextTakeover) accepted.server_no_context_takeover = true;
			if (opts.clientNoContextTakeover) accepted.client_no_context_takeover = true;
			if (typeof opts.serverMaxWindowBits === "number") accepted.server_max_window_bits = opts.serverMaxWindowBits;
			if (typeof opts.clientMaxWindowBits === "number") accepted.client_max_window_bits = opts.clientMaxWindowBits;
			else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) delete accepted.client_max_window_bits;
			return accepted;
		}
		acceptAsClient(response) {
			const params = response[0];
			if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) throw new Error("Unexpected parameter \"client_no_context_takeover\"");
			if (!params.client_max_window_bits) {
				if (typeof this._options.clientMaxWindowBits === "number") params.client_max_window_bits = this._options.clientMaxWindowBits;
			} else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
			return params;
		}
		normalizeParams(configurations) {
			configurations.forEach((params) => {
				Object.keys(params).forEach((key$1) => {
					let value = params[key$1];
					if (value.length > 1) throw new Error(`Parameter "${key$1}" must have only a single value`);
					value = value[0];
					if (key$1 === "client_max_window_bits") {
						if (value !== true) {
							const num = +value;
							if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key$1}": ${value}`);
							value = num;
						} else if (!this._isServer) throw new TypeError(`Invalid value for parameter "${key$1}": ${value}`);
					} else if (key$1 === "server_max_window_bits") {
						const num = +value;
						if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key$1}": ${value}`);
						value = num;
					} else if (key$1 === "client_no_context_takeover" || key$1 === "server_no_context_takeover") {
						if (value !== true) throw new TypeError(`Invalid value for parameter "${key$1}": ${value}`);
					} else throw new Error(`Unknown parameter "${key$1}"`);
					params[key$1] = value;
				});
			});
			return configurations;
		}
		decompress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._decompress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		compress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._compress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		_decompress(data, fin, callback) {
			const endpoint = this._isServer ? "client" : "server";
			if (!this._inflate) {
				const key$1 = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key$1] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key$1];
				this._inflate = zlib.createInflateRaw({
					...this._options.zlibInflateOptions,
					windowBits
				});
				this._inflate[kPerMessageDeflate] = this;
				this._inflate[kTotalLength] = 0;
				this._inflate[kBuffers] = [];
				this._inflate.on("error", inflateOnError);
				this._inflate.on("data", inflateOnData);
			}
			this._inflate[kCallback] = callback;
			this._inflate.write(data);
			if (fin) this._inflate.write(TRAILER);
			this._inflate.flush(() => {
				const err = this._inflate[kError];
				if (err) {
					this._inflate.close();
					this._inflate = null;
					callback(err);
					return;
				}
				const data$1 = bufferUtil$1.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
				if (this._inflate._readableState.endEmitted) {
					this._inflate.close();
					this._inflate = null;
				} else {
					this._inflate[kTotalLength] = 0;
					this._inflate[kBuffers] = [];
					if (fin && this.params[`${endpoint}_no_context_takeover`]) this._inflate.reset();
				}
				callback(null, data$1);
			});
		}
		_compress(data, fin, callback) {
			const endpoint = this._isServer ? "server" : "client";
			if (!this._deflate) {
				const key$1 = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key$1] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key$1];
				this._deflate = zlib.createDeflateRaw({
					...this._options.zlibDeflateOptions,
					windowBits
				});
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				this._deflate.on("data", deflateOnData);
			}
			this._deflate[kCallback] = callback;
			this._deflate.write(data);
			this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
				if (!this._deflate) return;
				let data$1 = bufferUtil$1.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
				if (fin) data$1 = new FastBuffer(data$1.buffer, data$1.byteOffset, data$1.length - 4);
				this._deflate[kCallback] = null;
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				if (fin && this.params[`${endpoint}_no_context_takeover`]) this._deflate.reset();
				callback(null, data$1);
			});
		}
	}
	permessageDeflate = PerMessageDeflate;
	function deflateOnData(chunk) {
		this[kBuffers].push(chunk);
		this[kTotalLength] += chunk.length;
	}
	function inflateOnData(chunk) {
		this[kTotalLength] += chunk.length;
		if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
			this[kBuffers].push(chunk);
			return;
		}
		this[kError] = /* @__PURE__ */ new RangeError("Max payload size exceeded");
		this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
		this[kError][kStatusCode] = 1009;
		this.removeListener("data", inflateOnData);
		this.reset();
	}
	function inflateOnError(err) {
		this[kPerMessageDeflate]._inflate = null;
		if (this[kError]) {
			this[kCallback](this[kError]);
			return;
		}
		err[kStatusCode] = 1007;
		this[kCallback](err);
	}
	return permessageDeflate;
}
var validation = { exports: {} };
var hasRequiredValidation;
function requireValidation() {
	if (hasRequiredValidation) return validation.exports;
	hasRequiredValidation = 1;
	const { isUtf8 } = require$$0$1;
	const { hasBlob } = requireConstants();
	const tokenChars = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		1,
		0,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		1,
		0,
		1,
		0
	];
	function isValidStatusCode(code) {
		return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
	}
	function _isValidUTF8(buf) {
		const len = buf.length;
		let i = 0;
		while (i < len) if ((buf[i] & 128) === 0) i++;
		else if ((buf[i] & 224) === 192) {
			if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) return false;
			i += 2;
		} else if ((buf[i] & 240) === 224) {
			if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) return false;
			i += 3;
		} else if ((buf[i] & 248) === 240) {
			if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) return false;
			i += 4;
		} else return false;
		return true;
	}
	function isBlob(value) {
		return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
	}
	validation.exports = {
		isBlob,
		isValidStatusCode,
		isValidUTF8: _isValidUTF8,
		tokenChars
	};
	if (isUtf8) validation.exports.isValidUTF8 = function(buf) {
		return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
	};
	else if (!process.env.WS_NO_UTF_8_VALIDATE) try {
		const isValidUTF8 = __require("utf-8-validate");
		validation.exports.isValidUTF8 = function(buf) {
			return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
		};
	} catch (e) {}
	return validation.exports;
}
var receiver;
var hasRequiredReceiver;
function requireReceiver() {
	if (hasRequiredReceiver) return receiver;
	hasRequiredReceiver = 1;
	const { Writable } = require$$0$2;
	const PerMessageDeflate = requirePermessageDeflate();
	const { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = requireConstants();
	const { concat, toArrayBuffer, unmask } = requireBufferUtil();
	const { isValidStatusCode, isValidUTF8 } = requireValidation();
	const FastBuffer = Buffer[Symbol.species];
	const GET_INFO = 0;
	const GET_PAYLOAD_LENGTH_16 = 1;
	const GET_PAYLOAD_LENGTH_64 = 2;
	const GET_MASK = 3;
	const GET_DATA = 4;
	const INFLATING = 5;
	const DEFER_EVENT = 6;
	class Receiver extends Writable {
		constructor(options = {}) {
			super();
			this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
			this._binaryType = options.binaryType || BINARY_TYPES[0];
			this._extensions = options.extensions || {};
			this._isServer = !!options.isServer;
			this._maxPayload = options.maxPayload | 0;
			this._skipUTF8Validation = !!options.skipUTF8Validation;
			this[kWebSocket] = void 0;
			this._bufferedBytes = 0;
			this._buffers = [];
			this._compressed = false;
			this._payloadLength = 0;
			this._mask = void 0;
			this._fragmented = 0;
			this._masked = false;
			this._fin = false;
			this._opcode = 0;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._fragments = [];
			this._errored = false;
			this._loop = false;
			this._state = GET_INFO;
		}
		_write(chunk, encoding, cb) {
			if (this._opcode === 8 && this._state == GET_INFO) return cb();
			this._bufferedBytes += chunk.length;
			this._buffers.push(chunk);
			this.startLoop(cb);
		}
		consume(n) {
			this._bufferedBytes -= n;
			if (n === this._buffers[0].length) return this._buffers.shift();
			if (n < this._buffers[0].length) {
				const buf = this._buffers[0];
				this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				return new FastBuffer(buf.buffer, buf.byteOffset, n);
			}
			const dst = Buffer.allocUnsafe(n);
			do {
				const buf = this._buffers[0];
				const offset = dst.length - n;
				if (n >= buf.length) dst.set(this._buffers.shift(), offset);
				else {
					dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
					this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				}
				n -= buf.length;
			} while (n > 0);
			return dst;
		}
		startLoop(cb) {
			this._loop = true;
			do
				switch (this._state) {
					case GET_INFO:
						this.getInfo(cb);
						break;
					case GET_PAYLOAD_LENGTH_16:
						this.getPayloadLength16(cb);
						break;
					case GET_PAYLOAD_LENGTH_64:
						this.getPayloadLength64(cb);
						break;
					case GET_MASK:
						this.getMask();
						break;
					case GET_DATA:
						this.getData(cb);
						break;
					case INFLATING:
					case DEFER_EVENT:
						this._loop = false;
						return;
				}
			while (this._loop);
			if (!this._errored) cb();
		}
		getInfo(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			const buf = this.consume(2);
			if ((buf[0] & 48) !== 0) {
				cb(this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3"));
				return;
			}
			const compressed = (buf[0] & 64) === 64;
			if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
				cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
				return;
			}
			this._fin = (buf[0] & 128) === 128;
			this._opcode = buf[0] & 15;
			this._payloadLength = buf[1] & 127;
			if (this._opcode === 0) {
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (!this._fragmented) {
					cb(this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._opcode = this._fragmented;
			} else if (this._opcode === 1 || this._opcode === 2) {
				if (this._fragmented) {
					cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._compressed = compressed;
			} else if (this._opcode > 7 && this._opcode < 11) {
				if (!this._fin) {
					cb(this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN"));
					return;
				}
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
					cb(this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"));
					return;
				}
			} else {
				cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
				return;
			}
			if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
			this._masked = (buf[1] & 128) === 128;
			if (this._isServer) {
				if (!this._masked) {
					cb(this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK"));
					return;
				}
			} else if (this._masked) {
				cb(this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK"));
				return;
			}
			if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
			else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
			else this.haveLength(cb);
		}
		getPayloadLength16(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			this._payloadLength = this.consume(2).readUInt16BE(0);
			this.haveLength(cb);
		}
		getPayloadLength64(cb) {
			if (this._bufferedBytes < 8) {
				this._loop = false;
				return;
			}
			const buf = this.consume(8);
			const num = buf.readUInt32BE(0);
			if (num > Math.pow(2, 21) - 1) {
				cb(this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"));
				return;
			}
			this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
			this.haveLength(cb);
		}
		haveLength(cb) {
			if (this._payloadLength && this._opcode < 8) {
				this._totalPayloadLength += this._payloadLength;
				if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
					cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
					return;
				}
			}
			if (this._masked) this._state = GET_MASK;
			else this._state = GET_DATA;
		}
		getMask() {
			if (this._bufferedBytes < 4) {
				this._loop = false;
				return;
			}
			this._mask = this.consume(4);
			this._state = GET_DATA;
		}
		getData(cb) {
			let data = EMPTY_BUFFER;
			if (this._payloadLength) {
				if (this._bufferedBytes < this._payloadLength) {
					this._loop = false;
					return;
				}
				data = this.consume(this._payloadLength);
				if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) unmask(data, this._mask);
			}
			if (this._opcode > 7) {
				this.controlMessage(data, cb);
				return;
			}
			if (this._compressed) {
				this._state = INFLATING;
				this.decompress(data, cb);
				return;
			}
			if (data.length) {
				this._messageLength = this._totalPayloadLength;
				this._fragments.push(data);
			}
			this.dataMessage(cb);
		}
		decompress(data, cb) {
			this._extensions[PerMessageDeflate.extensionName].decompress(data, this._fin, (err, buf) => {
				if (err) return cb(err);
				if (buf.length) {
					this._messageLength += buf.length;
					if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
						cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
						return;
					}
					this._fragments.push(buf);
				}
				this.dataMessage(cb);
				if (this._state === GET_INFO) this.startLoop(cb);
			});
		}
		dataMessage(cb) {
			if (!this._fin) {
				this._state = GET_INFO;
				return;
			}
			const messageLength = this._messageLength;
			const fragments = this._fragments;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._fragmented = 0;
			this._fragments = [];
			if (this._opcode === 2) {
				let data;
				if (this._binaryType === "nodebuffer") data = concat(fragments, messageLength);
				else if (this._binaryType === "arraybuffer") data = toArrayBuffer(concat(fragments, messageLength));
				else if (this._binaryType === "blob") data = new Blob(fragments);
				else data = fragments;
				if (this._allowSynchronousEvents) {
					this.emit("message", data, true);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", data, true);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			} else {
				const buf = concat(fragments, messageLength);
				if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
					cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
					return;
				}
				if (this._state === INFLATING || this._allowSynchronousEvents) {
					this.emit("message", buf, false);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", buf, false);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			}
		}
		controlMessage(data, cb) {
			if (this._opcode === 8) {
				if (data.length === 0) {
					this._loop = false;
					this.emit("conclude", 1005, EMPTY_BUFFER);
					this.end();
				} else {
					const code = data.readUInt16BE(0);
					if (!isValidStatusCode(code)) {
						cb(this.createError(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE"));
						return;
					}
					const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
					if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
						cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
						return;
					}
					this._loop = false;
					this.emit("conclude", code, buf);
					this.end();
				}
				this._state = GET_INFO;
				return;
			}
			if (this._allowSynchronousEvents) {
				this.emit(this._opcode === 9 ? "ping" : "pong", data);
				this._state = GET_INFO;
			} else {
				this._state = DEFER_EVENT;
				setImmediate(() => {
					this.emit(this._opcode === 9 ? "ping" : "pong", data);
					this._state = GET_INFO;
					this.startLoop(cb);
				});
			}
		}
		createError(ErrorCtor, message, prefix, statusCode, errorCode) {
			this._loop = false;
			this._errored = true;
			const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
			Error.captureStackTrace(err, this.createError);
			err.code = errorCode;
			err[kStatusCode] = statusCode;
			return err;
		}
	}
	receiver = Receiver;
	return receiver;
}
var sender;
var hasRequiredSender;
function requireSender() {
	if (hasRequiredSender) return sender;
	hasRequiredSender = 1;
	const { Duplex: Duplex$1 } = require$$0$2;
	const { randomFillSync } = require$$1;
	const PerMessageDeflate = requirePermessageDeflate();
	const { EMPTY_BUFFER, kWebSocket, NOOP } = requireConstants();
	const { isBlob, isValidStatusCode } = requireValidation();
	const { mask: applyMask, toBuffer } = requireBufferUtil();
	const kByteLength = Symbol("kByteLength");
	const maskBuffer = Buffer.alloc(4);
	const RANDOM_POOL_SIZE = 8 * 1024;
	let randomPool;
	let randomPoolPointer = RANDOM_POOL_SIZE;
	const DEFAULT = 0;
	const DEFLATING = 1;
	const GET_BLOB_DATA = 2;
	class Sender {
		constructor(socket, extensions, generateMask) {
			this._extensions = extensions || {};
			if (generateMask) {
				this._generateMask = generateMask;
				this._maskBuffer = Buffer.alloc(4);
			}
			this._socket = socket;
			this._firstFragment = true;
			this._compress = false;
			this._bufferedBytes = 0;
			this._queue = [];
			this._state = DEFAULT;
			this.onerror = NOOP;
			this[kWebSocket] = void 0;
		}
		static frame(data, options) {
			let mask;
			let merge = false;
			let offset = 2;
			let skipMasking = false;
			if (options.mask) {
				mask = options.maskBuffer || maskBuffer;
				if (options.generateMask) options.generateMask(mask);
				else {
					if (randomPoolPointer === RANDOM_POOL_SIZE) {
						/* istanbul ignore else  */
						if (randomPool === void 0) randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
						randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
						randomPoolPointer = 0;
					}
					mask[0] = randomPool[randomPoolPointer++];
					mask[1] = randomPool[randomPoolPointer++];
					mask[2] = randomPool[randomPoolPointer++];
					mask[3] = randomPool[randomPoolPointer++];
				}
				skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
				offset = 6;
			}
			let dataLength;
			if (typeof data === "string") if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) dataLength = options[kByteLength];
			else {
				data = Buffer.from(data);
				dataLength = data.length;
			}
			else {
				dataLength = data.length;
				merge = options.mask && options.readOnly && !skipMasking;
			}
			let payloadLength = dataLength;
			if (dataLength >= 65536) {
				offset += 8;
				payloadLength = 127;
			} else if (dataLength > 125) {
				offset += 2;
				payloadLength = 126;
			}
			const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
			target[0] = options.fin ? options.opcode | 128 : options.opcode;
			if (options.rsv1) target[0] |= 64;
			target[1] = payloadLength;
			if (payloadLength === 126) target.writeUInt16BE(dataLength, 2);
			else if (payloadLength === 127) {
				target[2] = target[3] = 0;
				target.writeUIntBE(dataLength, 4, 6);
			}
			if (!options.mask) return [target, data];
			target[1] |= 128;
			target[offset - 4] = mask[0];
			target[offset - 3] = mask[1];
			target[offset - 2] = mask[2];
			target[offset - 1] = mask[3];
			if (skipMasking) return [target, data];
			if (merge) {
				applyMask(data, mask, target, offset, dataLength);
				return [target];
			}
			applyMask(data, mask, data, 0, dataLength);
			return [target, data];
		}
		close(code, data, mask, cb) {
			let buf;
			if (code === void 0) buf = EMPTY_BUFFER;
			else if (typeof code !== "number" || !isValidStatusCode(code)) throw new TypeError("First argument must be a valid error code number");
			else if (data === void 0 || !data.length) {
				buf = Buffer.allocUnsafe(2);
				buf.writeUInt16BE(code, 0);
			} else {
				const length = Buffer.byteLength(data);
				if (length > 123) throw new RangeError("The message must not be greater than 123 bytes");
				buf = Buffer.allocUnsafe(2 + length);
				buf.writeUInt16BE(code, 0);
				if (typeof data === "string") buf.write(data, 2);
				else buf.set(data, 2);
			}
			const options = {
				[kByteLength]: buf.length,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 8,
				readOnly: false,
				rsv1: false
			};
			if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				buf,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(buf, options), cb);
		}
		ping(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 9,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) if (this._state !== DEFAULT) this.enqueue([
				this.getBlobData,
				data,
				false,
				options,
				cb
			]);
			else this.getBlobData(data, false, options, cb);
			else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		pong(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 10,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) if (this._state !== DEFAULT) this.enqueue([
				this.getBlobData,
				data,
				false,
				options,
				cb
			]);
			else this.getBlobData(data, false, options, cb);
			else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		send(data, options, cb) {
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			let opcode = options.binary ? 2 : 1;
			let rsv1 = options.compress;
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (this._firstFragment) {
				this._firstFragment = false;
				if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) rsv1 = byteLength >= perMessageDeflate._threshold;
				this._compress = rsv1;
			} else {
				rsv1 = false;
				opcode = 0;
			}
			if (options.fin) this._firstFragment = true;
			const opts = {
				[kByteLength]: byteLength,
				fin: options.fin,
				generateMask: this._generateMask,
				mask: options.mask,
				maskBuffer: this._maskBuffer,
				opcode,
				readOnly,
				rsv1
			};
			if (isBlob(data)) if (this._state !== DEFAULT) this.enqueue([
				this.getBlobData,
				data,
				this._compress,
				opts,
				cb
			]);
			else this.getBlobData(data, this._compress, opts, cb);
			else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				this._compress,
				opts,
				cb
			]);
			else this.dispatch(data, this._compress, opts, cb);
		}
		getBlobData(blob, compress, options, cb) {
			this._bufferedBytes += options[kByteLength];
			this._state = GET_BLOB_DATA;
			blob.arrayBuffer().then((arrayBuffer) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while the blob was being read");
					process.nextTick(callCallbacks, this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				const data = toBuffer(arrayBuffer);
				if (!compress) {
					this._state = DEFAULT;
					this.sendFrame(Sender.frame(data, options), cb);
					this.dequeue();
				} else this.dispatch(data, compress, options, cb);
			}).catch((err) => {
				process.nextTick(onError, this, err, cb);
			});
		}
		dispatch(data, compress, options, cb) {
			if (!compress) {
				this.sendFrame(Sender.frame(data, options), cb);
				return;
			}
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			this._bufferedBytes += options[kByteLength];
			this._state = DEFLATING;
			perMessageDeflate.compress(data, options.fin, (_, buf) => {
				if (this._socket.destroyed) {
					callCallbacks(this, /* @__PURE__ */ new Error("The socket was closed while data was being compressed"), cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				this._state = DEFAULT;
				options.readOnly = false;
				this.sendFrame(Sender.frame(buf, options), cb);
				this.dequeue();
			});
		}
		dequeue() {
			while (this._state === DEFAULT && this._queue.length) {
				const params = this._queue.shift();
				this._bufferedBytes -= params[3][kByteLength];
				Reflect.apply(params[0], this, params.slice(1));
			}
		}
		enqueue(params) {
			this._bufferedBytes += params[3][kByteLength];
			this._queue.push(params);
		}
		sendFrame(list, cb) {
			if (list.length === 2) {
				this._socket.cork();
				this._socket.write(list[0]);
				this._socket.write(list[1], cb);
				this._socket.uncork();
			} else this._socket.write(list[0], cb);
		}
	}
	sender = Sender;
	function callCallbacks(sender$1, err, cb) {
		if (typeof cb === "function") cb(err);
		for (let i = 0; i < sender$1._queue.length; i++) {
			const params = sender$1._queue[i];
			const callback = params[params.length - 1];
			if (typeof callback === "function") callback(err);
		}
	}
	function onError(sender$1, err, cb) {
		callCallbacks(sender$1, err, cb);
		sender$1.onerror(err);
	}
	return sender;
}
var eventTarget;
var hasRequiredEventTarget;
function requireEventTarget() {
	if (hasRequiredEventTarget) return eventTarget;
	hasRequiredEventTarget = 1;
	const { kForOnEventAttribute, kListener } = requireConstants();
	const kCode = Symbol("kCode");
	const kData = Symbol("kData");
	const kError = Symbol("kError");
	const kMessage = Symbol("kMessage");
	const kReason = Symbol("kReason");
	const kTarget = Symbol("kTarget");
	const kType = Symbol("kType");
	const kWasClean = Symbol("kWasClean");
	class Event {
		constructor(type) {
			this[kTarget] = null;
			this[kType] = type;
		}
		get target() {
			return this[kTarget];
		}
		get type() {
			return this[kType];
		}
	}
	Object.defineProperty(Event.prototype, "target", { enumerable: true });
	Object.defineProperty(Event.prototype, "type", { enumerable: true });
	class CloseEvent extends Event {
		constructor(type, options = {}) {
			super(type);
			this[kCode] = options.code === void 0 ? 0 : options.code;
			this[kReason] = options.reason === void 0 ? "" : options.reason;
			this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
		}
		get code() {
			return this[kCode];
		}
		get reason() {
			return this[kReason];
		}
		get wasClean() {
			return this[kWasClean];
		}
	}
	Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
	class ErrorEvent extends Event {
		constructor(type, options = {}) {
			super(type);
			this[kError] = options.error === void 0 ? null : options.error;
			this[kMessage] = options.message === void 0 ? "" : options.message;
		}
		get error() {
			return this[kError];
		}
		get message() {
			return this[kMessage];
		}
	}
	Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
	Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
	class MessageEvent extends Event {
		constructor(type, options = {}) {
			super(type);
			this[kData] = options.data === void 0 ? null : options.data;
		}
		get data() {
			return this[kData];
		}
	}
	Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
	eventTarget = {
		CloseEvent,
		ErrorEvent,
		Event,
		EventTarget: {
			addEventListener(type, handler, options = {}) {
				for (const listener of this.listeners(type)) if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) return;
				let wrapper;
				if (type === "message") wrapper = function onMessage(data, isBinary) {
					const event = new MessageEvent("message", { data: isBinary ? data : data.toString() });
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "close") wrapper = function onClose(code, message) {
					const event = new CloseEvent("close", {
						code,
						reason: message.toString(),
						wasClean: this._closeFrameReceived && this._closeFrameSent
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "error") wrapper = function onError(error) {
					const event = new ErrorEvent("error", {
						error,
						message: error.message
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "open") wrapper = function onOpen() {
					const event = new Event("open");
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else return;
				wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
				wrapper[kListener] = handler;
				if (options.once) this.once(type, wrapper);
				else this.on(type, wrapper);
			},
			removeEventListener(type, handler) {
				for (const listener of this.listeners(type)) if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
					this.removeListener(type, listener);
					break;
				}
			}
		},
		MessageEvent
	};
	function callListener(listener, thisArg, event) {
		if (typeof listener === "object" && listener.handleEvent) listener.handleEvent.call(listener, event);
		else listener.call(thisArg, event);
	}
	return eventTarget;
}
var extension;
var hasRequiredExtension;
function requireExtension() {
	if (hasRequiredExtension) return extension;
	hasRequiredExtension = 1;
	const { tokenChars } = requireValidation();
	function push(dest, name, elem) {
		if (dest[name] === void 0) dest[name] = [elem];
		else dest[name].push(elem);
	}
	function parse(header) {
		const offers = Object.create(null);
		let params = Object.create(null);
		let mustUnescape = false;
		let isEscaping = false;
		let inQuotes = false;
		let extensionName;
		let paramName;
		let start = -1;
		let code = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			code = header.charCodeAt(i);
			if (extensionName === void 0) if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (i !== 0 && (code === 32 || code === 9)) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				const name = header.slice(start, end);
				if (code === 44) {
					push(offers, name, params);
					params = Object.create(null);
				} else extensionName = name;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
			else if (paramName === void 0) if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (code === 32 || code === 9) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				push(params, header.slice(start, end), true);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				start = end = -1;
			} else if (code === 61 && start !== -1 && end === -1) {
				paramName = header.slice(start, i);
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
			else if (isEscaping) {
				if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (start === -1) start = i;
				else if (!mustUnescape) mustUnescape = true;
				isEscaping = false;
			} else if (inQuotes) if (tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (code === 34 && start !== -1) {
				inQuotes = false;
				end = i;
			} else if (code === 92) isEscaping = true;
			else throw new SyntaxError(`Unexpected character at index ${i}`);
			else if (code === 34 && header.charCodeAt(i - 1) === 61) inQuotes = true;
			else if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (start !== -1 && (code === 32 || code === 9)) {
				if (end === -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				let value = header.slice(start, end);
				if (mustUnescape) {
					value = value.replace(/\\/g, "");
					mustUnescape = false;
				}
				push(params, paramName, value);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				paramName = void 0;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || inQuotes || code === 32 || code === 9) throw new SyntaxError("Unexpected end of input");
		if (end === -1) end = i;
		const token = header.slice(start, end);
		if (extensionName === void 0) push(offers, token, params);
		else {
			if (paramName === void 0) push(params, token, true);
			else if (mustUnescape) push(params, paramName, token.replace(/\\/g, ""));
			else push(params, paramName, token);
			push(offers, extensionName, params);
		}
		return offers;
	}
	function format(extensions) {
		return Object.keys(extensions).map((extension$1) => {
			let configurations = extensions[extension$1];
			if (!Array.isArray(configurations)) configurations = [configurations];
			return configurations.map((params) => {
				return [extension$1].concat(Object.keys(params).map((k) => {
					let values = params[k];
					if (!Array.isArray(values)) values = [values];
					return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
				})).join("; ");
			}).join(", ");
		}).join(", ");
	}
	extension = {
		format,
		parse
	};
	return extension;
}
var websocket;
var hasRequiredWebsocket;
function requireWebsocket() {
	if (hasRequiredWebsocket) return websocket;
	hasRequiredWebsocket = 1;
	const EventEmitter = require$$0$3;
	const https = require$$1$1;
	const http = require$$2;
	const net = require$$3;
	const tls = require$$4;
	const { randomBytes, createHash } = require$$1;
	const { Duplex: Duplex$1, Readable: Readable$1 } = require$$0$2;
	const { URL: URL$1 } = require$$7;
	const PerMessageDeflate = requirePermessageDeflate();
	const Receiver = requireReceiver();
	const Sender = requireSender();
	const { isBlob } = requireValidation();
	const { BINARY_TYPES, EMPTY_BUFFER, GUID, kForOnEventAttribute, kListener, kStatusCode, kWebSocket, NOOP } = requireConstants();
	const { EventTarget: { addEventListener, removeEventListener } } = requireEventTarget();
	const { format, parse } = requireExtension();
	const { toBuffer } = requireBufferUtil();
	const closeTimeout = 30 * 1e3;
	const kAborted = Symbol("kAborted");
	const protocolVersions = [8, 13];
	const readyStates = [
		"CONNECTING",
		"OPEN",
		"CLOSING",
		"CLOSED"
	];
	const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
	class WebSocket extends EventEmitter {
		constructor(address, protocols, options) {
			super();
			this._binaryType = BINARY_TYPES[0];
			this._closeCode = 1006;
			this._closeFrameReceived = false;
			this._closeFrameSent = false;
			this._closeMessage = EMPTY_BUFFER;
			this._closeTimer = null;
			this._errorEmitted = false;
			this._extensions = {};
			this._paused = false;
			this._protocol = "";
			this._readyState = WebSocket.CONNECTING;
			this._receiver = null;
			this._sender = null;
			this._socket = null;
			if (address !== null) {
				this._bufferedAmount = 0;
				this._isServer = false;
				this._redirects = 0;
				if (protocols === void 0) protocols = [];
				else if (!Array.isArray(protocols)) if (typeof protocols === "object" && protocols !== null) {
					options = protocols;
					protocols = [];
				} else protocols = [protocols];
				initAsClient(this, address, protocols, options);
			} else {
				this._autoPong = options.autoPong;
				this._isServer = true;
			}
		}
		get binaryType() {
			return this._binaryType;
		}
		set binaryType(type) {
			if (!BINARY_TYPES.includes(type)) return;
			this._binaryType = type;
			if (this._receiver) this._receiver._binaryType = type;
		}
		get bufferedAmount() {
			if (!this._socket) return this._bufferedAmount;
			return this._socket._writableState.length + this._sender._bufferedBytes;
		}
		get extensions() {
			return Object.keys(this._extensions).join();
		}
		get isPaused() {
			return this._paused;
		}
		/* istanbul ignore next */
		get onclose() {
			return null;
		}
		/* istanbul ignore next */
		get onerror() {
			return null;
		}
		/* istanbul ignore next */
		get onopen() {
			return null;
		}
		/* istanbul ignore next */
		get onmessage() {
			return null;
		}
		get protocol() {
			return this._protocol;
		}
		get readyState() {
			return this._readyState;
		}
		get url() {
			return this._url;
		}
		setSocket(socket, head, options) {
			const receiver$1 = new Receiver({
				allowSynchronousEvents: options.allowSynchronousEvents,
				binaryType: this.binaryType,
				extensions: this._extensions,
				isServer: this._isServer,
				maxPayload: options.maxPayload,
				skipUTF8Validation: options.skipUTF8Validation
			});
			const sender$1 = new Sender(socket, this._extensions, options.generateMask);
			this._receiver = receiver$1;
			this._sender = sender$1;
			this._socket = socket;
			receiver$1[kWebSocket] = this;
			sender$1[kWebSocket] = this;
			socket[kWebSocket] = this;
			receiver$1.on("conclude", receiverOnConclude);
			receiver$1.on("drain", receiverOnDrain);
			receiver$1.on("error", receiverOnError);
			receiver$1.on("message", receiverOnMessage);
			receiver$1.on("ping", receiverOnPing);
			receiver$1.on("pong", receiverOnPong);
			sender$1.onerror = senderOnError;
			if (socket.setTimeout) socket.setTimeout(0);
			if (socket.setNoDelay) socket.setNoDelay();
			if (head.length > 0) socket.unshift(head);
			socket.on("close", socketOnClose);
			socket.on("data", socketOnData);
			socket.on("end", socketOnEnd);
			socket.on("error", socketOnError);
			this._readyState = WebSocket.OPEN;
			this.emit("open");
		}
		emitClose() {
			if (!this._socket) {
				this._readyState = WebSocket.CLOSED;
				this.emit("close", this._closeCode, this._closeMessage);
				return;
			}
			if (this._extensions[PerMessageDeflate.extensionName]) this._extensions[PerMessageDeflate.extensionName].cleanup();
			this._receiver.removeAllListeners();
			this._readyState = WebSocket.CLOSED;
			this.emit("close", this._closeCode, this._closeMessage);
		}
		close(code, data) {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this.readyState === WebSocket.CLOSING) {
				if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) this._socket.end();
				return;
			}
			this._readyState = WebSocket.CLOSING;
			this._sender.close(code, data, !this._isServer, (err) => {
				if (err) return;
				this._closeFrameSent = true;
				if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) this._socket.end();
			});
			setCloseTimer(this);
		}
		pause() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = true;
			this._socket.pause();
		}
		ping(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.ping(data || EMPTY_BUFFER, mask, cb);
		}
		pong(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.pong(data || EMPTY_BUFFER, mask, cb);
		}
		resume() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = false;
			if (!this._receiver._writableState.needDrain) this._socket.resume();
		}
		send(data, options, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof options === "function") {
				cb = options;
				options = {};
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			const opts = {
				binary: typeof data !== "string",
				mask: !this._isServer,
				compress: true,
				fin: true,
				...options
			};
			if (!this._extensions[PerMessageDeflate.extensionName]) opts.compress = false;
			this._sender.send(data || EMPTY_BUFFER, opts, cb);
		}
		terminate() {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this._socket) {
				this._readyState = WebSocket.CLOSING;
				this._socket.destroy();
			}
		}
	}
	Object.defineProperty(WebSocket, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	Object.defineProperty(WebSocket.prototype, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	Object.defineProperty(WebSocket, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	Object.defineProperty(WebSocket.prototype, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	Object.defineProperty(WebSocket, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	Object.defineProperty(WebSocket.prototype, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	Object.defineProperty(WebSocket, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	Object.defineProperty(WebSocket.prototype, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	[
		"binaryType",
		"bufferedAmount",
		"extensions",
		"isPaused",
		"protocol",
		"readyState",
		"url"
	].forEach((property) => {
		Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});
	[
		"open",
		"error",
		"close",
		"message"
	].forEach((method) => {
		Object.defineProperty(WebSocket.prototype, `on${method}`, {
			enumerable: true,
			get() {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) return listener[kListener];
				return null;
			},
			set(handler) {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) {
					this.removeListener(method, listener);
					break;
				}
				if (typeof handler !== "function") return;
				this.addEventListener(method, handler, { [kForOnEventAttribute]: true });
			}
		});
	});
	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;
	websocket = WebSocket;
	function initAsClient(websocket$1, address, protocols, options) {
		const opts = {
			allowSynchronousEvents: true,
			autoPong: true,
			protocolVersion: protocolVersions[1],
			maxPayload: 100 * 1024 * 1024,
			skipUTF8Validation: false,
			perMessageDeflate: true,
			followRedirects: false,
			maxRedirects: 10,
			...options,
			socketPath: void 0,
			hostname: void 0,
			protocol: void 0,
			timeout: void 0,
			method: "GET",
			host: void 0,
			path: void 0,
			port: void 0
		};
		websocket$1._autoPong = opts.autoPong;
		if (!protocolVersions.includes(opts.protocolVersion)) throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
		let parsedUrl;
		if (address instanceof URL$1) parsedUrl = address;
		else try {
			parsedUrl = new URL$1(address);
		} catch (e) {
			throw new SyntaxError(`Invalid URL: ${address}`);
		}
		if (parsedUrl.protocol === "http:") parsedUrl.protocol = "ws:";
		else if (parsedUrl.protocol === "https:") parsedUrl.protocol = "wss:";
		websocket$1._url = parsedUrl.href;
		const isSecure = parsedUrl.protocol === "wss:";
		const isIpcUrl = parsedUrl.protocol === "ws+unix:";
		let invalidUrlMessage;
		if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) invalidUrlMessage = "The URL's protocol must be one of \"ws:\", \"wss:\", \"http:\", \"https:\", or \"ws+unix:\"";
		else if (isIpcUrl && !parsedUrl.pathname) invalidUrlMessage = "The URL's pathname is empty";
		else if (parsedUrl.hash) invalidUrlMessage = "The URL contains a fragment identifier";
		if (invalidUrlMessage) {
			const err = new SyntaxError(invalidUrlMessage);
			if (websocket$1._redirects === 0) throw err;
			else {
				emitErrorAndClose(websocket$1, err);
				return;
			}
		}
		const defaultPort = isSecure ? 443 : 80;
		const key$1 = randomBytes(16).toString("base64");
		const request = isSecure ? https.request : http.request;
		const protocolSet = /* @__PURE__ */ new Set();
		let perMessageDeflate;
		opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
		opts.defaultPort = opts.defaultPort || defaultPort;
		opts.port = parsedUrl.port || defaultPort;
		opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
		opts.headers = {
			...opts.headers,
			"Sec-WebSocket-Version": opts.protocolVersion,
			"Sec-WebSocket-Key": key$1,
			Connection: "Upgrade",
			Upgrade: "websocket"
		};
		opts.path = parsedUrl.pathname + parsedUrl.search;
		opts.timeout = opts.handshakeTimeout;
		if (opts.perMessageDeflate) {
			perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
			opts.headers["Sec-WebSocket-Extensions"] = format({ [PerMessageDeflate.extensionName]: perMessageDeflate.offer() });
		}
		if (protocols.length) {
			for (const protocol of protocols) {
				if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) throw new SyntaxError("An invalid or duplicated subprotocol was specified");
				protocolSet.add(protocol);
			}
			opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
		}
		if (opts.origin) if (opts.protocolVersion < 13) opts.headers["Sec-WebSocket-Origin"] = opts.origin;
		else opts.headers.Origin = opts.origin;
		if (parsedUrl.username || parsedUrl.password) opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
		if (isIpcUrl) {
			const parts = opts.path.split(":");
			opts.socketPath = parts[0];
			opts.path = parts[1];
		}
		let req;
		if (opts.followRedirects) {
			if (websocket$1._redirects === 0) {
				websocket$1._originalIpc = isIpcUrl;
				websocket$1._originalSecure = isSecure;
				websocket$1._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
				const headers$1 = options && options.headers;
				options = {
					...options,
					headers: {}
				};
				if (headers$1) for (const [key$2, value] of Object.entries(headers$1)) options.headers[key$2.toLowerCase()] = value;
			} else if (websocket$1.listenerCount("redirect") === 0) {
				const isSameHost = isIpcUrl ? websocket$1._originalIpc ? opts.socketPath === websocket$1._originalHostOrSocketPath : false : websocket$1._originalIpc ? false : parsedUrl.host === websocket$1._originalHostOrSocketPath;
				if (!isSameHost || websocket$1._originalSecure && !isSecure) {
					delete opts.headers.authorization;
					delete opts.headers.cookie;
					if (!isSameHost) delete opts.headers.host;
					opts.auth = void 0;
				}
			}
			if (opts.auth && !options.headers.authorization) options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
			req = websocket$1._req = request(opts);
			if (websocket$1._redirects) websocket$1.emit("redirect", websocket$1.url, req);
		} else req = websocket$1._req = request(opts);
		if (opts.timeout) req.on("timeout", () => {
			abortHandshake(websocket$1, req, "Opening handshake has timed out");
		});
		req.on("error", (err) => {
			if (req === null || req[kAborted]) return;
			req = websocket$1._req = null;
			emitErrorAndClose(websocket$1, err);
		});
		req.on("response", (res) => {
			const location = res.headers.location;
			const statusCode = res.statusCode;
			if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
				if (++websocket$1._redirects > opts.maxRedirects) {
					abortHandshake(websocket$1, req, "Maximum redirects exceeded");
					return;
				}
				req.abort();
				let addr;
				try {
					addr = new URL$1(location, address);
				} catch (e) {
					emitErrorAndClose(websocket$1, /* @__PURE__ */ new SyntaxError(`Invalid URL: ${location}`));
					return;
				}
				initAsClient(websocket$1, addr, protocols, options);
			} else if (!websocket$1.emit("unexpected-response", req, res)) abortHandshake(websocket$1, req, `Unexpected server response: ${res.statusCode}`);
		});
		req.on("upgrade", (res, socket, head) => {
			websocket$1.emit("upgrade", res);
			if (websocket$1.readyState !== WebSocket.CONNECTING) return;
			req = websocket$1._req = null;
			const upgrade = res.headers.upgrade;
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshake(websocket$1, socket, "Invalid Upgrade header");
				return;
			}
			const digest = createHash("sha1").update(key$1 + GUID).digest("base64");
			if (res.headers["sec-websocket-accept"] !== digest) {
				abortHandshake(websocket$1, socket, "Invalid Sec-WebSocket-Accept header");
				return;
			}
			const serverProt = res.headers["sec-websocket-protocol"];
			let protError;
			if (serverProt !== void 0) {
				if (!protocolSet.size) protError = "Server sent a subprotocol but none was requested";
				else if (!protocolSet.has(serverProt)) protError = "Server sent an invalid subprotocol";
			} else if (protocolSet.size) protError = "Server sent no subprotocol";
			if (protError) {
				abortHandshake(websocket$1, socket, protError);
				return;
			}
			if (serverProt) websocket$1._protocol = serverProt;
			const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
			if (secWebSocketExtensions !== void 0) {
				if (!perMessageDeflate) {
					abortHandshake(websocket$1, socket, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
					return;
				}
				let extensions;
				try {
					extensions = parse(secWebSocketExtensions);
				} catch (err) {
					abortHandshake(websocket$1, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				const extensionNames = Object.keys(extensions);
				if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
					abortHandshake(websocket$1, socket, "Server indicated an extension that was not requested");
					return;
				}
				try {
					perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
				} catch (err) {
					abortHandshake(websocket$1, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				websocket$1._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
			}
			websocket$1.setSocket(socket, head, {
				allowSynchronousEvents: opts.allowSynchronousEvents,
				generateMask: opts.generateMask,
				maxPayload: opts.maxPayload,
				skipUTF8Validation: opts.skipUTF8Validation
			});
		});
		if (opts.finishRequest) opts.finishRequest(req, websocket$1);
		else req.end();
	}
	function emitErrorAndClose(websocket$1, err) {
		websocket$1._readyState = WebSocket.CLOSING;
		websocket$1._errorEmitted = true;
		websocket$1.emit("error", err);
		websocket$1.emitClose();
	}
	function netConnect(options) {
		options.path = options.socketPath;
		return net.connect(options);
	}
	function tlsConnect(options) {
		options.path = void 0;
		if (!options.servername && options.servername !== "") options.servername = net.isIP(options.host) ? "" : options.host;
		return tls.connect(options);
	}
	function abortHandshake(websocket$1, stream$1, message) {
		websocket$1._readyState = WebSocket.CLOSING;
		const err = new Error(message);
		Error.captureStackTrace(err, abortHandshake);
		if (stream$1.setHeader) {
			stream$1[kAborted] = true;
			stream$1.abort();
			if (stream$1.socket && !stream$1.socket.destroyed) stream$1.socket.destroy();
			process.nextTick(emitErrorAndClose, websocket$1, err);
		} else {
			stream$1.destroy(err);
			stream$1.once("error", websocket$1.emit.bind(websocket$1, "error"));
			stream$1.once("close", websocket$1.emitClose.bind(websocket$1));
		}
	}
	function sendAfterClose(websocket$1, data, cb) {
		if (data) {
			const length = isBlob(data) ? data.size : toBuffer(data).length;
			if (websocket$1._socket) websocket$1._sender._bufferedBytes += length;
			else websocket$1._bufferedAmount += length;
		}
		if (cb) {
			const err = /* @__PURE__ */ new Error(`WebSocket is not open: readyState ${websocket$1.readyState} (${readyStates[websocket$1.readyState]})`);
			process.nextTick(cb, err);
		}
	}
	function receiverOnConclude(code, reason) {
		const websocket$1 = this[kWebSocket];
		websocket$1._closeFrameReceived = true;
		websocket$1._closeMessage = reason;
		websocket$1._closeCode = code;
		if (websocket$1._socket[kWebSocket] === void 0) return;
		websocket$1._socket.removeListener("data", socketOnData);
		process.nextTick(resume, websocket$1._socket);
		if (code === 1005) websocket$1.close();
		else websocket$1.close(code, reason);
	}
	function receiverOnDrain() {
		const websocket$1 = this[kWebSocket];
		if (!websocket$1.isPaused) websocket$1._socket.resume();
	}
	function receiverOnError(err) {
		const websocket$1 = this[kWebSocket];
		if (websocket$1._socket[kWebSocket] !== void 0) {
			websocket$1._socket.removeListener("data", socketOnData);
			process.nextTick(resume, websocket$1._socket);
			websocket$1.close(err[kStatusCode]);
		}
		if (!websocket$1._errorEmitted) {
			websocket$1._errorEmitted = true;
			websocket$1.emit("error", err);
		}
	}
	function receiverOnFinish() {
		this[kWebSocket].emitClose();
	}
	function receiverOnMessage(data, isBinary) {
		this[kWebSocket].emit("message", data, isBinary);
	}
	function receiverOnPing(data) {
		const websocket$1 = this[kWebSocket];
		if (websocket$1._autoPong) websocket$1.pong(data, !this._isServer, NOOP);
		websocket$1.emit("ping", data);
	}
	function receiverOnPong(data) {
		this[kWebSocket].emit("pong", data);
	}
	function resume(stream$1) {
		stream$1.resume();
	}
	function senderOnError(err) {
		const websocket$1 = this[kWebSocket];
		if (websocket$1.readyState === WebSocket.CLOSED) return;
		if (websocket$1.readyState === WebSocket.OPEN) {
			websocket$1._readyState = WebSocket.CLOSING;
			setCloseTimer(websocket$1);
		}
		this._socket.end();
		if (!websocket$1._errorEmitted) {
			websocket$1._errorEmitted = true;
			websocket$1.emit("error", err);
		}
	}
	function setCloseTimer(websocket$1) {
		websocket$1._closeTimer = setTimeout(websocket$1._socket.destroy.bind(websocket$1._socket), closeTimeout);
	}
	function socketOnClose() {
		const websocket$1 = this[kWebSocket];
		this.removeListener("close", socketOnClose);
		this.removeListener("data", socketOnData);
		this.removeListener("end", socketOnEnd);
		websocket$1._readyState = WebSocket.CLOSING;
		let chunk;
		if (!this._readableState.endEmitted && !websocket$1._closeFrameReceived && !websocket$1._receiver._writableState.errorEmitted && (chunk = websocket$1._socket.read()) !== null) websocket$1._receiver.write(chunk);
		websocket$1._receiver.end();
		this[kWebSocket] = void 0;
		clearTimeout(websocket$1._closeTimer);
		if (websocket$1._receiver._writableState.finished || websocket$1._receiver._writableState.errorEmitted) websocket$1.emitClose();
		else {
			websocket$1._receiver.on("error", receiverOnFinish);
			websocket$1._receiver.on("finish", receiverOnFinish);
		}
	}
	function socketOnData(chunk) {
		if (!this[kWebSocket]._receiver.write(chunk)) this.pause();
	}
	function socketOnEnd() {
		const websocket$1 = this[kWebSocket];
		websocket$1._readyState = WebSocket.CLOSING;
		websocket$1._receiver.end();
		this.end();
	}
	function socketOnError() {
		const websocket$1 = this[kWebSocket];
		this.removeListener("error", socketOnError);
		this.on("error", NOOP);
		if (websocket$1) {
			websocket$1._readyState = WebSocket.CLOSING;
			this.destroy();
		}
	}
	return websocket;
}
var stream;
var hasRequiredStream;
function requireStream() {
	if (hasRequiredStream) return stream;
	hasRequiredStream = 1;
	requireWebsocket();
	const { Duplex: Duplex$1 } = require$$0$2;
	function emitClose(stream$1) {
		stream$1.emit("close");
	}
	function duplexOnEnd() {
		if (!this.destroyed && this._writableState.finished) this.destroy();
	}
	function duplexOnError(err) {
		this.removeListener("error", duplexOnError);
		this.destroy();
		if (this.listenerCount("error") === 0) this.emit("error", err);
	}
	function createWebSocketStream(ws, options) {
		let terminateOnDestroy = true;
		const duplex = new Duplex$1({
			...options,
			autoDestroy: false,
			emitClose: false,
			objectMode: false,
			writableObjectMode: false
		});
		ws.on("message", function message(msg, isBinary) {
			const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
			if (!duplex.push(data)) ws.pause();
		});
		ws.once("error", function error(err) {
			if (duplex.destroyed) return;
			terminateOnDestroy = false;
			duplex.destroy(err);
		});
		ws.once("close", function close() {
			if (duplex.destroyed) return;
			duplex.push(null);
		});
		duplex._destroy = function(err, callback) {
			if (ws.readyState === ws.CLOSED) {
				callback(err);
				process.nextTick(emitClose, duplex);
				return;
			}
			let called = false;
			ws.once("error", function error(err$1) {
				called = true;
				callback(err$1);
			});
			ws.once("close", function close() {
				if (!called) callback(err);
				process.nextTick(emitClose, duplex);
			});
			if (terminateOnDestroy) ws.terminate();
		};
		duplex._final = function(callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._final(callback);
				});
				return;
			}
			if (ws._socket === null) return;
			if (ws._socket._writableState.finished) {
				callback();
				if (duplex._readableState.endEmitted) duplex.destroy();
			} else {
				ws._socket.once("finish", function finish() {
					callback();
				});
				ws.close();
			}
		};
		duplex._read = function() {
			if (ws.isPaused) ws.resume();
		};
		duplex._write = function(chunk, encoding, callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._write(chunk, encoding, callback);
				});
				return;
			}
			ws.send(chunk, callback);
		};
		duplex.on("end", duplexOnEnd);
		duplex.on("error", duplexOnError);
		return duplex;
	}
	stream = createWebSocketStream;
	return stream;
}
requireStream();
requireReceiver();
requireSender();
requireWebsocket();
var subprotocol;
var hasRequiredSubprotocol;
function requireSubprotocol() {
	if (hasRequiredSubprotocol) return subprotocol;
	hasRequiredSubprotocol = 1;
	const { tokenChars } = requireValidation();
	function parse(header) {
		const protocols = /* @__PURE__ */ new Set();
		let start = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			const code = header.charCodeAt(i);
			if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (i !== 0 && (code === 32 || code === 9)) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				const protocol$1 = header.slice(start, end);
				if (protocols.has(protocol$1)) throw new SyntaxError(`The "${protocol$1}" subprotocol is duplicated`);
				protocols.add(protocol$1);
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || end !== -1) throw new SyntaxError("Unexpected end of input");
		const protocol = header.slice(start, i);
		if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
		protocols.add(protocol);
		return protocols;
	}
	subprotocol = { parse };
	return subprotocol;
}
var websocketServer;
var hasRequiredWebsocketServer;
function requireWebsocketServer() {
	if (hasRequiredWebsocketServer) return websocketServer;
	hasRequiredWebsocketServer = 1;
	const EventEmitter = require$$0$3;
	const http = require$$2;
	const { Duplex: Duplex$1 } = require$$0$2;
	const { createHash } = require$$1;
	const extension$1 = requireExtension();
	const PerMessageDeflate = requirePermessageDeflate();
	const subprotocol$1 = requireSubprotocol();
	const WebSocket = requireWebsocket();
	const { GUID, kWebSocket } = requireConstants();
	const keyRegex = /^[+/0-9A-Za-z]{22}==$/;
	const RUNNING = 0;
	const CLOSING = 1;
	const CLOSED = 2;
	class WebSocketServer extends EventEmitter {
		constructor(options, callback) {
			super();
			options = {
				allowSynchronousEvents: true,
				autoPong: true,
				maxPayload: 100 * 1024 * 1024,
				skipUTF8Validation: false,
				perMessageDeflate: false,
				handleProtocols: null,
				clientTracking: true,
				verifyClient: null,
				noServer: false,
				backlog: null,
				server: null,
				host: null,
				path: null,
				port: null,
				WebSocket,
				...options
			};
			if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) throw new TypeError("One and only one of the \"port\", \"server\", or \"noServer\" options must be specified");
			if (options.port != null) {
				this._server = http.createServer((req, res) => {
					const body = http.STATUS_CODES[426];
					res.writeHead(426, {
						"Content-Length": body.length,
						"Content-Type": "text/plain"
					});
					res.end(body);
				});
				this._server.listen(options.port, options.host, options.backlog, callback);
			} else if (options.server) this._server = options.server;
			if (this._server) {
				const emitConnection = this.emit.bind(this, "connection");
				this._removeListeners = addListeners(this._server, {
					listening: this.emit.bind(this, "listening"),
					error: this.emit.bind(this, "error"),
					upgrade: (req, socket, head) => {
						this.handleUpgrade(req, socket, head, emitConnection);
					}
				});
			}
			if (options.perMessageDeflate === true) options.perMessageDeflate = {};
			if (options.clientTracking) {
				this.clients = /* @__PURE__ */ new Set();
				this._shouldEmitClose = false;
			}
			this.options = options;
			this._state = RUNNING;
		}
		address() {
			if (this.options.noServer) throw new Error("The server is operating in \"noServer\" mode");
			if (!this._server) return null;
			return this._server.address();
		}
		close(cb) {
			if (this._state === CLOSED) {
				if (cb) this.once("close", () => {
					cb(/* @__PURE__ */ new Error("The server is not running"));
				});
				process.nextTick(emitClose, this);
				return;
			}
			if (cb) this.once("close", cb);
			if (this._state === CLOSING) return;
			this._state = CLOSING;
			if (this.options.noServer || this.options.server) {
				if (this._server) {
					this._removeListeners();
					this._removeListeners = this._server = null;
				}
				if (this.clients) if (!this.clients.size) process.nextTick(emitClose, this);
				else this._shouldEmitClose = true;
				else process.nextTick(emitClose, this);
			} else {
				const server$1 = this._server;
				this._removeListeners();
				this._removeListeners = this._server = null;
				server$1.close(() => {
					emitClose(this);
				});
			}
		}
		shouldHandle(req) {
			if (this.options.path) {
				const index$1 = req.url.indexOf("?");
				if ((index$1 !== -1 ? req.url.slice(0, index$1) : req.url) !== this.options.path) return false;
			}
			return true;
		}
		handleUpgrade(req, socket, head, cb) {
			socket.on("error", socketOnError);
			const key$1 = req.headers["sec-websocket-key"];
			const upgrade = req.headers.upgrade;
			const version = +req.headers["sec-websocket-version"];
			if (req.method !== "GET") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 405, "Invalid HTTP method");
				return;
			}
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Upgrade header");
				return;
			}
			if (key$1 === void 0 || !keyRegex.test(key$1)) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Key header");
				return;
			}
			if (version !== 8 && version !== 13) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Version header");
				return;
			}
			if (!this.shouldHandle(req)) {
				abortHandshake(socket, 400);
				return;
			}
			const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
			let protocols = /* @__PURE__ */ new Set();
			if (secWebSocketProtocol !== void 0) try {
				protocols = subprotocol$1.parse(secWebSocketProtocol);
			} catch (err) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Sec-WebSocket-Protocol header");
				return;
			}
			const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
			const extensions = {};
			if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
				const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
				try {
					const offers = extension$1.parse(secWebSocketExtensions);
					if (offers[PerMessageDeflate.extensionName]) {
						perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
						extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
					}
				} catch (err) {
					abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid or unacceptable Sec-WebSocket-Extensions header");
					return;
				}
			}
			if (this.options.verifyClient) {
				const info = {
					origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
					secure: !!(req.socket.authorized || req.socket.encrypted),
					req
				};
				if (this.options.verifyClient.length === 2) {
					this.options.verifyClient(info, (verified, code, message, headers$1) => {
						if (!verified) return abortHandshake(socket, code || 401, message, headers$1);
						this.completeUpgrade(extensions, key$1, protocols, req, socket, head, cb);
					});
					return;
				}
				if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
			}
			this.completeUpgrade(extensions, key$1, protocols, req, socket, head, cb);
		}
		completeUpgrade(extensions, key$1, protocols, req, socket, head, cb) {
			if (!socket.readable || !socket.writable) return socket.destroy();
			if (socket[kWebSocket]) throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
			if (this._state > RUNNING) return abortHandshake(socket, 503);
			const headers$1 = [
				"HTTP/1.1 101 Switching Protocols",
				"Upgrade: websocket",
				"Connection: Upgrade",
				`Sec-WebSocket-Accept: ${createHash("sha1").update(key$1 + GUID).digest("base64")}`
			];
			const ws = new this.options.WebSocket(null, void 0, this.options);
			if (protocols.size) {
				const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
				if (protocol) {
					headers$1.push(`Sec-WebSocket-Protocol: ${protocol}`);
					ws._protocol = protocol;
				}
			}
			if (extensions[PerMessageDeflate.extensionName]) {
				const params = extensions[PerMessageDeflate.extensionName].params;
				const value = extension$1.format({ [PerMessageDeflate.extensionName]: [params] });
				headers$1.push(`Sec-WebSocket-Extensions: ${value}`);
				ws._extensions = extensions;
			}
			this.emit("headers", headers$1, req);
			socket.write(headers$1.concat("\r\n").join("\r\n"));
			socket.removeListener("error", socketOnError);
			ws.setSocket(socket, head, {
				allowSynchronousEvents: this.options.allowSynchronousEvents,
				maxPayload: this.options.maxPayload,
				skipUTF8Validation: this.options.skipUTF8Validation
			});
			if (this.clients) {
				this.clients.add(ws);
				ws.on("close", () => {
					this.clients.delete(ws);
					if (this._shouldEmitClose && !this.clients.size) process.nextTick(emitClose, this);
				});
			}
			cb(ws, req);
		}
	}
	websocketServer = WebSocketServer;
	function addListeners(server$1, map) {
		for (const event of Object.keys(map)) server$1.on(event, map[event]);
		return function removeListeners() {
			for (const event of Object.keys(map)) server$1.removeListener(event, map[event]);
		};
	}
	function emitClose(server$1) {
		server$1._state = CLOSED;
		server$1.emit("close");
	}
	function socketOnError() {
		this.destroy();
	}
	function abortHandshake(socket, code, message, headers$1) {
		message = message || http.STATUS_CODES[code];
		headers$1 = {
			Connection: "close",
			"Content-Type": "text/html",
			"Content-Length": Buffer.byteLength(message),
			...headers$1
		};
		socket.once("finish", socket.destroy);
		socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` + Object.keys(headers$1).map((h) => `${h}: ${headers$1[h]}`).join("\r\n") + "\r\n\r\n" + message);
	}
	function abortHandshakeOrEmitwsClientError(server$1, req, socket, code, message) {
		if (server$1.listenerCount("wsClientError")) {
			const err = new Error(message);
			Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
			server$1.emit("wsClientError", err, socket, req);
		} else abortHandshake(socket, code, message);
	}
	return websocketServer;
}
requireWebsocketServer();
var NullProtoObj = /* @__PURE__ */ (() => {
	const e = function() {};
	return e.prototype = Object.create(null), Object.freeze(e.prototype), e;
})();
var kEventNS = "h3.internal.event.";
var kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
var kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
var H3Event = class {
	app;
	req;
	url;
	context;
	static __is_event__ = true;
	constructor(req, context, app$1) {
		this.context = context || req.context || new NullProtoObj();
		this.req = req;
		this.app = app$1;
		const _url = req._url;
		this.url = _url && _url instanceof URL ? _url : new FastURL(req.url);
	}
	get res() {
		return this[kEventRes] ||= new H3EventResponse();
	}
	get runtime() {
		return this.req.runtime;
	}
	waitUntil(promise) {
		this.req.waitUntil?.(promise);
	}
	toString() {
		return `[${this.req.method}] ${this.req.url}`;
	}
	toJSON() {
		return this.toString();
	}
	get node() {
		return this.req.runtime?.node;
	}
	get headers() {
		return this.req.headers;
	}
	get path() {
		return this.url.pathname + this.url.search;
	}
	get method() {
		return this.req.method;
	}
};
var H3EventResponse = class {
	status;
	statusText;
	get headers() {
		return this[kEventResHeaders] ||= new Headers();
	}
};
var DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
	return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
	if (!statusCode) return defaultStatusCode;
	if (typeof statusCode === "string") statusCode = +statusCode;
	if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
	return statusCode;
}
var HTTPError = class HTTPError$1 extends Error {
	get name() {
		return "HTTPError";
	}
	status;
	statusText;
	headers;
	cause;
	data;
	body;
	unhandled;
	static isError(input) {
		return input instanceof Error && input?.name === "HTTPError";
	}
	static status(status, statusText, details) {
		return new HTTPError$1({
			...details,
			statusText,
			status
		});
	}
	constructor(arg1, arg2) {
		let messageInput;
		let details;
		if (typeof arg1 === "string") {
			messageInput = arg1;
			details = arg2;
		} else details = arg1;
		const status = sanitizeStatusCode(details?.status || (details?.cause)?.status || details?.status || details?.statusCode, 500);
		const statusText = sanitizeStatusMessage(details?.statusText || (details?.cause)?.statusText || details?.statusText || details?.statusMessage);
		const message = messageInput || details?.message || (details?.cause)?.message || details?.statusText || details?.statusMessage || [
			"HTTPError",
			status,
			statusText
		].filter(Boolean).join(" ");
		super(message, { cause: details });
		this.cause = details;
		Error.captureStackTrace?.(this, this.constructor);
		this.status = status;
		this.statusText = statusText || void 0;
		const rawHeaders = details?.headers || (details?.cause)?.headers;
		this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
		this.unhandled = details?.unhandled ?? (details?.cause)?.unhandled ?? void 0;
		this.data = details?.data;
		this.body = details?.body;
	}
	get statusCode() {
		return this.status;
	}
	get statusMessage() {
		return this.statusText;
	}
	toJSON() {
		const unhandled = this.unhandled;
		return {
			status: this.status,
			statusText: this.statusText,
			unhandled,
			message: unhandled ? "HTTPError" : this.message,
			data: unhandled ? void 0 : this.data,
			...unhandled ? void 0 : this.body
		};
	}
};
function isJSONSerializable(value, _type) {
	if (value === null || value === void 0) return true;
	if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
	if (typeof value.toJSON === "function") return true;
	if (Array.isArray(value)) return true;
	if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
	if (value instanceof NullProtoObj) return true;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
var kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
var kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
	if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
	const response = prepareResponse(val, event, config);
	if (typeof response?.then === "function") return toResponse(response, event, config);
	const { onResponse: onResponse$1 } = config;
	return onResponse$1 ? Promise.resolve(onResponse$1(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
	#headers;
	#init;
	body;
	constructor(body, init) {
		this.body = body;
		this.#init = init;
	}
	get status() {
		return this.#init?.status || 200;
	}
	get statusText() {
		return this.#init?.statusText || "OK";
	}
	get headers() {
		return this.#headers ||= new Headers(this.#init?.headers);
	}
};
function prepareResponse(val, event, config, nested) {
	if (val === kHandled) return new NodeResponse(null);
	if (val === kNotFound) val = new HTTPError({
		status: 404,
		message: `Cannot find any route matching [${event.req.method}] ${event.url}`
	});
	if (val && val instanceof Error) {
		const isHTTPError = HTTPError.isError(val);
		const error = isHTTPError ? val : new HTTPError(val);
		if (!isHTTPError) {
			error.unhandled = true;
			if (val?.stack) error.stack = val.stack;
		}
		if (error.unhandled && !config.silent) console.error(error);
		const { onError: onError$1 } = config;
		return onError$1 && !nested ? Promise.resolve(onError$1(error, event)).catch((error$1) => error$1).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug);
	}
	const preparedRes = event[kEventRes];
	const preparedHeaders = preparedRes?.[kEventResHeaders];
	if (!(val instanceof Response)) {
		const res = prepareResponseBody(val, event, config);
		const status = res.status || preparedRes?.status;
		return new NodeResponse(nullBody(event.req.method, status) ? null : res.body, {
			status,
			statusText: res.statusText || preparedRes?.statusText,
			headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
		});
	}
	if (!preparedHeaders || nested || !val.ok) return val;
	try {
		mergeHeaders$1(val.headers, preparedHeaders, val.headers);
		return val;
	} catch {
		return new NodeResponse(nullBody(event.req.method, val.status) ? null : val.body, {
			status: val.status,
			statusText: val.statusText,
			headers: mergeHeaders$1(val.headers, preparedHeaders)
		});
	}
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
	for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
	else target.set(name, value);
	return target;
}
var frozenHeaders = () => {
	throw new Error("Headers are frozen");
};
var FrozenHeaders = class extends Headers {
	constructor(init) {
		super(init);
		this.set = this.append = this.delete = frozenHeaders;
	}
};
var emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
var jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
	if (val === null || val === void 0) return {
		body: "",
		headers: emptyHeaders
	};
	const valType = typeof val;
	if (valType === "string") return { body: val };
	if (val instanceof Uint8Array) {
		event.res.headers.set("content-length", val.byteLength.toString());
		return { body: val };
	}
	if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
	if (isJSONSerializable(val, valType)) return {
		body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
		headers: jsonHeaders
	};
	if (valType === "bigint") return {
		body: val.toString(),
		headers: jsonHeaders
	};
	if (val instanceof Blob) {
		const headers$1 = new Headers({
			"content-type": val.type,
			"content-length": val.size.toString()
		});
		let filename = val.name;
		if (filename) {
			filename = encodeURIComponent(filename);
			headers$1.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
		}
		return {
			body: val.stream(),
			headers: headers$1
		};
	}
	if (valType === "symbol") return { body: val.toString() };
	if (valType === "function") return { body: `${val.name}()` };
	return { body: val };
}
function nullBody(method, status) {
	return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug) {
	return new NodeResponse(JSON.stringify({
		...error.toJSON(),
		stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
	}, void 0, debug ? 2 : void 0), {
		status: error.status,
		statusText: error.statusText,
		headers: error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders)
	});
}
function callMiddleware(event, middleware, handler, index$1 = 0) {
	if (index$1 === middleware.length) return handler(event);
	const fn = middleware[index$1];
	let nextCalled;
	let nextResult;
	const next = () => {
		if (nextCalled) return nextResult;
		nextCalled = true;
		nextResult = callMiddleware(event, middleware, handler, index$1 + 1);
		return nextResult;
	};
	const ret = fn(event, next);
	return isUnhandledResponse(ret) ? next() : typeof ret?.then === "function" ? ret.then((resolved) => isUnhandledResponse(resolved) ? next() : resolved) : ret;
}
function isUnhandledResponse(val) {
	return val === void 0 || val === kNotFound;
}
function toMiddleware(input) {
	let h = input.handler || input;
	let isFunction = typeof h === "function";
	if (!isFunction && typeof input?.fetch === "function") {
		isFunction = true;
		h = function _fetchHandler(event) {
			return input.fetch(event.req);
		};
	}
	if (!isFunction) return function noopMiddleware(event, next) {
		return next();
	};
	if (h.length === 2) return h;
	return function _middlewareHandler(event, next) {
		const res = h(event);
		return typeof res?.then === "function" ? res.then((r$1) => {
			return is404(r$1) ? next() : r$1;
		}) : is404(res) ? next() : res;
	};
}
function is404(val) {
	return isUnhandledResponse(val) || val?.status === 404 && val instanceof Response;
}
function defineHandler(input) {
	if (typeof input === "function") return handlerWithFetch(input);
	const handler = input.handler || (input.fetch ? function _fetchHandler(event) {
		return input.fetch(event.req);
	} : NoHandler);
	return Object.assign(handlerWithFetch(input.middleware?.length ? function _handlerMiddleware(event) {
		return callMiddleware(event, input.middleware, handler);
	} : handler), input);
}
function handlerWithFetch(handler) {
	if ("fetch" in handler) return handler;
	return Object.assign(handler, { fetch: (req) => {
		if (typeof req === "string") req = new URL(req, "http://_");
		if (req instanceof URL) req = new Request(req);
		const event = new H3Event(req);
		try {
			return Promise.resolve(toResponse(handler(event), event));
		} catch (error) {
			return Promise.resolve(toResponse(error, event));
		}
	} });
}
function defineLazyEventHandler(loader) {
	let handler;
	let promise;
	const resolveLazyHandler = () => {
		if (handler) return Promise.resolve(handler);
		return promise ??= Promise.resolve(loader()).then((r$1) => {
			handler = toEventHandler(r$1) || toEventHandler(r$1.default);
			if (typeof handler !== "function") throw new TypeError("Invalid lazy handler", { cause: { resolved: r$1 } });
			return handler;
		});
	};
	return defineHandler(function lazyHandler(event) {
		return handler ? handler(event) : resolveLazyHandler().then((r$1) => r$1(event));
	});
}
function toEventHandler(handler) {
	if (typeof handler === "function") return handler;
	if (typeof handler?.handler === "function") return handler.handler;
	if (typeof handler?.fetch === "function") return function _fetchHandler(event) {
		return handler.fetch(event.req);
	};
}
var NoHandler = () => kNotFound;
var H3Core = class {
	config;
	"~middleware";
	"~routes" = [];
	constructor(config = {}) {
		this["~middleware"] = [];
		this.config = config;
		this.fetch = this.fetch.bind(this);
		this.handler = this.handler.bind(this);
	}
	fetch(request) {
		return this["~request"](request);
	}
	handler(event) {
		const route = this["~findRoute"](event);
		if (route) {
			event.context.params = route.params;
			event.context.matchedRoute = route.data;
		}
		const routeHandler = route?.data.handler || NoHandler;
		const middleware = this["~getMiddleware"](event, route);
		return middleware.length > 0 ? callMiddleware(event, middleware, routeHandler) : routeHandler(event);
	}
	"~request"(request, context) {
		const event = new H3Event(request, context, this);
		let handlerRes;
		try {
			if (this.config.onRequest) {
				const hookRes = this.config.onRequest(event);
				handlerRes = typeof hookRes?.then === "function" ? hookRes.then(() => this.handler(event)) : this.handler(event);
			} else handlerRes = this.handler(event);
		} catch (error) {
			handlerRes = Promise.reject(error);
		}
		return toResponse(handlerRes, event, this.config);
	}
	"~findRoute"(_event) {}
	"~addRoute"(_route) {
		this["~routes"].push(_route);
	}
	"~getMiddleware"(_event, route) {
		const routeMiddleware = route?.data.middleware;
		const globalMiddleware$1 = this["~middleware"];
		return routeMiddleware ? [...globalMiddleware$1, ...routeMiddleware] : globalMiddleware$1;
	}
};
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result instanceof Promise) return result.then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
var prod_default = errorHandler;
function defaultHandler(error, event, opts) {
	const isSensitive = error.unhandled;
	const status = error.status || 500;
	const url = event.url || new URL(event.req.url);
	if (status === 404) {
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			statusText: "Found",
			headers: { location: `${baseURL}${url.pathname.slice(1)}${url.search}` },
			body: `Redirecting...`
		};
	}
	if (isSensitive && !opts?.silent) {
		const tags = [error.unhandled && "[unhandled]"].filter(Boolean).join(" ");
		console.error(`[request error] ${tags} [${event.req.method}] ${url}\n`, error);
	}
	const headers$1 = {
		"content-type": "application/json",
		"x-content-type-options": "nosniff",
		"x-frame-options": "DENY",
		"referrer-policy": "no-referrer",
		"content-security-policy": "script-src 'none'; frame-ancestors 'none';"
	};
	if (status === 404 || !event.res.headers.has("cache-control")) headers$1["cache-control"] = "no-cache";
	const body = {
		error: true,
		url: url.href,
		status,
		statusText: error.statusText,
		message: isSensitive ? "Server Error" : error.message,
		data: isSensitive ? void 0 : error.data
	};
	return {
		status,
		statusText: error.statusText,
		headers: headers$1,
		body
	};
}
var errorHandlers = [prod_default];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error$1) {
		console.error(error$1);
	}
}
String.fromCharCode;
var ENC_SLASH_RE = /%2f/gi;
function decode(text$1 = "") {
	try {
		return decodeURIComponent("" + text$1);
	} catch {
		return "" + text$1;
	}
}
function decodePath(text$1) {
	return decode(text$1.replace(ENC_SLASH_RE, "%252F"));
}
var TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
var JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasTrailingSlash(input = "", respectQueryAndFragment) {
	if (!respectQueryAndFragment) return input.endsWith("/");
	return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
	if (!respectQueryAndFragment) return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
	if (!hasTrailingSlash(input, true)) return input || "/";
	let path$1 = input;
	let fragment = "";
	const fragmentIndex = input.indexOf("#");
	if (fragmentIndex !== -1) {
		path$1 = input.slice(0, fragmentIndex);
		fragment = input.slice(fragmentIndex);
	}
	const [s0, ...s] = path$1.split("?");
	return ((s0.endsWith("/") ? s0.slice(0, -1) : s0) || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
	if (!respectQueryAndFragment) return input.endsWith("/") ? input : input + "/";
	if (hasTrailingSlash(input, true)) return input || "/";
	let path$1 = input;
	let fragment = "";
	const fragmentIndex = input.indexOf("#");
	if (fragmentIndex !== -1) {
		path$1 = input.slice(0, fragmentIndex);
		fragment = input.slice(fragmentIndex);
		if (!path$1) return fragment;
	}
	const [s0, ...s] = path$1.split("?");
	return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
	return input.startsWith("/");
}
function withLeadingSlash(input = "") {
	return hasLeadingSlash(input) ? input : "/" + input;
}
function isNonEmptyURL(url) {
	return url && url !== "/";
}
function joinURL(base, ...input) {
	let url = base || "";
	for (const segment of input.filter((url2) => isNonEmptyURL(url2))) if (url) {
		const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
		url = withTrailingSlash(url) + _segment;
	} else url = segment;
	return url;
}
const headers = ((m) => function headersRouteRule(event) {
	for (const [key$1, value] of Object.entries(m.options || {})) event.res.headers.set(key$1, value);
});
var schema_exports = /* @__PURE__ */ __export({
	attendance: () => attendance,
	attendanceRelations: () => attendanceRelations,
	events: () => events,
	eventsRelations: () => eventsRelations,
	loyalty: () => loyalty,
	loyaltyRelations: () => loyaltyRelations,
	users: () => users,
	usersRelations: () => usersRelations
});
const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	firstName: text("firstName").notNull(),
	lastName: text("lastName").notNull(),
	phone: text("phone"),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull()
}, (table) => [index("idx_users_email").on(table.email), index("idx_users_createdAt").on(table.createdAt)]);
const events = sqliteTable("events", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	status: text("status", { enum: [
		"draft",
		"scheduled",
		"ongoing",
		"completed",
		"cancelled"
	] }).notNull(),
	startTime: integer("startTime", { mode: "timestamp_ms" }).notNull(),
	endTime: integer("endTime", { mode: "timestamp_ms" }).notNull(),
	location: text("location").notNull(),
	capacity: integer("capacity"),
	hostId: text("hostId").notNull().references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull()
}, (table) => [
	index("idx_events_status").on(table.status),
	index("idx_events_hostId").on(table.hostId),
	index("idx_events_startTime").on(table.startTime)
]);
const attendance = sqliteTable("attendance", {
	id: text("id").primaryKey(),
	eventId: text("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
	patronId: text("patronId").notNull().references(() => users.id, { onDelete: "cascade" }),
	attended: integer("attended", { mode: "boolean" }).notNull().default(false),
	checkInTime: integer("checkInTime", { mode: "timestamp_ms" }),
	checkOutTime: integer("checkOutTime", { mode: "timestamp_ms" })
}, (table) => [
	index("idx_attendance_eventId").on(table.eventId),
	index("idx_attendance_patronId").on(table.patronId),
	index("idx_attendance_attended").on(table.attended),
	index("idx_attendance_unique").on(table.eventId, table.patronId)
]);
const loyalty = sqliteTable("loyalty", {
	id: text("id").primaryKey(),
	patronId: text("patronId").notNull().references(() => users.id, { onDelete: "cascade" }),
	description: text("description").notNull(),
	tier: text("tier", { enum: [
		"bronze",
		"silver",
		"gold",
		"platinum"
	] }),
	points: integer("points").default(0),
	reward: text("reward"),
	issuedAt: integer("issuedAt", { mode: "timestamp_ms" }).notNull(),
	expiresAt: integer("expiresAt", { mode: "timestamp_ms" })
}, (table) => [index("idx_loyalty_patronId").on(table.patronId), index("idx_loyalty_tier").on(table.tier)]);
const usersRelations = relations(users, ({ many }) => ({
	hostedEvents: many(events),
	attendances: many(attendance),
	loyaltyRecords: many(loyalty)
}));
const eventsRelations = relations(events, ({ one, many }) => ({
	host: one(users, {
		fields: [events.hostId],
		references: [users.id]
	}),
	attendances: many(attendance)
}));
const attendanceRelations = relations(attendance, ({ one }) => ({
	event: one(events, {
		fields: [attendance.eventId],
		references: [events.id]
	}),
	patron: one(users, {
		fields: [attendance.patronId],
		references: [users.id]
	})
}));
const loyaltyRelations = relations(loyalty, ({ one }) => ({ patron: one(users, {
	fields: [loyalty.patronId],
	references: [users.id]
}) }));
var db = null;
var client = null;
function getBunClient(dbPath = path.join(process.cwd(), "data", "dwellpass.db")) {
	if (!client) {
		client = new Database(dbPath, {
			create: false,
			strict: true
		});
		client.run("PRAGMA journal_mode = WAL;");
		client.run("PRAGMA synchronous = NORMAL;");
		client.run("PRAGMA cache_size = -64000;");
		client.run("PRAGMA temp_store = MEMORY;");
		client.run("PRAGMA foreign_keys = ON;");
		console.log(`✓ Database connected: ${dbPath}`);
	}
	return client;
}
function getDatabase() {
	if (!db) db = drizzle(getBunClient(), { schema: schema_exports });
	return db;
}
var DatabaseManager = class DatabaseManager {
	static instance = null;
	db = null;
	client = null;
	dbPath;
	constructor(dbPath) {
		this.dbPath = dbPath || path.join(process.cwd(), "data", "dwellpass.db");
	}
	static getInstance(dbPath) {
		if (!DatabaseManager.instance) DatabaseManager.instance = new DatabaseManager(dbPath);
		return DatabaseManager.instance;
	}
	getDatabase() {
		if (!this.db) this.initializeDatabase();
		return this.db;
	}
	getClient() {
		if (!this.client) this.initializeDatabase();
		return this.client;
	}
	initializeDatabase() {
		if (!this.client) {
			this.client = new Database(this.dbPath, {
				create: true,
				strict: true
			});
			this.client.run("PRAGMA journal_mode = WAL;");
			this.client.run("PRAGMA synchronous = NORMAL;");
			this.client.run("PRAGMA cache_size = -64000;");
			this.client.run("PRAGMA temp_store = MEMORY;");
			this.client.run("PRAGMA foreign_keys = ON;");
			console.log(`✓ Database connected: ${this.dbPath}`);
		}
		if (!this.db) this.db = drizzle(this.client, { schema: schema_exports });
	}
	close() {
		if (this.client) {
			this.client.close();
			this.client = null;
			this.db = null;
		}
	}
};
var BaseAPI = class {
	db;
	client;
	constructor() {
		const dbManager = DatabaseManager.getInstance();
		this.db = dbManager.getDatabase();
		this.client = dbManager.getClient();
	}
	async findById(id) {
		try {
			return (await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1))[0];
		} catch (error) {
			throw new Error(`Failed to find ${this.tableName} by ID: ${error}`);
		}
	}
	async findAll() {
		try {
			return await this.db.select().from(this.table);
		} catch (error) {
			throw new Error(`Failed to find all ${this.tableName}: ${error}`);
		}
	}
	async create(data) {
		try {
			return (await this.db.insert(this.table).values(data).returning())?.[0];
		} catch (error) {
			throw new Error(`Failed to create ${this.tableName}: ${error}`);
		}
	}
	async update(id, data) {
		try {
			return (await this.db.update(this.table).set(data).where(eq(this.table.id, id)).returning())?.[0];
		} catch (error) {
			throw new Error(`Failed to update ${this.tableName}: ${error}`);
		}
	}
	async delete(id) {
		try {
			if (!await this.findById(id)) return false;
			await this.db.delete(this.table).where(eq(this.table.id, id));
			return true;
		} catch (error) {
			throw new Error(`Failed to delete ${this.tableName}: ${error}`);
		}
	}
};
const EventStatusEnum = z.enum([
	"draft",
	"scheduled",
	"ongoing",
	"completed",
	"cancelled"
]);
const LoyaltyTierEnum = z.enum([
	"bronze",
	"silver",
	"gold",
	"platinum"
]);
z.enum([
	"attendance_update",
	"event_status_change",
	"announcement",
	"milestone",
	"reward_earned"
]);
const UserSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	firstName: z.string().min(1, "Firstname should be more than a character"),
	lastName: z.string().min(1),
	phone: z.string().optional(),
	createdAt: z.number().optional(),
	updatedAt: z.number().optional()
});
const EventSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	description: z.string().optional(),
	status: EventStatusEnum,
	startTime: z.date(),
	endTime: z.date(),
	location: z.string().min(1),
	capacity: z.number().int().positive().optional(),
	hostId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date()
}).refine((data) => data.endTime > data.startTime, {
	message: "End time must be after start time",
	path: ["endTime"]
});
const CreateEventSchema = EventSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});
const AttendanceSchema = z.object({
	id: z.uuid(),
	eventId: z.uuid(),
	patronId: z.uuid(),
	attended: z.boolean(),
	checkInTime: z.date().nullable(),
	checkOutTime: z.date().nullable()
}).refine((data) => {
	if (data.checkOutTime && data.checkInTime) return data.checkOutTime >= data.checkInTime;
	return true;
}, {
	message: "Check out time must be after or equal to check in time",
	path: ["checkOutTime"]
});
const CheckInSchema = z.object({
	eventId: z.uuid(),
	patronId: z.uuid()
});
const LoyaltySchema = z.object({
	id: z.uuid(),
	patronId: z.uuid(),
	description: z.string(),
	tier: LoyaltyTierEnum.optional(),
	points: z.number().int().nonnegative().optional(),
	reward: z.string().optional(),
	issuedAt: z.date(),
	expiresAt: z.date().optional()
});
var UserAPI = class extends BaseAPI {
	table = users;
	tableName = "users";
	async findByEmail(email) {
		try {
			return (await this.db.select().from(users).where(eq(users.email, email)).limit(1))[0];
		} catch (error) {
			throw new Error(`Failed to find user by email: ${error}`);
		}
	}
	async findAllOrdered() {
		try {
			return await this.db.select().from(users).orderBy(desc(users.createdAt));
		} catch (error) {
			throw new Error(`Failed to find ordered users: ${error}`);
		}
	}
};
var userAPI = new UserAPI();
var usersRouter = new Hono();
var CreateUserSchema = UserSchema.omit({
	createdAt: true,
	updatedAt: true
});
var UpdateUserSchema = CreateUserSchema.partial().omit({ id: true });
usersRouter.get("/", async (c) => {
	try {
		const allUsers = await userAPI.findAllOrdered();
		return c.json(allUsers);
	} catch (error) {
		console.error("Error fetching users:", error);
		return c.json({ error: "Failed to fetch users" }, 500);
	}
});
usersRouter.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const user = await userAPI.findById(id);
		if (!user) return c.json({ error: "User not found" }, 404);
		return c.json(user);
	} catch (error) {
		console.error("Error fetching user:", error);
		return c.json({ error: "Failed to fetch user" }, 500);
	}
});
usersRouter.post("/", async (c) => {
	try {
		const body = await c.req.json();
		const validated = CreateUserSchema.parse(body);
		if (await userAPI.findByEmail(validated.email)) return c.json({ error: "User with this email already exists" }, 409);
		const now = /* @__PURE__ */ new Date();
		const user = await userAPI.create({
			...validated,
			createdAt: now,
			updatedAt: now
		});
		return c.json(user, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error creating user:", error);
		return c.json({ error: "Failed to create user" }, 500);
	}
});
usersRouter.put("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const validated = UpdateUserSchema.parse(body);
		if (validated.email) {
			const existing = await userAPI.findByEmail(validated.email);
			if (existing && existing.id !== id) return c.json({ error: "Email already in use" }, 409);
		}
		const user = await userAPI.update(id, {
			...validated,
			updatedAt: /* @__PURE__ */ new Date()
		});
		if (!user) return c.json({ error: "User not found" }, 404);
		return c.json(user);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error updating user:", error);
		return c.json({ error: "Failed to update user" }, 500);
	}
});
usersRouter.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		if (!await userAPI.delete(id)) return c.json({ error: "User not found" }, 404);
		return c.json({ success: true }, 200);
	} catch (error) {
		console.error("Error deleting user:", error);
		return c.json({ error: "Failed to delete user" }, 500);
	}
});
var users_default = usersRouter;
var EventAPI = class extends BaseAPI {
	table = events;
	tableName = "events";
	async findByStatus(status) {
		try {
			return await this.db.select().from(events).where(eq(events.status, status)).orderBy(desc(events.startTime));
		} catch (error) {
			throw new Error(`Failed to find events by status: ${error}`);
		}
	}
	async findByHostId(hostId) {
		try {
			return await this.db.select().from(events).where(eq(events.hostId, hostId)).orderBy(desc(events.startTime));
		} catch (error) {
			throw new Error(`Failed to find events by host: ${error}`);
		}
	}
	async findByDateRange(startDate, endDate) {
		try {
			return await this.db.select().from(events).where(and(gte(events.startTime, startDate), lte(events.endTime, endDate))).orderBy(desc(events.startTime));
		} catch (error) {
			throw new Error(`Failed to find events by date range: ${error}`);
		}
	}
	async updateStatus(id, status) {
		return await this.update(id, { status });
	}
};
var eventAPI = new EventAPI();
var eventsRouter = new Hono();
var UpdateEventSchema = EventSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true
});
eventsRouter.get("/", async (c) => {
	try {
		const status = c.req.query("status");
		const hostId = c.req.query("hostId");
		let allEvents;
		if (status) allEvents = await eventAPI.findByStatus(status);
		else if (hostId) allEvents = await eventAPI.findByHostId(hostId);
		else allEvents = await eventAPI.findAll();
		return c.json(allEvents);
	} catch (error) {
		console.error("Error fetching events:", error);
		return c.json({ error: "Failed to fetch events" }, 500);
	}
});
eventsRouter.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const event = await eventAPI.findById(id);
		if (!event) return c.json({ error: "Event not found" }, 404);
		return c.json(event);
	} catch (error) {
		console.error("Error fetching event:", error);
		return c.json({ error: "Failed to fetch event" }, 500);
	}
});
eventsRouter.post("/", async (c) => {
	try {
		const body = await c.req.json();
		const processedBody = {
			...body,
			startTime: new Date(body.startTime),
			endTime: new Date(body.endTime)
		};
		const validated = CreateEventSchema.parse(processedBody);
		const now = /* @__PURE__ */ new Date();
		const event = await eventAPI.create({
			...validated,
			id: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now
		});
		return c.json(event, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error creating event:", error);
		return c.json({ error: "Failed to create event" }, 500);
	}
});
eventsRouter.put("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const processedBody = body.startTime || body.endTime ? {
			...body,
			...body.startTime && { startTime: new Date(body.startTime) },
			...body.endTime && { endTime: new Date(body.endTime) }
		} : body;
		const validated = UpdateEventSchema.parse(processedBody);
		const event = await eventAPI.update(id, {
			...validated,
			updatedAt: /* @__PURE__ */ new Date()
		});
		if (!event) return c.json({ error: "Event not found" }, 404);
		return c.json(event);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error updating event:", error);
		return c.json({ error: "Failed to update event" }, 500);
	}
});
eventsRouter.patch("/:id/status", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const { status } = EventSchema.pick({ status: true }).parse(body);
		const event = await eventAPI.updateStatus(id, status);
		if (!event) return c.json({ error: "Event not found" }, 404);
		return c.json(event);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error updating event status:", error);
		return c.json({ error: "Failed to update event status" }, 500);
	}
});
eventsRouter.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		if (!await eventAPI.delete(id)) return c.json({ error: "Event not found" }, 404);
		return c.json({ success: true }, 200);
	} catch (error) {
		console.error("Error deleting event:", error);
		return c.json({ error: "Failed to delete event" }, 500);
	}
});
var events_default = eventsRouter;
var AttendanceAPI = class extends BaseAPI {
	table = attendance;
	tableName = "attendance";
	async findByEventId(eventId) {
		try {
			return await this.db.select().from(attendance).where(eq(attendance.eventId, eventId)).orderBy(desc(attendance.checkInTime));
		} catch (error) {
			throw new Error(`Failed to find attendance by event: ${error}`);
		}
	}
	async findByPatronId(patronId) {
		try {
			return await this.db.select().from(attendance).where(eq(attendance.patronId, patronId)).orderBy(desc(attendance.checkInTime));
		} catch (error) {
			throw new Error(`Failed to find attendance by patron: ${error}`);
		}
	}
	async findByEventAndPatron(eventId, patronId) {
		try {
			return (await this.db.select().from(attendance).where(and(eq(attendance.eventId, eventId), eq(attendance.patronId, patronId))).limit(1))[0];
		} catch (error) {
			throw new Error(`Failed to find attendance by event and patron: ${error}`);
		}
	}
	async findAttendedByEvent(eventId) {
		try {
			return await this.db.select().from(attendance).where(and(eq(attendance.eventId, eventId), eq(attendance.attended, true))).orderBy(desc(attendance.checkInTime));
		} catch (error) {
			throw new Error(`Failed to find attended records by event: ${error}`);
		}
	}
	async checkIn(eventId, patronId, id) {
		try {
			const existing = await this.findByEventAndPatron(eventId, patronId);
			if (existing) {
				const updated = await this.update(existing.id, {
					attended: true,
					checkInTime: /* @__PURE__ */ new Date()
				});
				if (!updated) throw new Error("Failed to update attendance");
				return updated;
			} else return await this.create({
				id,
				eventId,
				patronId,
				attended: true,
				checkInTime: /* @__PURE__ */ new Date(),
				checkOutTime: null
			});
		} catch (error) {
			throw new Error(`Failed to check in: ${error}`);
		}
	}
	async checkOut(eventId, patronId) {
		try {
			const existing = await this.findByEventAndPatron(eventId, patronId);
			if (!existing) return void 0;
			return await this.update(existing.id, { checkOutTime: /* @__PURE__ */ new Date() });
		} catch (error) {
			throw new Error(`Failed to check out: ${error}`);
		}
	}
	async getEventStats(eventId) {
		try {
			const records = await this.findByEventId(eventId);
			return {
				total: records.length,
				attended: records.filter((r$1) => r$1.attended).length,
				checkedIn: records.filter((r$1) => r$1.checkInTime !== null).length,
				checkedOut: records.filter((r$1) => r$1.checkOutTime !== null).length
			};
		} catch (error) {
			throw new Error(`Failed to get event stats: ${error}`);
		}
	}
};
var attendanceAPI = new AttendanceAPI();
var attendanceRouter = new Hono();
var CreateAttendanceSchema = AttendanceSchema.omit({});
var UpdateAttendanceSchema = AttendanceSchema.partial().omit({ id: true });
attendanceRouter.get("/", async (c) => {
	try {
		const eventId = c.req.query("eventId");
		const patronId = c.req.query("patronId");
		let records;
		if (eventId) records = await attendanceAPI.findByEventId(eventId);
		else if (patronId) records = await attendanceAPI.findByPatronId(patronId);
		else records = await attendanceAPI.findAll();
		return c.json(records);
	} catch (error) {
		console.error("Error fetching attendance:", error);
		return c.json({ error: "Failed to fetch attendance records" }, 500);
	}
});
attendanceRouter.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const record = await attendanceAPI.findById(id);
		if (!record) return c.json({ error: "Attendance record not found" }, 404);
		return c.json(record);
	} catch (error) {
		console.error("Error fetching attendance:", error);
		return c.json({ error: "Failed to fetch attendance record" }, 500);
	}
});
attendanceRouter.get("/event/:eventId/stats", async (c) => {
	try {
		const eventId = c.req.param("eventId");
		const stats = await attendanceAPI.getEventStats(eventId);
		return c.json(stats);
	} catch (error) {
		console.error("Error fetching event stats:", error);
		return c.json({ error: "Failed to fetch event statistics" }, 500);
	}
});
attendanceRouter.post("/", async (c) => {
	try {
		const body = await c.req.json();
		const processedBody = { ...body };
		if (body.checkInTime) processedBody.checkInTime = new Date(body.checkInTime);
		if (body.checkOutTime) processedBody.checkOutTime = new Date(body.checkOutTime);
		const validated = CreateAttendanceSchema.parse(processedBody);
		const record = await attendanceAPI.create(validated);
		return c.json(record, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error creating attendance:", error);
		return c.json({ error: "Failed to create attendance record" }, 500);
	}
});
attendanceRouter.post("/checkin", async (c) => {
	try {
		const body = await c.req.json();
		const validated = CheckInSchema.parse(body);
		const id = crypto.randomUUID();
		const record = await attendanceAPI.checkIn(validated.eventId, validated.patronId, id);
		return c.json(record, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error checking in:", error);
		return c.json({ error: "Failed to check in" }, 500);
	}
});
attendanceRouter.post("/checkout", async (c) => {
	try {
		const body = await c.req.json();
		const validated = CheckInSchema.parse(body);
		const record = await attendanceAPI.checkOut(validated.eventId, validated.patronId);
		if (!record) return c.json({ error: "Attendance record not found" }, 404);
		return c.json(record);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error checking out:", error);
		return c.json({ error: "Failed to check out" }, 500);
	}
});
attendanceRouter.put("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const processedBody = { ...body };
		if (body.checkInTime) processedBody.checkInTime = new Date(body.checkInTime);
		if (body.checkOutTime) processedBody.checkOutTime = new Date(body.checkOutTime);
		const validated = UpdateAttendanceSchema.parse(processedBody);
		const record = await attendanceAPI.update(id, validated);
		if (!record) return c.json({ error: "Attendance record not found" }, 404);
		return c.json(record);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error updating attendance:", error);
		return c.json({ error: "Failed to update attendance record" }, 500);
	}
});
attendanceRouter.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		if (!await attendanceAPI.delete(id)) return c.json({ error: "Attendance record not found" }, 404);
		return c.json({ success: true }, 200);
	} catch (error) {
		console.error("Error deleting attendance:", error);
		return c.json({ error: "Failed to delete attendance record" }, 500);
	}
});
var attendance_default = attendanceRouter;
var LoyaltyAPI = class extends BaseAPI {
	table = loyalty;
	tableName = "loyalty";
	async findAll() {
		try {
			return await this.db.select().from(loyalty).orderBy(desc(loyalty.issuedAt));
		} catch (error) {
			throw new Error(`Failed to find all loyalty records: ${error}`);
		}
	}
	async findByPatronId(patronId) {
		try {
			return await this.db.select().from(loyalty).where(eq(loyalty.patronId, patronId)).orderBy(desc(loyalty.issuedAt));
		} catch (error) {
			throw new Error(`Failed to find loyalty records by patron: ${error}`);
		}
	}
	async findByTier(tier) {
		try {
			if (tier === null) return await this.db.select().from(loyalty).orderBy(desc(loyalty.issuedAt));
			return await this.db.select().from(loyalty).where(eq(loyalty.tier, tier)).orderBy(desc(loyalty.issuedAt));
		} catch (error) {
			throw new Error(`Failed to find loyalty records by tier: ${error}`);
		}
	}
	async findActiveByPatronId(patronId) {
		try {
			const now = /* @__PURE__ */ new Date();
			return await this.db.select().from(loyalty).where(and(eq(loyalty.patronId, patronId), gte(loyalty.expiresAt, now))).orderBy(desc(loyalty.issuedAt));
		} catch (error) {
			throw new Error(`Failed to find active loyalty records: ${error}`);
		}
	}
	async getTotalPoints(patronId) {
		try {
			return (await this.findActiveByPatronId(patronId)).reduce((sum, record) => sum + (record.points || 0), 0);
		} catch (error) {
			throw new Error(`Failed to get total points: ${error}`);
		}
	}
	async awardPoints(patronId, points, description, id) {
		try {
			return await this.create({
				id,
				patronId,
				description,
				points,
				tier: null,
				reward: null,
				issuedAt: /* @__PURE__ */ new Date(),
				expiresAt: null
			});
		} catch (error) {
			throw new Error(`Failed to award points: ${error}`);
		}
	}
	async awardReward(patronId, reward, description, id, expiresAt) {
		try {
			return await this.create({
				id,
				patronId,
				description,
				reward,
				tier: null,
				points: null,
				issuedAt: /* @__PURE__ */ new Date(),
				expiresAt: expiresAt || null
			});
		} catch (error) {
			throw new Error(`Failed to award reward: ${error}`);
		}
	}
	async calculatePatronTier(patronId) {
		try {
			const totalPoints = await this.getTotalPoints(patronId);
			let tier = "bronze";
			if (totalPoints >= 1e4) tier = "platinum";
			else if (totalPoints >= 5e3) tier = "gold";
			else if (totalPoints >= 2e3) tier = "silver";
			return tier;
		} catch (error) {
			throw new Error(`Failed to calculate patron tier: ${error}`);
		}
	}
};
var loyaltyAPI = new LoyaltyAPI();
var loyaltyRouter = new Hono();
var CreateLoyaltySchema = LoyaltySchema.omit({});
var UpdateLoyaltySchema = LoyaltySchema.partial().omit({ id: true });
var AwardPointsSchema = z.object({
	patronId: z.string().uuid(),
	points: z.number().int().positive(),
	description: z.string().min(1)
});
var AwardRewardSchema = z.object({
	patronId: z.string().uuid(),
	reward: z.string().min(1),
	description: z.string().min(1),
	expiresAt: z.string().optional()
});
loyaltyRouter.get("/", async (c) => {
	try {
		const patronId = c.req.query("patronId");
		const tier = c.req.query("tier");
		let records;
		if (patronId) records = await loyaltyAPI.findByPatronId(patronId);
		else if (tier) records = await loyaltyAPI.findByTier(tier);
		else records = await loyaltyAPI.findAll();
		return c.json(records);
	} catch (error) {
		console.error("Error fetching loyalty records:", error);
		return c.json({ error: "Failed to fetch loyalty records" }, 500);
	}
});
loyaltyRouter.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const record = await loyaltyAPI.findById(id);
		if (!record) return c.json({ error: "Loyalty record not found" }, 404);
		return c.json(record);
	} catch (error) {
		console.error("Error fetching loyalty record:", error);
		return c.json({ error: "Failed to fetch loyalty record" }, 500);
	}
});
loyaltyRouter.get("/patron/:patronId/points", async (c) => {
	try {
		const patronId = c.req.param("patronId");
		const totalPoints = await loyaltyAPI.getTotalPoints(patronId);
		return c.json({
			patronId,
			totalPoints
		});
	} catch (error) {
		console.error("Error fetching patron points:", error);
		return c.json({ error: "Failed to fetch patron points" }, 500);
	}
});
loyaltyRouter.get("/patron/:patronId/tier", async (c) => {
	try {
		const patronId = c.req.param("patronId");
		const tier = await loyaltyAPI.calculatePatronTier(patronId);
		return c.json({
			patronId,
			tier
		});
	} catch (error) {
		console.error("Error calculating patron tier:", error);
		return c.json({ error: "Failed to calculate patron tier" }, 500);
	}
});
loyaltyRouter.post("/", async (c) => {
	try {
		const body = await c.req.json();
		const processedBody = { ...body };
		if (body.issuedAt) processedBody.issuedAt = new Date(body.issuedAt);
		if (body.expiresAt) processedBody.expiresAt = new Date(body.expiresAt);
		const validated = CreateLoyaltySchema.parse(processedBody);
		const record = await loyaltyAPI.create(validated);
		return c.json(record, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error creating loyalty record:", error);
		return c.json({ error: "Failed to create loyalty record" }, 500);
	}
});
loyaltyRouter.post("/award-points", async (c) => {
	try {
		const body = await c.req.json();
		const validated = AwardPointsSchema.parse(body);
		const id = crypto.randomUUID();
		const record = await loyaltyAPI.awardPoints(validated.patronId, validated.points, validated.description, id);
		return c.json(record, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error awarding points:", error);
		return c.json({ error: "Failed to award points" }, 500);
	}
});
loyaltyRouter.post("/award-reward", async (c) => {
	try {
		const body = await c.req.json();
		const validated = AwardRewardSchema.parse(body);
		const id = crypto.randomUUID();
		const expiresAt = validated.expiresAt ? new Date(validated.expiresAt) : void 0;
		const record = await loyaltyAPI.awardReward(validated.patronId, validated.reward, validated.description, id, expiresAt);
		return c.json(record, 201);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error awarding reward:", error);
		return c.json({ error: "Failed to award reward" }, 500);
	}
});
loyaltyRouter.put("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const processedBody = { ...body };
		if (body.issuedAt) processedBody.issuedAt = new Date(body.issuedAt);
		if (body.expiresAt) processedBody.expiresAt = new Date(body.expiresAt);
		const validated = UpdateLoyaltySchema.parse(processedBody);
		const record = await loyaltyAPI.update(id, validated);
		if (!record) return c.json({ error: "Loyalty record not found" }, 404);
		return c.json(record);
	} catch (error) {
		if (error instanceof z.ZodError) return c.json({
			error: "Validation failed",
			details: error.issues
		}, 400);
		console.error("Error updating loyalty record:", error);
		return c.json({ error: "Failed to update loyalty record" }, 500);
	}
});
loyaltyRouter.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		if (!await loyaltyAPI.delete(id)) return c.json({ error: "Loyalty record not found" }, 404);
		return c.json({ success: true }, 200);
	} catch (error) {
		console.error("Error deleting loyalty record:", error);
		return c.json({ error: "Failed to delete loyalty record" }, 500);
	}
});
var loyalty_default = loyaltyRouter;
var THROTTLE_DELAY = 0;
getDatabase();
console.log("✓ Database initialized");
var app = new Hono();
var throttleMiddleware = (delayMs = 500) => createMiddleware(async (c, next) => {
	await new Promise((resolve$1) => setTimeout(resolve$1, delayMs));
	await next();
});
app.use("*", logger());
app.use("*", cors());
if (THROTTLE_DELAY > 0) app.use("/api/*", throttleMiddleware(THROTTLE_DELAY));
app.get("/api/health", (c) => c.json({
	status: "ok",
	timestamp: Date.now()
}));
app.route("/api/users", users_default);
app.route("/api/events", events_default);
app.route("/api/attendance", attendance_default);
app.route("/api/loyalty", loyalty_default);
if (!isDevelopment) {
	app.use("/*", serveStatic({ root: "./dist" }));
	app.get("*", serveStatic({ path: "./dist/index.html" }));
}
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
	console.error("Server error:", err);
	return c.json({ error: "Internal server error" }, 500);
});
var port$1 = Number(process.env.PORT) || 3e3;
var server_default = {
	port: port$1,
	fetch: app.fetch
};
console.log(`🚀 Server running on http://localhost:${port$1}`);
console.log(`📦 Mode: ${isDevelopment ? "development" : "production"}`);
var public_assets_data_default = {
	"/.DS_Store": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1804-c3yJs8+zvOcxOlrJMpmdBV9qBXg\"",
		"mtime": "2025-12-15T02:07:19.270Z",
		"size": 6148,
		"path": "../public/.DS_Store"
	},
	"/inspo1.png": {
		"type": "image/png",
		"etag": "\"dd36-1nkaoLcN2HikZbL6XqqwVRqpj78\"",
		"mtime": "2025-12-15T02:07:19.271Z",
		"size": 56630,
		"path": "../public/inspo1.png"
	},
	"/inspo2.png": {
		"type": "image/png",
		"etag": "\"d326-0LoKivRfH6t9/tUgh6pf6+kSJHg\"",
		"mtime": "2025-12-15T02:07:19.271Z",
		"size": 54054,
		"path": "../public/inspo2.png"
	},
	"/inspo3.png": {
		"type": "image/png",
		"etag": "\"24702-MfCQ/mI3OAzp4LExLJkn8UOHgW4\"",
		"mtime": "2025-12-15T02:07:19.271Z",
		"size": 149250,
		"path": "../public/inspo3.png"
	},
	"/vite.svg": {
		"type": "image/svg+xml",
		"etag": "\"5d9-9/Odcje3kalF1Spc16j7Nl8xM2Y\"",
		"mtime": "2025-12-15T02:07:19.271Z",
		"size": 1497,
		"path": "../public/vite.svg"
	},
	"/assets/index-3X6AnAFK.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"b162-NaVYRhKNlV9oBrGiNbu3cMabByE\"",
		"mtime": "2025-12-15T02:07:19.717Z",
		"size": 45410,
		"path": "../public/assets/index-3X6AnAFK.css"
	},
	"/assets/index-wcvydXoW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25bab1-2+XsOThSRW5WsueEq6DS5gF8N8E\"",
		"mtime": "2025-12-15T02:07:19.717Z",
		"size": 2472625,
		"path": "../public/assets/index-wcvydXoW.js"
	}
};
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
var METHODS = new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r$1 = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		s.length - 1;
		if (s[1] === "assets") r$1.unshift({
			data: $0,
			params: { "_": s.slice(2).join("/") }
		});
		return r$1;
	};
})();
var multiHandler = (...handlers) => {
	const final = handlers.pop();
	const middleware = handlers.filter(Boolean).map((h) => toMiddleware(h));
	return (ev) => callMiddleware(ev, middleware, final);
};
var _lazy__rc7dq = defineLazyEventHandler(() => import("../_/renderer-template.mjs"));
const findRoute = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/**",
		handler: multiHandler(toEventHandler(server_default), _lazy__rc7dq)
	};
	return (m, p) => {
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		s.length - 1;
		return {
			data: $0,
			params: { "_": s.slice(1).join("/") }
		};
	};
})();
const globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
function useNitroApp() {
	return useNitroApp.__instance__ ??= initNitroApp();
}
function initNitroApp() {
	const nitroApp$1 = createNitroApp();
	globalThis.__nitro__ = nitroApp$1;
	return nitroApp$1;
}
function createNitroApp() {
	const hooks = void 0;
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		{
			const routeRules = getRouteRules(method, pathname);
			event.context.routeRules = routeRules?.routeRules;
			if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		}
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	for (const rule of Object.values(routeRules)) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
var port = Number.parseInt(process.env.NITRO_PORT || process.env.PORT || "") || 3e3;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch
});
trapUnhandledErrors();
var node_server_default = {};
const rendererTemplate = () => new HTTPResponse("<!doctype html>\n<html lang=\"en\">\n\n<head>\n  <meta charset=\"UTF-8\" />\n  <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>dwellpass</title>\n  <script type=\"module\" crossorigin src=\"/assets/index-wcvydXoW.js\"><\/script>\n  <link rel=\"stylesheet\" crossorigin href=\"/assets/index-3X6AnAFK.css\">\n</head>\n\n<body>\n  <div id=\"root\"></div>\n  <!-- <script crossOrigin=\"anonymous\" src=\"//unpkg.com/react-scan/dist/auto.global.js\"><\/script> -->\n</body>\n\n</html>", { headers: { "content-type": "text/html; charset=utf-8" } });
function renderIndexHTML(event) {
	return rendererTemplate(event.req);
}
export { node_server_default as n, renderIndexHTML as t };
