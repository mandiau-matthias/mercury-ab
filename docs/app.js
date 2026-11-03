import { assign, record } from "./lib/index.js";
import { experiment, labels } from "./experiment.js";
const $ = (id) => document.getElementById(id);
const key = "mercury-ab.demo.v1";
const read = (name) => localStorage.getItem(key + name);
const write = (name, value) => localStorage.setItem(key + name, value);
const server = document.documentElement.dataset;
let visitor = server.visitor || read(".visitor") || crypto.randomUUID();
write(".visitor", visitor);
const assignment = assign(experiment, visitor);
const serverMode = Boolean(server.visitor);
if (serverMode && server.arm !== assignment.variant)
	throw Error("Server and browser assignments differ");
$("assignment").textContent =
	(serverMode ? "Server and browser agree" : "Browser-only preview") +
	" · " +
	assignment.variant +
	" · visitor " +
	visitor.slice(0, 8);
$("signup").textContent = labels[assignment.variant];
$("assignment-reason").textContent =
	`Mercury combines the experiment key (${experiment.key}) with your fictional visitor ID (${visitor}) to pick a group. ` +
	`In this 50/50 experiment, your group is ${assignment.variant}.`;
$("signup").disabled = false;
$("consent").checked = read(".consent") === "yes";
function show(events) {
	const recorded = events.filter((e) => e.experiment === experiment.key);
	const counts = experiment.variants.map(({ key: arm }) => {
		const rows = recorded.filter((e) => e.variant === arm);
		return [
			arm,
			rows.filter((e) => e.kind === "exposure").length,
			rows.filter((e) => e.kind === "signup").length,
		];
	});
	$("rows").replaceChildren(
		...counts.map((row) => {
			const tr = document.createElement("tr");
			for (const cell of row) {
				const td = document.createElement("td");
				td.textContent = String(cell);
				tr.append(td);
			}
			return tr;
		}),
	);
	$("empty-log").hidden = recorded.length > 0;
	$("event-log").replaceChildren(...recorded.map((event) => {
		const item = document.createElement("li");
		const label = event.kind === "signup" ? "Sign-up" : "Exposure";
		item.textContent = `${label} · ${event.variant} · visitor ${event.visitor.slice(0, 8)}`;
		return item;
	}));
	$("readout").textContent = counts.some(([, n]) => n < 20)
		? "Too little evidence. At least one version has fewer than 20 exposed visitors."
		: "Both versions passed the demo traffic floor. These descriptive counts alone cannot establish a winner.";
}
function track(kind) {
	const events = JSON.parse(read(".events") || "[]");
	const next = record(
		events,
		{ kind, experiment: experiment.key, visitor, variant: assignment.variant },
		$("consent").checked,
		assignment.enrolled,
	);
	if (next !== events) write(".events", JSON.stringify(next));
	$("status").textContent = !$("consent").checked
		? "Measurement is off."
		: next === events
			? "Already counted for this visitor."
			: kind === "signup"
				? "One fictional sign-up recorded."
				: "One exposure recorded.";
	show(next);
}
$("consent").onchange = () => {
	write(".consent", $("consent").checked ? "yes" : "no");
	track("exposure");
};
$("signup").onclick = () => track("signup");
$("reset").onclick = () => {
	localStorage.removeItem(key + ".events");
	write(".consent", "no");
	location.reload();
};
$("next").onclick = () => {
	if (serverMode) {
		document.cookie = "mercury_demo=; Path=/; Max-Age=0; SameSite=Lax";
	} else {
		localStorage.removeItem(key + ".visitor");
	}
	location.reload();
};
track("exposure");
