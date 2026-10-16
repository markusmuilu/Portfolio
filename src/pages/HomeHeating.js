import Row, { Head } from "../components/Row";
import PriceClock from "../components/PriceClock";
import CompareBars from "../components/CompareBars";
import RepoActivity from "../components/RepoActivity";
import "./HomeHeating.css";

const REPO = "https://github.com/markusmuilu/fidelix-modbus-bridge";

const modes = [
  [
    "Price optimised",
    "Holds the zone at its setpoint but chooses when to spend the energy, biasing the heating toward the cheaper hours of the day's Nord Pool spot prices.",
  ],
  [
    "Thermostat",
    "A plain setpoint thermostat that ignores price. This is the layer everything else sits on top of, and what a zone falls back to.",
  ],
  ["Manual", "The zone's heating does what you set it to and stays there. No other controller touches it while the zone is in this mode."],
  ["Solar", "Runs on solar surplus, with a configurable allowance for how much grid import is acceptable before it stops."],
];

export default function HomeHeating() {
  return (
    <div className="page">
      <Head>
        <div>
          <h1>Building automation bridge</h1>
          <p className="lede">
            The building's original control computer had failed, leaving one thermostat on the wall for the whole house
            and rooms that could not be kept warm. I built the replacement from scratch: a Raspberry Pi running Home
            Assistant, with the whole control layer written as AppDaemon apps in Python, driving the building's existing
            Fidelix FX-2020 controller over Modbus RTU. It restored independent control of all 24 heating zones and
            shifts the heating into the cheaper hours of the Nord Pool spot price.
          </p>
          <p className="stack-line">Python, Modbus RTU, AppDaemon, Home Assistant, Raspberry Pi. Published as a redacted snapshot.</p>
          <div className="actions">
            <a className="btn" href={REPO} target="_blank" rel="noopener noreferrer">
              Code on GitHub
            </a>
            <a className="btn quiet" href={`${REPO}/tree/main/docs`} target="_blank" rel="noopener noreferrer">
              Write-ups
            </a>
          </div>
        </div>
      </Head>


      <Row label="In numbers" field="sky">
        <ul className="hh-stats">
          <li><b>24</b>heating zones controlled</li>
          <li><b>4</b>control modes per zone</li>
          <li><b>30 s</b>control loop</li>
          <li><b>0.5 °C</b>thermostat hysteresis</li>
        </ul>
      </Row>

      <Row label="Results so far" field="surface">
        <div className="hh-results">
          <div>
            <h3 className="row-title">Paying below the day's average price</h3>
            <CompareBars
              rows={[
                { label: "Rooms as thermostats, Aug to Sep", value: 1.5 },
                { label: "All rooms on price control, Oct", value: 11, strong: true },
              ]}
              max={12}
              format={(v) => `${v}%`}
              caption="How far below the day's average spot price the heating energy was bought. Spot price only; the October figure is the first week with every room on price control."
            />
          </div>
          <div>
            <h3 className="row-title">Solar forecast for the next day</h3>
            <CompareBars
              rows={[
                { label: "Same as yesterday", value: 0.49 },
                { label: "My forecast", value: 0.24, strong: true },
              ]}
              max={0.5}
              format={(v) => `${v.toFixed(2)} kW`}
              caption="Average hourly error against what the panels actually produced, over 75 daylight hours since 5 October. The forecast averages two weather models."
            />
          </div>
        </div>
      </Row>

      <Row label="What it works against" sub="live">
        <div className="hh-clock">
          <div className="hh-clock-dial">
            <PriceClock />
          </div>
          <div className="prose">
            <p>
              The Finnish spot price for the next 24 hours, a bar per quarter-hour, fetched live when this page loads.
              The inner ring lights the cheapest third of those hours.
            </p>
            <p>
              The price-optimised mode holds each room at its setpoint but leans its heating into the cheap hours, so it
              never leaves a room cold to chase a low price.
            </p>
          </div>
        </div>
      </Row>

      <Row label="What it replaced">
        <h3 className="row-title">Built from scratch on top of the existing wiring</h3>
        <div className="prose">
          <p>
            The Fidelix FX-2020 and everything wired to it, 24 heating circuits and their sensors, were still good. What
            had failed was the Windows CE computer sitting on top of it, and with it per-circuit control of the heating.
            What was left was a single thermostat on the wall governing the whole house. In a house with 24 separately
            wired circuits that is not enough control to keep rooms warm, and they were cold.
          </p>
          <p>
            Replacing the automation itself would have meant rewiring the house. Replacing the computer meant learning to
            speak to the FX-2020 directly. Modbus RTU over a serial line: raw registers, resistive sensor curves read
            through an NTC table, and output cards shared with equipment that must not be disturbed. Fidelix has
            essentially no open-source Home Assistant support, so the register layouts and the read-back procedure had to
            be worked out against the live panel.
          </p>
          <p>
            On top of that sits a Raspberry Pi running Home Assistant, and eleven AppDaemon apps in Python: the bridge
            itself, the thermostats, the price optimiser, the mode selector, and a watchdog that checks every signal is
            still arriving.
          </p>
        </div>
      </Row>

      <Row label="Modes" sub="one chosen per zone">
        <p className="prose-lead">
          Each zone picks which controller drives its heating. The choice is the single source of truth, so nothing
          overrides anything and a switch you set stays where you set it.
        </p>
        <ul className="entries">
          {modes.map(([title, body]) => (
            <li className="entry" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </Row>

      <Row label="What is published" field="surface">
        <div className="prose">
          <p>
            The repository is the real code with the building removed. It is not a library and not a deployable package.
            Zones are numbered, the controller's point tags are neutral, and the serial path, coordinates, addresses,
            tariff rates and credentials are gone. The logic, the structure and the comments are as written.
          </p>
        </div>
      </Row>

      <Row label="The code" sub="live from GitHub">
        <RepoActivity repo="fidelix-modbus-bridge" />
      </Row>

      <Row label="Stack">
        <p className="words-line">
          Python, Modbus RTU, pymodbus, AppDaemon, Home Assistant, Raspberry Pi, Nord Pool spot prices, offline test
          harnesses
        </p>
      </Row>
    </div>
  );
}
