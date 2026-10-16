import { useEffect, useState } from "react";
import { Check, Cookie, RotateCcw } from "lucide-react";
import { readCookiePreferences, type CookiePreferences } from "../shared/CookieConsent";

const KEY = "heybio_cookie_preferences_v1";

export default function CookiePreferences() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const preferences = readCookiePreferences();
    if (preferences) {
      setAnalytics(preferences.analytics);
      setMarketing(preferences.marketing);
      setSaved(true);
    }
    setReady(true);
  }, []);

  function savePreferences(a: boolean, m: boolean) {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: a,
      marketing: m,
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(preferences));
      setSaved(true);
      setAnalytics(a);
      setMarketing(m);
      setMessage("Your preferences were saved in this browser.");
      window.dispatchEvent(new CustomEvent("heybio:consent", { detail: preferences }));
    } catch {
      setMessage("This browser did not allow preference storage. Check its privacy settings.");
    }
  }

  return (
    <section className="hb-legal__prefs" id="cookie-settings" aria-labelledby="cookie-settings-heading">
      <div className="hb-legal__prefs-title"><Cookie size={22} aria-hidden="true" /><span>YOUR CHOICES</span></div>
      <h2 id="cookie-settings-heading">Cookie preferences</h2>
      <p>Control optional browser storage for this device. Necessary session storage remains available for security and account functions. Your choices are stored locally. Optional technologies must respect these choices if they are introduced.</p>
      <div className="hb-legal__pref-row"><div><strong>Necessary</strong><span>Login and essential platform functions</span></div><span className="hb-legal__required">Always active</span></div>
      <label className="hb-legal__pref-row"><span><strong>Optional analytics</strong><span>Only for optional measurement tools if enabled</span></span><input type="checkbox" checked={analytics} disabled={!ready} onChange={(e) => { setAnalytics(e.target.checked); setMessage(""); }} /></label>
      <label className="hb-legal__pref-row"><span><strong>Optional marketing</strong><span>Only for optional marketing tools if enabled</span></span><input type="checkbox" checked={marketing} disabled={!ready} onChange={(e) => { setMarketing(e.target.checked); setMessage(""); }} /></label>
      <div className="hb-legal__prefs-actions"><button type="button" onClick={() => savePreferences(analytics, marketing)} disabled={!ready}><Check size={17} aria-hidden="true" /> Save choices</button><button type="button" className="hb-legal__prefs-secondary" onClick={() => savePreferences(false, false)} disabled={!ready}><RotateCcw size={16} aria-hidden="true" /> Reject optional</button></div>
      <p className="hb-legal__prefs-feedback" role="status" aria-live="polite">{message || (saved ? "Saved preferences loaded for this browser." : "No preferences saved on this browser yet.")}</p>
    </section>
  );
}
