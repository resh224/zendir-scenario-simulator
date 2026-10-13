# Space Cyber Garage

**A Space Cyber Testbed For Defending The Mission**

An alert starts the investigation. This public browser demonstration follows the crew decision and configured mission consequence across six scenario families in three mission threads: telemetry trust, unauthorized commanding and command/control recovery. See `docs/v9-scenario-coverage.md` for the v9 mapping.

## Run The Simulator

Open the published site, `index.html` or `dist/index.html`. Enter a listed email label and the shared demo password. The page decrypts the simulator locally; the password is not embedded in the published files. **Lock simulator** removes the loaded session, and reloading requires another sign-in. No server account is created. Email ownership is not verified.

1. Select one of six scenarios from the menu and a crew view. Press **Step +30 s** to start, then advance the evidence clock, or use **Play**.
2. Use the crew buttons to change the highlighted crew, received evidence and available responses. The clock and decisions are preserved. Read source and receipt times. Enter a rationale and choose an available response. A required check or contact window can prevent an action.
3. Expand the fictional instrument panels and logs. **Send latest evidence to other crew** animates a handoff; delivery takes 30 configured seconds and preserves the original source time. Record a note for both teams.
4. Finish the run and open **Debrief & Compare**. An alternative keeps the same configuration and decision time without changing the original.
5. Save a static HTML walkthrough or JSON run record. Open a saved record to reconstruct it from the bundled fixtures. **Print View** prints the selected live or debrief view.

The **Instructor** view can inject telemetry corruption, a malicious command, communications loss or an antenna fault in compatible scenarios. Start a run, inject by T+120 s, then return to a crew view and wait for the recovery check before choosing **Recover The Injected Fault**. Unresolved faults remain in the endpoint and debrief. Injection and handoff records survive replay and JSON import.

The **Instructor** view selects benign/malicious telemetry and link variants and reveals the separate reference cause. Every family has a benign comparison. Local role switching is a teaching mechanism; no sensitive information belongs in this public bundle.

## Animated Mission View

The watercolor mission scene follows the same exercise clock and crew decisions. Play animates evidence moving through the mission; containment blocks the suspect command route and restoration reveals the alternate. The timing strip preserves source and receipt times, including delayed observations. **Watch this visual step** pauses the exercise and repeats the illustration without changing the run. Motion is illustrative, and reduced-motion preferences are respected. Static walkthroughs include the watercolor and a snapshot of the current explanation.

Popup callouts explain arriving evidence, recorded choices and mission consequences as the run advances. Select the numbered spacecraft, ground and crew markers or the question mark for details. Close a callout with its × button or Escape. Opening a callout preserves the exercise clock and decisions.

The palette follows Zendir’s public corporate website: lavender, electric blue, deep blue, charcoal, and pale surfaces. Asset generation details and the exact prompt are recorded in `docs/visual-design.md`.

## Mission Context And Branding

Select Operations, Training or Acquisition to frame the same recorded run around a different reader question. The mission map explains the spacecraft, ground-system and crew responsibilities in each scenario. Context controls preserve the running exercise.

The supplied Zendir logo remains on the access/session header, footer and saved walkthroughs. The duplicate inner header and blue-panel logos are removed. Mission rehearsal, coordinated anomaly response and connected simulation concepts draw on Zendir’s public platform pages; see `docs/design-sources.md`.

## What The Model Represents

Each step is 30 configured seconds, each run ends at 180 seconds, and the link recovery contact is 90–150 seconds. These synthetic teaching parameters demonstrate evidence timing and choices. They are not customer mission values, predictive physics or measured performance. There is no actual government cyber-tool connector, live spacecraft command, deployed Proof Labs integration, response-effect probability or readiness score.

The onboard-configuration pair shares an initial indication but has different reference states. A correction can preserve a maliciously displaced pointing state or disturb an otherwise healthy state. The command flow separates route containment from alternate-route restoration. The link pair preserves old source times and limits recovery to the configured contact.

Notes stay in memory. A file export includes them only when requested. Reloading or resetting clears the current run. Reference links open only after a user chooses them; the simulator makes no automatic network requests.

## Build And Check

Requires Node.js for development only:

```text
node scripts/build.mjs --qa-only
node --test tests/engine.test.cjs
```

The QA build writes `qa/simulator.html`, which is ignored by Git. To publish, set `ZENDIR_ACCESS_FILE` to an owner-only local JSON file containing `password` and an `emails` array, then run `node scripts/build.mjs`. The build fails closed without that file and emits identical encrypted root/dist entry files. Never commit the access file. GitHub Pages serves the root file from `main`.

The optional browser suite uses Playwright and an installed Chrome executable. Make Playwright available to Node, set `ZENDIR_TEST_BROWSER` to the browser executable when different from the macOS Chrome default, and run `node tests/browser.test.cjs`. `ZENDIR_TEST_OUTPUT` selects the QA output directory. The suite runs with browser networking disabled. Run `tests/access.test.cjs` with the same local access-file setting to test all configured logins, negative cases, session locking and simulator interaction.

## Delivery And Submission

Public site: https://resh224.github.io/zendir-scenario-simulator/

This repository contains only the synthetic executable, source, tests and operating documentation. Proposal drafts and company evidence remain in the private proposal repository. Static examples are in `docs/walkthroughs/`.

The demonstration is separate from the SBIR submission. Executable or external-link evaluation permission remains a current-solicitation input. A selected static walkthrough must fit inside the technical proposal’s page limit; these examples do not add pages or establish completed D2P2 feasibility.

## Access limits

This is an encrypted shared-password presentation gate, not verified identity or server authorization. AES-256-GCM encrypts the page; PBKDF2-SHA-256 with 600,000 iterations wraps its key for each normalized email label. Anyone who knows a listed label and the shared password can open it. The development source, synthetic fixtures, earlier public releases and static walkthroughs remain public in GitHub; the gate does not make that material confidential. No private proposals or real telemetry are included. For confidential material or verified users, move to server-side authentication and restrict repository access.

The manipulated-telemetry pair keeps a healthy reference spacecraft under either cause, making an unnecessary correction consequential. The antenna and combined cases preserve missed-collection evidence after late recovery. Recorded actions retain synthetic execution status and immediate effects separately from the endpoint.

The main screen keeps scenario selection, crew focus, animation, evidence and response choices visible. Briefing/context, mission timing/state, crew notes and run/export tools expand when needed. Fault injection appears only in Instructor view. The latest evidence record opens automatically; older records and raw logs remain expandable. Saved walkthroughs include every evidence record expanded.
