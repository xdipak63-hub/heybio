import { useState } from "react";
import type { MetaFunction } from "react-router";
import { ArrowUpRight, Check, Palette, SlidersHorizontal } from "lucide-react";
import { THEME_PRESETS } from "../../components/creator/ThemePicker";
import { ActionLink, ClosingCTA, EditorialHero, EditorialLayout, Eyebrow } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Templates — Explore HEYBIO profile styles" },
  { name: "description", content: "Preview HEYBIO creator page styles including Classic, Minimal, Midnight and Ice Blue." },
];

const showcaseIds = ["classic", "minimal", "midnight", "ice"] as const;
const showcase = showcaseIds.map((id) => {
  const preset = THEME_PRESETS.find((theme) => theme.id === id);
  if (!preset) throw new Error(`Missing HEYBIO theme preset: ${id}`);
  return preset;
});

export default function TemplatesPage() {
  const [selectedId, setSelectedId] = useState<(typeof THEME_PRESETS)[number]["id"]>("classic");
  const selected = showcase.find((theme) => theme.id === selectedId) ?? showcase[0]!;
  const isDark = selected.id === "midnight";

  return (
    <EditorialLayout>
      <EditorialHero label="HEYBIO / TEMPLATES" title={<>Your style.<br /><em>Your own space.</em></>} description="A page can be simple, expressive or somewhere in between. Explore a few HEYBIO profile looks and find your starting point.">
        <div className="he-actions"><ActionLink href="/#claim-username">Get started free</ActionLink><ActionLink href="#preview" secondary>Preview styles</ActionLink></div>
      </EditorialHero>
      <section className="he-surface he-section" id="preview" aria-labelledby="he-t-heading"><div className="he-container"><div className="he-heading he-reveal"><Eyebrow>LIVE-STYLE DEMO</Eyebrow><h2 id="he-t-heading">Choose a feel.<br /><em>See it instantly.</em></h2><p>These are illustrative previews based on real template presets in the application. This preview does not change or save your account theme.</p></div><div className="he-template-workspace he-reveal"><div className="he-template-controls"><div className="he-template-controls__title"><Palette size={22} /><h3>Explore styles</h3></div><p>Pick a preview style. Your public page will be customizable during setup, subject to your plan.</p><div className="he-template-options" aria-label="Template preview styles">{showcase.map((theme) => <button type="button" key={theme.id} className={selectedId === theme.id ? "he-template-option he-template-option--active" : "he-template-option"} aria-pressed={selectedId === theme.id} onClick={() => setSelectedId(theme.id)}><span className="he-template-option__swatch" style={{ backgroundColor: theme.background, color: theme.text }} aria-hidden="true">Aa</span><span><strong>{theme.name}</strong><small>{theme.id === "midnight" ? "Dark and bold" : theme.id === "ice" ? "Cool and light" : theme.id === "minimal" ? "Simple and sharp" : "Warm neutral"}</small></span>{selectedId === theme.id ? <Check size={18} aria-hidden="true" /> : null}</button>)}</div><div className="he-template-tip"><SlidersHorizontal size={19} /><span>Choose your actual theme inside HEYBIO after creating an account.</span></div></div><div className="he-template-stage"><div className="he-template-stage__label">PREVIEW · {selected.name.toUpperCase()}</div><div className="he-template-phone" key={selected.id} style={{ backgroundColor: selected.background, color: selected.text }}><div className="he-template-phone__brand">HEYBIO ↗</div><div className="he-template-phone__avatar" style={{ backgroundColor: isDark ? "#BDF806" : "#1D1D1F", color: isDark ? "#1D1D1F" : "#FFFFFF" }}>Y</div><h3>@yourworld</h3><p>Creator · Designer · Explorer</p><div className="he-template-phone__socials">IG &nbsp; · &nbsp; YT &nbsp; · &nbsp; WEB</div>{["My latest project", "See my work", "Let's connect"].map((link, i) => <div key={link} className="he-template-phone__link" style={{ backgroundColor: i === 0 ? "#BDF806" : isDark ? "#353537" : "#FFFFFF", color: i === 0 ? "#1D1D1F" : selected.text, borderColor: isDark ? "#4c4c4c" : "#E3E3E3" }}><span>{link}</span><ArrowUpRight size={16} aria-hidden="true" /></div>)}<small>Made with HEYBIO ↗</small></div><div className="he-template-stage__note">Illustrative profile only · No real creator data</div></div></div></div></section>
      <section className="he-container he-section he-half"><div className="he-reveal"><Eyebrow>BUILD YOUR IDENTITY</Eyebrow><h2>Make it yours.<br /><em>Keep it recognizable.</em></h2></div><div className="he-reveal"><p className="he-body-large">Your photo, short bio and featured links do most of the talking. A good template keeps the focus on your work—not visual clutter.</p><div className="he-tip-stack"><p><span>01</span> Start with a clear profile photo.</p><p><span>02</span> Put your best destination first.</p><p><span>03</span> Choose a style that fits your personality.</p></div></div></section>
      <ClosingCTA title="A page that looks like you." description="Start with your username, then make the details your own." />
    </EditorialLayout>
  );
}
