import ProjectHero from "../components/ProjectHero";
import "./HomeHeating.css";

const REPO = "https://github.com/markusmuilu/fidelix-modbus-bridge";

const modes = [
  {
    step: "01",
    title: "Price optimised",
    body: (
      <>
        Holds the room at its setpoint but chooses when to spend the energy, biasing the heating
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
        top of, and what the room falls back to.
      </>
    ),
  },
  {
    step: "03",
    title: "Manual",
    body: (
      <>
        The room&apos;s heating does what you set it to and stays there. No other controller
        touches it while the room is in this mode.
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
        Controls the heating in a house: 24 rooms, each held at its own setpoint, with the
        heating shifted into the cheaper hours of the Nord Pool spot price. Any room can be
        switched to manual, or back to a plain thermostat, at any time. It talks to a Fidelix
        FX-2020 building automation controller over Modbus RTU, and runs unattended in an
        occupied house.
      </ProjectHero>

      {/* STATS ROW */}
      <div className="hh-stats-row">
        <div className="hh-stat-card">
          <span className="hh-stat-num">24</span>
          <span className="hh-stat-label">Heating circuits controlled</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">24</span>
          <span className="hh-stat-label">Room temperature sensors</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">4</span>
          <span className="hh-stat-label">Control modes per room</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">30 s</span>
          <span className="hh-stat-label">Sensor poll interval</span>
        </div>
      </div>

      {/* MODES */}
      <section className="hh-method-section">
        <h2 className="hh-section-title">Four modes, chosen per room</h2>
        <p className="hh-section-sub">
          Each room picks which controller drives its heating. The choice is the single source of
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
            are gone. The logic, the structure and the comments are as written. Fidelix has
            essentially no open-source Home Assistant support, so the register layouts and the
            resistive-input formula in the repository were not documented elsewhere.
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
          <span>Nord Pool spot prices</span>
          <span>Offline test harnesses</span>
        </div>
      </section>

    </div>
  );
}
