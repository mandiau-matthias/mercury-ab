import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { assign } from "../docs/lib/index.js";
import { experiment, labels } from "../docs/experiment.js";

test("first render, hydration, and reload agree on the invitation", async (t) => {
	const server = spawn(process.execPath, ["server.mjs"], {
		env: { ...process.env, PORT: "0" },
		stdio: ["ignore", "pipe", "inherit"],
	});
	t.after(() => server.kill());
	const [line] = await once(server.stdout, "data");
	const url = line.toString().trim().split(" ").at(-1);
	const first = await fetch(url);
	const cookie = first.headers.get("set-cookie").split(";")[0];
	const visitor = cookie.slice("mercury_demo=".length);
	const { variant } = assign(experiment, visitor);
	const html = await first.text();
	assert.ok(html.includes('data-arm="' + variant + '"'));
	assert.ok(html.includes(labels[variant]));
	const reload = await fetch(url, { headers: { Cookie: cookie } });
	assert.equal(await reload.text(), html);
});
