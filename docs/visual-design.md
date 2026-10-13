# Animated mission presentation

Updated October 13, 2026. This presentation retains the existing synthetic scenario rules. It adds an illustrated spacecraft/ground/crew view, moving evidence and command markers, containment and alternate-route states, a four-step progress strip, and source-versus-receipt timing. The three cases remain unreliable telemetry, unauthorized command, and impaired command and control.

The diagram reads only the current role's visible evidence and recorded crew actions. It does not reveal the hidden scenario cause before that cause becomes available through evidence or debrief. Its illustration is not a physics simulation, packet capture, or indication of measured throughput. Mission changes remain governed by the existing engine. Visual replay pauses the exercise and replays only the illustration; it does not create an action or advance simulation time. Reduced-motion preferences disable motion while retaining the state and text descriptions.

## Scene callouts

Evidence and command labels retain an upright orientation along their motion paths. A popup explains received evidence with source and receipt times, then reflects recorded crew choices and the endpoint. Spacecraft, ground, crew and flow hotspots offer more detail without changing the run. Callouts use only the selected role’s visible evidence and recorded actions. Dismissal lasts until the next exercise step or role change; manual hotspot selections remain open until closed. The close button and Escape dismiss the popup, with focus returned when needed. On narrow screens the popup sits below the diagram.

## Corporate color source

Colors were read from [Zendir's public website](https://zendir.io/) and its [theme stylesheet](https://zendir.io/hubfs/hub_generated/template_assets/1/210426157599/1778232363661/template_theme-overrides.min.css) on October 13, 2026:

| Use | Color |
| --- | --- |
| Lavender accent | `#9d70ff` |
| Electric blue interaction and evidence | `#3e3cff` |
| Deep blue text and command paths | `#1b2da0` |
| Pale background | `#f7f7fb` |
| Charcoal masthead and narration, from website page styles | `#0e0f14` |

System fonts keep the standalone page offline. The supplied logo remains intact.

## Generated illustration

Asset: `assets/mission-watercolor.jpg`. Generated with the built-in image-generation tool, then encoded as JPEG for the standalone bundle. The original generated PNG is retained locally outside this public repository. The same conceptual backdrop is used in the hero and the three mission scenes; scene-specific evidence, route state, narration, and timing come from the application, not painted labels.

Generation prompt:

> Use case: illustration-story. Asset type: watercolor backdrop for a public educational space mission simulator. Create a wide cinematic watercolor illustration on textured paper: Earth-observation satellite with two solar panels above a softly curved Earth at upper right; a ground tracking dish and a small mission operations building on the lower left; subtle atmospheric orbital arcs connecting the two. Technical but graceful, sparse watercolor washes, clear silhouettes, sophisticated editorial illustration, generous open center for an animated diagram overlay. Palette derived from Zendir website: lavender #9d70ff, electric blue #3e3cff, deep blue #1b2da0, charcoal #0e0f14, pale paper #f7f7fb. No lettering, no labels, no logo, no watermark, no explosions, no weapons, no invented UI. This is a conceptual illustration, not measured telemetry. Landscape 3:2 composition.

## Alignment and limits

The experience illustrates an Earth-observation mission under uncertain evidence. It separates spacecraft and cyber crew views, preserves delayed observations, makes containment and recovery separate choices, and retains decision-time evidence for replay and alternative comparison. These are the proposed demonstration's teaching concepts. Actual government DCW integration, model validation, mission-authorized procedures, customer parameters, and measured training benefits remain outside this public flow demonstration. No proposal text or private evidence is included in this repository.

## Crew exchange and controlled faults

Active Crew View changes the evidence/actions and SVG crew emphasis while preserving the run. A recorded handoff animates from sender to recipient; the original observation time and artifact remain attached, with a 30-second configured delivery delay. Instructor injects are compatible with each scenario and introduce observations, mission state changes and a delayed recovery check. The debrief identifies inject type/time and recovery status. Sample telemetry, command queues, authorization audits, configuration traces and link/contact displays use original fictional values with asset, record and configuration references. They illustrate the evidence interfaces described in the authorized Volume 2 and feasibility documents, not completed tool integration or real exercise data.

The simulator panel includes the supplied Zendir logo. The encrypted entry page also uses that logo and the corporate palette. The password and proposal originals are excluded from publication.

## V9 revision

The scenario menu follows `docs/v9-scenario-coverage.md`. Three mission threads continue to organize the animation. Selected families add original evidence instruments, learning goals and recovery paths, with benign comparisons across all six. Uplink commands and downlink evidence are labeled separately. Action records preserve execution status and the immediate effect at decision time. Duplicate branding in the inner header and active-role panel was removed.

## Interface simplification

Space Cyber Garage is the page, access and export title. A single grouped menu replaces the thread tabs and six-card gallery. One set of crew buttons replaces the duplicate role dropdown. Instructor fault controls, briefing, mission context, state/timing, notes and record/export controls use expandable panels. Only the newest evidence record opens by default. The hero and active-role banner are smaller, the redundant progress strip is hidden and uplink/downlink labels remain visible. Collapsed tools retain their underlying state.
