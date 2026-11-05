# Mercury A/B

**[Try the two-version sign-up page](https://mandiau-matthias.github.io/mercury-ab/)** · [Assignment algorithm](src/bucketing.ts) · [Measurement rules](src/index.ts)

Can you tell which invitation a visitor actually saw before counting a sign-up? Mercury assigns a stable version and records the first consented exposure and conversion. I extracted the assignment and targeting code from the Upswitch web app. The example stores fictional events in your own browser.

### Try it

Enable measurement, click the sign-up button twice, and reload. Open **Inspect the recorded events**. The same fictional visitor should have one exposure followed by one sign-up. With measurement off, repeating those actions adds no events. Choose **Try a new fictional visitor** to get another assignment. The results view shows both arms and explains when there is too little evidence to draw a conclusion. The 20-visitor floor illustrates a readout rule. It is not a statistical significance test.

### Run the server-rendered example

With Node.js 18 or later, run `npm start` and open <http://127.0.0.1:4173>. The server sets a random visitor cookie and renders the invitation. The browser recomputes the assignment and checks that it agrees. The hosted static preview computes it in the browser. Neither version needs an analytics account or sends events to a service.

### React integration

[Run the React signup example](examples/react-signup/README.md). It renders the invitation on the server, hydrates with the same assignment, checks the browser calculation, and counts only consented events. Reload with the same cookie to verify that the version remains stable.

### Use Mercury in your app

Install the tagged GitHub release into a Node.js project. It includes compiled JavaScript and TypeScript declarations.

```sh
npm install https://github.com/mandiau-matthias/mercury-ab/archive/refs/tags/v1.1.0.tar.gz
```

Save this as `signup.mjs` and run `node signup.mjs`:

```js
import { assign, record } from "mercury-ab";

const experiment = {
  key: "signup-v1",
  status: "running",
  variants: [
    { key: "control", weight: 50 },
    { key: "invitation", weight: 50 },
  ],
};
const visitor = "example-visitor";
const { enrolled, variant } = assign(experiment, visitor);
const exposure = { kind: "exposure", experiment: experiment.key, visitor, variant };
const consent = true; // In your app, read the visitor's actual choice.
const firstRender = record([], exposure, consent, enrolled);
const secondRender = record(firstRender, exposure, consent, enrolled);
console.log(variant, secondRender.length); // control 1
```

Use the same visitor ID and experiment definition on the server and in the browser. Pass the server's assignment to the first render and record exposure when the invitation is shown. To count a completed sign-up, pass the same event with `kind: "signup"`. The toolkit requires a prior exposure and deduplicates per experiment, variant and visitor. For a shared event store, enforce the same uniqueness rule atomically.

Run `npm ci && npm run build && npm test` to regenerate the portable JavaScript and run the tests. The React adapter is included. A useful contribution is an adapter for another framework: use the visitor ID from the request on the server, pass it to the browser, and add a reload test showing both renders chose the same invitation. [Existing server test](test/server.test.mjs)

Original Mercury source is MIT, copyright Despyke.
