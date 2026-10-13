# V9 use-case coverage

The demo uses six original synthetic cases to explain the scenario families in the v9 technical proposal, Objective 3, and the three connected threads described in its simulator bridge. The v9 proposal, work plan and validation plan are read-only inputs; their private documents are not part of the published repository.

| V9 family | Demo case | Mission thread | Evidence and decision |
| --- | --- | --- | --- |
| Ground-control credential misuse | Ground Credential Misuse | Unauthorized commanding | Queue, account authorization, receipt and alternate-route check; separate valid credentials from approved commanding. |
| Unauthorized onboard configuration | Onboard Configuration Change | Telemetry trust | Reported pointing, independent reference and configuration audit; compare approved calibration with unauthorized changes. |
| Manipulated telemetry | Manipulated Telemetry | Telemetry trust | Report, independent pointing and integrity audit; a false report can cause an unnecessary correction of a healthy spacecraft. |
| Compromised tracking station or antenna | Tracking Station And Antenna | Command/control recovery | Tracking mismatch, alignment reference and controller audit; recover during contact and retain any missed collection. |
| Link replay/disruption | Link Replay Or Disruption | Command/control recovery | Acknowledgment gap, contact forecast, delayed packet and link investigation; stale downlink evidence differs from current uplink availability. This fixture illustrates disruption; packet-level replay execution is not implemented. |
| Combined space-and-ground incident | Combined Space And Ground Incident | Commanding and onboard recovery | Ground authorization, onboard reference, alternate route and correlated audit; containment, route restoration and pointing recovery are distinct actions. |

All six support benign and malicious comparisons with identical role-visible starting observations. Later evidence distinguishes the represented causes. Instructor setup starts a new run. Source/receipt times, role visibility, evidence handoffs, controlled injects and recorded decision effects carry through replay, export and comparison. New family versions have a distinct configuration identifier; older run records are rejected rather than silently interpreted under revised rules.

The antenna and combined examples use a fictional collection deadline at T+120 s and distinguish late recovery from preservation of that collection. The original onboard example ends its collection at T+180 s. All timings and instrument values are teaching parameters, not customer requirements or measured platform performance. Uplink and downlink are labeled separately.

Action records distinguish the crew request, execution in the synthetic model, available evidence and the recorded mission effect. They do not represent execution in government tools. The demo has no live furnished DCW or Proof Labs integration, validated physics, agency acceptance, reviewed dataset or completed 60-run AI evaluation. The v9 research and delivery obligations remain proposed work.

The duplicate inner header logo and blue-panel logo were removed as requested. The access-page/session logo and footer branding remain.

The v9 technical content retains the same six families and three mission threads as v8, with the Space Cyber Garage title and explicit instructor/crew sequence. The simplified interface changes presentation rather than asserting completion of the proposed government integration, user study or AI evaluation.
