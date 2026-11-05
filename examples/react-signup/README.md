# React signup integration

From the Mercury repository root, with Node 20 or later:

```sh
npm ci
npm run build
cd examples/react-signup
npm ci
npm run build
npm start
```

Open http://127.0.0.1:4175. The server creates an opaque visitor cookie, runs Mercury assignment and renders the invitation. React hydrates with the exact server assignment, checks it against the same formula, and measures only when those agree and the visitor consents.

Try signing up without consent, then enable measurement and click twice. The page records one exposure followed by one signup. Reload: assignment stays the same. Events and consent in this integration are deliberately scoped to the page visit; the main repository's browser demo provides persistent local event inspection.

`App.jsx` shows the integration using Mercury's public package API. `server.mjs` handles the request identity and initial render. Adapt the consent value and event sink to your application. A real shared event store must enforce atomic uniqueness, and your signup-completion handler should trigger the conversion only after signup actually succeeds. The local example creates no accounts and transmits no measurement events.

Run `npm test` here for the server/cookie/assignment test. The main Mercury tests cover duplicate events, eligibility and consent.
