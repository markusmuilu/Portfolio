import ProjectHero from "../components/ProjectHero";
import "./HomeHeating.css";

const REPO = "https://github.com/markusmuilu/fidelix-modbus-bridge";

const generalises = [
  {
    step: "01",
    title: "Resistance to temperature",
    body: (
      <>
        Raw register to resistance to degrees, by interpolating a lookup table rather than
        fitting a curve. Out of range returns nothing instead of clamping: a cut wire measures
        as near infinite resistance, and clamped to the cold end of the table it reads as a room
        far below setpoint and gets heated forever. Both failures render on a dashboard as an
        ordinary number.
      </>
    ),
  },
  {
    step: "02",
    title: "One master, one lock",
    body: (
      <>
        Every bus access in the process goes through a single context manager over a
        module-level lock, acquired with a timeout that yields <code>None</code> rather than
        blocking. Taken per module, not per sweep, so one card that has stopped answering cannot
        hold the bus away from the cards that still do.
      </>
    ),
  },
  {
    step: "03",
    title: "Shared-register read-modify-write",
    body: (
      <>
        Cards owned outright are composed and written whole. Cards shared with the building
        controller are read first and only the owned bits changed. Declaring a card shared when
        you own it costs one register read; declaring it owned when you do not costs whatever is
        wired to the other bits. There is no symmetry, so there is no judgement call.
      </>
    ),
  },
  {
    step: "04",
    title: "Adopt on startup",
    body: (
      <>
        At startup the controller reads the hardware into itself instead of asserting itself onto
        the hardware. That makes a restart an observation rather than an actuation, so a deploy
        stops being a physical event. It also turns the controller&apos;s idea of the world from a
        claim into a reading.
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
        A Modbus RTU bridge between a Fidelix FX-2020 building automation controller and Home
        Assistant, running in an occupied house. It reads 32 temperature sensors across three
        analogue cards, drives 24 heating circuits, and holds each zone at its setpoint while
        leaning on cheap electricity. Fidelix has essentially no open-source Home Assistant
        support, so most of what follows is not documented anywhere else.
      </ProjectHero>

      {/* STATS ROW */}
      <div className="hh-stats-row">
        <div className="hh-stat-card">
          <span className="hh-stat-num">24</span>
          <span className="hh-stat-label">Heating circuits driven</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">32</span>
          <span className="hh-stat-label">Temperature sensors read</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">5</span>
          <span className="hh-stat-label">Silent faults, one afternoon</span>
        </div>
        <div className="hh-stat-card">
          <span className="hh-stat-num">2 days</span>
          <span className="hh-stat-label">Bus wedged, nothing alerted</span>
        </div>
      </div>

      {/* LEAD STORY */}
      <section className="hh-lead-section">
        <span className="hh-story-kicker">The part worth reading</span>
        <h2 className="hh-section-title">When software can open a door</h2>

        <div className="hh-lead-card">
          <p>
            Building automation cabinets are laid out for whoever commissioned the building, not
            for whoever integrates them thirty years later. One output card here carries ordinary
            domestic loads and a handful of points belonging to the building&apos;s original
            security system, in the same register. They share a register because they share a
            card, and any code that writes one writes the other.
          </p>

          <p>
            The first attempt at handling that was a mask: a constant listing the bits nothing was
            ever allowed to write. It took twenty minutes, it was obviously safe, and it was
            wrong. The capability had already been asked for by the person who owns the building,
            explicitly, having been told what it covered. The mask protected nobody from an
            unconsidered risk. It refused a decision that had already been made, and it did so
            invisibly: the controls were simply absent, with nothing saying why, and no way to
            change that short of editing the source. A safety mechanism that overrides an informed
            owner is not a safe default, it is somebody else&apos;s judgement presented as physics.
          </p>

          <p>
            It was replaced the same day with an interlock. The distinction is the whole point.
          </p>

          <div className="hh-compare">
            <div className="hh-compare-card wrong">
              <span className="hh-compare-tag">First attempt</span>
              <h4>A mask</h4>
              <p>Removes the capability. Nothing can write those bits, and nothing explains why.</p>
            </div>
            <div className="hh-compare-arrow">→</div>
            <div className="hh-compare-card right">
              <span className="hh-compare-tag">Shipped</span>
              <h4>An interlock</h4>
              <p>
                Keeps the capability and puts one deliberate step in front of it. Full control,
                behind a switch.
              </p>
            </div>
          </div>

          <p className="hh-lead-subhead">Four properties make it hold up:</p>
          <ul className="hh-lead-list">
            <li>
              <strong>Fail closed on anything ambiguous.</strong> The gate counts as open only if
              its state is literally on. Off, unknown, unavailable, missing entirely, integration
              not loaded yet: all closed. A gate in front of something irreversible does not get
              to fail open because something was slow to start.
            </li>
            <li>
              <strong>A refused action is reverted, not swallowed.</strong> Toggling a guarded
              control while the gate is closed puts the control back where it was. Accepting the
              toggle and quietly not writing it would leave the interface showing a state the
              hardware is not in, which is worse than either allowing or refusing it.
            </li>
            <li>
              <strong>The redundant check stays.</strong> The write path filters guarded bits out
              of the applied set, and then separately verifies that the resulting register moves
              no guarded bit while the gate is closed. It costs one XOR, and the thing it protects
              is not a dashboard tile.
            </li>
            <li>
              <strong>Reading is exempt.</strong> Displaying a guarded point&apos;s state is
              observation, not actuation. Gating it would leave either a blind control or a
              restart that asserts stale state, both of which are worse than what the gate exists
              to prevent.
            </li>
          </ul>

          <p className="hh-aside">
            The card that turned out to be dangerous was not the guarded one. It was a plant card
            declared as owned outright, correctly, where a routine deploy would have composed the
            register from switches created minutes earlier that all default to off, and written
            zero to live equipment in an empty building. Nobody had to make a mistake for that to
            happen. Attention follows labels; consequence does not.
          </p>
        </div>
      </section>

      {/* OTHER TWO STORIES */}
      <section className="hh-stories-section">
        <h2 className="hh-section-title">Two more from the same system</h2>

        <div className="hh-story-grid">
          <article className="hh-story-card">
            <h3>Two masters on one bus</h3>
            <p>
              Temperatures on the dashboard were correct, and had been all week. They were also
              forty-eight hours old. The polling thread had been blocked inside a single Modbus
              read since the previous Wednesday, and that thread carried every write as well, so
              for two days nothing had been read and no relay could have been switched. Nothing
              alerted: a flat line in a heating system in summer looks exactly like a working
              system with nothing to do.
            </p>
            <p>
              Modbus RTU over a serial line has one master. This installation had two. The
              flow-based automation the bridge replaced had never actually been torn down, and was
              still enabled, still starting on boot, still polling the same port every hundred
              milliseconds, and still able to switch real heating relays from rules nobody had
              read in months. Two masters interleave frames, most reads come back slower and
              mostly right, and then one does not come back at all.
            </p>
            <p>
              The old system was deleted rather than disabled, because a disabled system is one
              checkbox away from being an active one. Then the same collision happened again from
              inside, shipped by the app whose docstring existed to prevent it, which is the more
              useful half of the story.
            </p>
          </article>

          <article className="hh-story-card">
            <h3>A running system is not a verified system</h3>
            <p>
              Sitting down to read the code before adding a feature turned up five separate faults
              in one afternoon, in something that had been running unattended and uncomplaining
              for most of a year. The price feed pointed at an entity that no longer existed, so
              the price optimisation the system was built for had been optimising against nothing
              for an unknown number of weeks. The heating still worked, because the plain
              thermostat underneath it still worked.
            </p>
            <p>
              A transfer tariff was wrong for the season, which is harder to notice than an
              outright absence because it is only wrong by a consistent amount. And the
              temperature history had never been retained: months of readings taken, displayed and
              purged, so when it came time to fit a thermal model there was no data and there
              never had been.
            </p>
            <p>
              Every one of them was silent, and every one was found by a person reading source
              rather than by the system. The dashboard answered what the value is. Nothing
              answered whether the value was still being produced. The response was a deliberately
              dull watchdog that checks ages rather than values.
            </p>
          </article>
        </div>
      </section>

      {/* WHAT GENERALISES */}
      <section className="hh-method-section">
        <h2 className="hh-section-title">What generalises</h2>
        <p className="hh-section-sub">
          Four things in the bridge that are worth reading on their own, independent of this
          building or this controller.
        </p>

        <div className="hh-method-grid">
          {generalises.map(({ step, title, body }) => (
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
            The repository is the real code with the building removed, not a library and not a
            deployable package. Zones are numbered, the controller&apos;s point tags are neutral,
            the shared card numbers match no real cabinet, and the serial path, coordinates,
            addresses, tariff rates and credentials are gone. The logic, the structure and the
            comments are as written, because the comments are where the unverified assumptions and
            the reversals are recorded.
          </p>
          <p>
            The input-card point list is not there at all. Door contacts and motion detectors,
            room by room, are a floor plan rather than a code file, and this is somebody&apos;s
            home before it is a portfolio piece.
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
