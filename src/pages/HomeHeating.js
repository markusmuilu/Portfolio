import ProjectHero from "../components/ProjectHero";
import "./HomeHeating.css";

const REPO = "https://github.com/markusmuilu/fidelix-modbus-bridge";

const modes = [
  {
    step: "01",
    title: "Price optimised",
    body: (
      <>
        Holds the zone at its setpoint but chooses when to spend the energy, biasing the heating
        toward the cheaper hours of the day&apos;s Nord Pool spot prices.
      </>
    ),
  },
  {
    step: "02",
    title: "Thermostat",
    body: (
      <>
        A plain setpoint thermostat that ignores price. This is the layer everything else sits on
        top of, and what a zone falls back to.
      </>
    ),
  },
  {
    step: "03",
    title: "Manual",
    body: (
      <>
        The zone&apos;s heating does what you set it to and stays there. No other controller
        touches it while the zone is in this mode.
      </>
    ),
  },
  {
    step: "04",
    title: "Solar",
    body: (
      <>
        Runs on solar surplus, with a configurable allowance for how much grid import is
        acceptable before it stops.
      </>
    ),
  },
];

export default function HomeHeating() {
  return (
    <div className="hh-page">

      <ProjectHero
        accent="teal"
        eyebrow="Building automation · Modbus RTU"
        badge="Public snapshot"
        title="Building Automation Bridge"
        actions={[
          { label: "View on GitHub", href: REPO, variant: "primary" },
          { label: "Read the write-ups ↗", href: `${REPO}/tree/main/docs` },
        ]}
      >
        The building&apos;s original control computer had failed, leaving one thermostat on the
        wall for the whole house and rooms that could not be kept warm. This is its replacement,
        built from scratch: a Raspberry Pi running Home Assistant, with the whole control layer
        written as AppDaemon apps in Python, driving the building&apos;s existing Fidelix FX-2020
        controller over Modbus RTU. It restored independent control of all 24 heating zones, and
        shifts the heating into the cheaper hours of the Nord Pool spot price.
      </ProjectHero>

      {/* STATS ROW */}
      <div className="hh-stats-row">
        <div className="hh-stat-card">
          <span className="hh-stat-num">24</span>
          <span className="hh-stat-label">Heating zones controlled</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">4</span>
          <span className="hh-stat-label">Control modes per zone</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">30 s</span>
          <span className="hh-stat-label">Control loop interval</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">0.5 °C</span>
          <span className="hh-stat-label">Thermostat hysteresis</span>
        </div>
      </div>

      {/* WHAT IT REPLACED */}
      <section className="hh-lead-section">
        <span className="hh-story-kicker">What it replaced</span>
        <h2 className="hh-section-title">Built from scratch on top of the existing wiring</h2>

        <div className="hh-lead-card">
          <p>
            The Fidelix FX-2020 and everything wired to it, 24 heating circuits and their
            sensors, were still good. What had failed was the Windows CE computer sitting on top
            of it, and with it per-circuit control of the heating. What was left was a single
            thermostat on the wall governing the whole house. In a house with 24 separately
            wired circuits that is not enough control to keep rooms warm, and they were cold.
          </p>
          <p>
            Replacing the automation itself would have meant rewiring the house. Replacing the
            computer meant learning to speak to the FX-2020 directly. Modbus RTU over a serial
            line: raw registers, resistive sensor curves read through an NTC table, and output
            cards shared with equipment that must not be disturbed. Fidelix has essentially no
            open-source Home Assistant support, so the register layouts and the read-back
            procedure had to be worked out against the live panel.
          </p>
          <p>
            On top of that sits a Raspberry Pi running Home Assistant, and eleven AppDaemon apps
            in Python: the bridge itself, the thermostats, the price optimiser, the mode
            selector, and a watchdog that checks every signal is still arriving.
          </p>
        </div>
      </section>

      {/* MODES */}
      <section className="hh-method-section">
        <h2 className="hh-section-title">Four modes, chosen per zone</h2>
        <p className="hh-section-sub">
          Each zone picks which controller drives its heating. The choice is the single source of
          truth, so nothing overrides anything and a switch you set stays where you set it.
        </p>

        <div className="hh-method-grid">
          {modes.map(({ step, title, body }) => (
            <div className="hh-method-card" key={step}>
              <span className="hh-method-step">{step}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REDACTION NOTE */}
      <section className="hh-redaction-section">
        <h2 className="hh-section-title">What is published</h2>
        <div className="hh-redaction-card">
          <p>
            The repository is the real code with the building removed. It is not a library and
            not a deployable package. Zones are numbered, the controller&apos;s point tags are
            neutral, and the serial path, coordinates, addresses, tariff rates and credentials
            are gone. The logic, the structure and the comments are as written.
          </p>
        </div>
      </section>

      {/* STACK */}
      <section className="hh-tech-section">
        <h2 className="hh-section-title">Stack</h2>
        <div className="hh-tech-chips">
          <span>Python</span>
          <span>Modbus RTU</span>
          <span>pymodbus</span>
          <span>AppDaemon</span>
          <span>Home Assistant</span>
          <span>Raspberry Pi</span>
          <span>Nord Pool spot prices</span>
          <span>Offline test harnesses</span>
        </div>
      </section>

    </div>
  );
}
