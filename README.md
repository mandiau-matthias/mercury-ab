# Mercury A/B

**[Try the two-version sign-up page](https://mandiau-matthias.github.io/mercury-ab/)** · [Assignment algorithm](src/bucketing.ts) · [Measurement rules](src/index.ts)

Can you tell which invitation a visitor actually saw before counting a sign-up? Mercury assigns a stable version and records the first consented exposure and conversion. I extracted the assignment and targeting code from the Upswitch web app. The example stores fictional events in your own browser.

### Try it

Enable measurement, click the sign-up button twice, and reload. The sign-up count stays at one. Choose **Try a new fictional visitor** to get another assignment. The results view shows both arms and explains when there is too little evidence to draw a conclusion. The 20-visitor floor illustrates a readout rule. It is not a statistical significance test.

### Run the server-rendered example

With Node.js 18 or later, run `npm start` and open <http://127.0.0.1:4173>. The server sets a random visitor cookie and renders the invitation. The browser recomputes the assignment and checks that it agrees. The hosted static preview computes it in the browser. Neither version needs an analytics account or sends events to a service.

### Use the toolkit

Import `assign`, `target`, and `record` from the package. Call `assign(experiment, visitorId, context)` on the server and pass its result into the first render. Use a stable identifier and keep the experiment key and weights fixed while collecting data. The library separates enrollment from arm allocation. `record(events, event, consent, enrolled)` accepts one exposure and one subsequent sign-up per experiment, arm and visitor. Use atomic deduplication in your own shared event store when measuring across browsers.

Run `npm ci && npm run build && npm test` to regenerate the portable JavaScript and run the tests. If your framework hydrates the wrong arm, a minimal reproduction is welcome. Original Mercury source is MIT, copyright Despyke.
