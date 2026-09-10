# End-to-end checks

`flow.mjs` drives the real app in Chrome and asserts the core loop: opening a
line from the home screen, the answer key staying hidden until every question is
answered, scoring, and progress surviving a reload.

It exists because rendering a screen and *using* it are different things - a
badge can look perfect and still be dead, which is exactly the bug this caught.

```bash
npx expo start --web --port 8099   # in one terminal
npm run e2e                        # in another
```

It drives the system Chrome over CDP (`playwright-core`, no browser download).
Override with `E2E_BASE_URL` and `E2E_CHROME` if your setup differs.

The web build uses localStorage where the native build uses SQLite, so this
verifies the UI and the use cases, not the native data layer.
