import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { assign } from "./docs/lib/index.js";
import { experiment, labels } from "./docs/experiment.js";
const port = Number(process.env.PORT || 4173);
const paths = new Set([
	"app.js",
	"style.css",
	"experiment.js",
	"lib/index.js",
	"lib/bucketing.js",
	"lib/targeting.js",
	"lib/types.js",
]);
const server = createServer(async (req, res) => {
	const path = new URL(req.url, "http://localhost").pathname.slice(1);
	if ((path && !paths.has(path)) || req.method !== "GET") {
		res.writeHead(404).end();
		return;
	}
	try {
		if (path) {
			const data = await readFile(new URL("./docs/" + path, import.meta.url));
			res
				.writeHead(200, {
					"Content-Type": path.endsWith(".css")
						? "text/css"
						: "text/javascript",
				})
				.end(data);
			return;
		}
		const visitor =
			/(?:^|; )mercury_demo=([a-f0-9-]{36})(?:;|$)/.exec(
				req.headers.cookie || "",
			)?.[1] || randomUUID();
		const { variant } = assign(experiment, visitor);
		let page = await readFile(
			new URL("./docs/index.html", import.meta.url),
			"utf8",
		);
		page = page
			.replace(
				'<html lang="en">',
				'<html lang="en" data-visitor="' +
					visitor +
					'" data-arm="' +
					variant +
					'">',
			)
			.replace("Loading experiment…", labels[variant]);
		res
			.writeHead(200, {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "no-store",
				"Set-Cookie": "mercury_demo=" + visitor + "; Path=/; SameSite=Lax",
			})
			.end(page);
	} catch {
		res.writeHead(500).end("Demo could not load");
	}
});
server.listen(port, "127.0.0.1", () =>
	console.log("Open http://127.0.0.1:" + server.address().port),
);
