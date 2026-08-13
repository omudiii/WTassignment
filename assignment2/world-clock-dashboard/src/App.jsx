
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const TIMEZONES = [
  { city: "New York", country: "USA", zone: "America/New_York", flag: "🇺🇸" },
  { city: "London", country: "UK", zone: "Europe/London", flag: "🇬🇧" },
  { city: "Paris", country: "France", zone: "Europe/Paris", flag: "🇫🇷" },
  { city: "Dubai", country: "UAE", zone: "Asia/Dubai", flag: "🇦🇪" },
  { city: "Mumbai", country: "India", zone: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Singapore", country: "Singapore", zone: "Asia/Singapore", flag: "🇸🇬" },
  { city: "Sydney", country: "Australia", zone: "Australia/Sydney", flag: "🇦🇺" },
];

function formatTime(date, zone, format24) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !format24,
  }).format(date);
}

function formatDate(date, zone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTimeParts(date, zone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = Number(part.value);
    }
  });

  return result;
}

function AnalogClock({ date, zone }) {
  const { hour, minute, second } = getTimeParts(date, zone);

  const secondDeg = second * 6;
  const minuteDeg = minute * 6 + second * 0.1;
  const hourDeg = (hour % 12) * 30 + minute * 0.5;

  return (
    <div className="analog-clock">
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="clock-number"
          style={{
            transform: `rotate(${i * 30}deg) translateY(-78px) rotate(-${
              i * 30
            }deg)`,
          }}
        >
          {i === 0 ? 12 : i}
        </span>
      ))}

      <div
        className="hand hour-hand"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      />

      <div
        className="hand minute-hand"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      />

      <div
        className="hand second-hand"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      />

      <div className="clock-center" />
    </div>
  );
}

function App() {
  const [now, setNow] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);
  const [format24, setFormat24] = useState(false);

  const [selectedZone, setSelectedZone] = useState("Asia/Kolkata");

  const [zones, setZones] = useState([
    "America/New_York",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]);

  const [alarms, setAlarms] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("clockAlarms")) || [];
    } catch {
      return [];
    }
  });

  const [alarmTime, setAlarmTime] = useState("");
  const [alarmLabel, setAlarmLabel] = useState("");

  const audioRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("clockAlarms", JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    alarms.forEach((alarm) => {
      if (!alarm.enabled) return;

      const current = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      const currentTime = current.replace(/^24:/, "00:");

      if (currentTime === alarm.time && alarm.lastTriggered !== currentTime) {
        triggerAlarm(alarm.id);
      }
    });
  }, [now, alarms]);

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const mainClockZone = useMemo(() => {
    return TIMEZONES.find((z) => z.zone === selectedZone) || TIMEZONES[4];
  }, [selectedZone]);

  function triggerAlarm(id) {
    setAlarms((previous) =>
      previous.map((alarm) =>
        alarm.id === id
          ? {
              ...alarm,
              lastTriggered: alarm.time,
              enabled: false,
            }
          : alarm
      )
    );

    try {
      if ("Notification" in window && Notification.permission === "granted") {
        const alarm = alarms.find((a) => a.id === id);

        new Notification("⏰ Alarm", {
          body: alarm?.label || "Your alarm is ringing!",
        });
      }
    } catch {}

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    window.alert("⏰ Alarm: Time's up!");
  }

  function addAlarm(e) {
    e.preventDefault();

    if (!alarmTime) return;

    const alarm = {
      id: Date.now(),
      time: alarmTime,
      label: alarmLabel || "Alarm",
      enabled: true,
      lastTriggered: null,
    };

    setAlarms((previous) => [...previous, alarm]);
    setAlarmTime("");
    setAlarmLabel("");

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function deleteAlarm(id) {
    setAlarms((previous) => previous.filter((alarm) => alarm.id !== id));
  }

  function toggleAlarm(id) {
    setAlarms((previous) =>
      previous.map((alarm) =>
        alarm.id === id
          ? { ...alarm, enabled: !alarm.enabled }
          : alarm
      )
    );
  }

  function addTimezone(zone) {
    if (!zones.includes(zone)) {
      setZones((previous) => [...previous, zone]);
    }
  }

  function removeTimezone(zone) {
    setZones((previous) => previous.filter((item) => item !== zone));
  }

  function getZoneInfo(zone) {
    return TIMEZONES.find((item) => item.zone === zone) || {
      city: zone.split("/").pop().replaceAll("_", " "),
      country: "",
      zone,
      flag: "🌍",
    };
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      />

      <header className="navbar">
        <div>
          <div className="logo">
            <span>◷</span>
            ChronoWorld
          </div>

          <div className="subtitle">
            Real-time global clock dashboard
          </div>
        </div>

        <div className="nav-controls">
          <button
            className="control-button"
            onClick={() => setFormat24((value) => !value)}
          >
            {format24 ? "24H" : "12H"}
          </button>

          <button
            className="control-button"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-grid">
          <div className="main-clock-card glass">
            <div className="card-header">
              <div>
                <span className="live-dot" />
                LIVE TIME
              </div>

              <span className="timezone-label">
                {mainClockZone.zone}
              </span>
            </div>

            <div className="clock-area">
              <AnalogClock date={now} zone={selectedZone} />

              <div className="digital-area">
                <div className="big-time">
                  {formatTime(now, selectedZone, format24)}
                </div>

                <div className="date">
                  {formatDate(now, selectedZone)}
                </div>

                <div className="city-title">
                  {mainClockZone.flag} {mainClockZone.city}
                </div>
              </div>
            </div>

            <div className="clock-footer">
              <div>
                <span>LOCAL TIMEZONE</span>
                <strong>{localZone}</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong className="online">● LIVE</strong>
              </div>
            </div>
          </div>

          <div className="quick-panel glass">
            <div className="section-title">
              <span>🌍</span>
              World Clock
            </div>

            <p className="muted">
              Select a region to display its live time.
            </p>

            <div className="zone-selector">
              {TIMEZONES.map((zone) => (
                <button
                  key={zone.zone}
                  className={
                    selectedZone === zone.zone
                      ? "zone-button active"
                      : "zone-button"
                  }
                  onClick={() => setSelectedZone(zone.zone)}
                >
                  <span>{zone.flag}</span>
                  <span>{zone.city}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>World Time Zones</h2>
              <p>Live time across your selected regions</p>
            </div>

            <select
              className="add-zone"
              value=""
              onChange={(e) => {
                if (e.target.value) addTimezone(e.target.value);
              }}
            >
              <option value="">+ Add timezone</option>

              {TIMEZONES.filter((zone) => !zones.includes(zone.zone)).map(
                (zone) => (
                  <option key={zone.zone} value={zone.zone}>
                    {zone.city} — {zone.country}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="timezone-grid">
            {zones.map((zone) => {
              const info = getZoneInfo(zone);

              return (
                <div className="timezone-card glass" key={zone}>
                  <div className="timezone-top">
                    <div>
                      <span className="flag">{info.flag}</span>

                      <div>
                        <h3>{info.city}</h3>
                        <span>{info.country}</span>
                      </div>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeTimezone(zone)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="zone-time">
                    {formatTime(now, zone, format24)}
                  </div>

                  <div className="zone-date">
                    {formatDate(now, zone)}
                  </div>

                  <div className="zone-footer">
                    <span>{zone}</span>

                    <span className="live-status">
                      ● LIVE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="alarm-card glass">
            <div className="section-heading">
              <div>
                <h2>⏰ Alarms</h2>
                <p>Create and manage alarms</p>
              </div>

              <span className="alarm-count">
                {alarms.length}
              </span>
            </div>

            <form className="alarm-form" onSubmit={addAlarm}>
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Alarm label"
                value={alarmLabel}
                onChange={(e) => setAlarmLabel(e.target.value)}
              />

              <button type="submit">
                Add Alarm
              </button>
            </form>

            <div className="alarm-list">
              {alarms.length === 0 ? (
                <div className="empty">
                  No alarms scheduled
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div className="alarm-item" key={alarm.id}>
                    <div className="alarm-info">
                      <strong>{alarm.time}</strong>
                      <span>{alarm.label}</span>
                    </div>

                    <div className="alarm-actions">
                      <button
                        className={
                          alarm.enabled
                            ? "toggle enabled"
                            : "toggle"
                        }
                        onClick={() => toggleAlarm(alarm.id)}
                      >
                        {alarm.enabled ? "ON" : "OFF"}
                      </button>

                      <button
                        className="delete"
                        onClick={() => deleteAlarm(alarm.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="stats-card glass">
            <div className="section-title">
              <span>📊</span>
              Dashboard Status
            </div>

            <div className="stats">
              <div className="stat">
                <span>TIME ZONES</span>
                <strong>{zones.length}</strong>
              </div>

              <div className="stat">
                <span>ACTIVE ALARMS</span>
                <strong>
                  {alarms.filter((a) => a.enabled).length}
                </strong>
              </div>

              <div className="stat">
                <span>UPDATE RATE</span>
                <strong>1s</strong>
              </div>

              <div className="stat">
                <span>FORMAT</span>
                <strong>{format24 ? "24H" : "12H"}</strong>
              </div>
            </div>

            <div className="performance">
              <div className="performance-title">
                <span>System performance</span>
                <span>Excellent</span>
              </div>

              <div className="progress">
                <div />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>ChronoWorld</span>
        <span>Real-time World Clock Dashboard</span>
        <span>React • Responsive • Live</span>
      </footer>
    </div>
  );
}

export default App;

