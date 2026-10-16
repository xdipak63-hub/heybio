import type { MetaFunction } from "react-router";
import { ArrowUpRight, Bug, Instagram, LifeBuoy, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { EditorialHero, EditorialLayout, Eyebrow } from "../../components/marketing/EditorialLayout";

export const meta: MetaFunction = () => [
  { title: "Contact HEYBIO — Support, Feedback & Enquiries" },
  { name: "description", content: "Contact HEYBIO by DIPO LABS at dipolabs123@gmail.com, or visit @haybio.in on Instagram." },
];

const email = "dipolabs123@gmail.com";
const makeMailto = (subject: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

export default function ContactPage() {
  return (
    <EditorialLayout>
      <EditorialHero label="HEYBIO / CONTACT" title={<>Let's talk.<br /><em>We're listening.</em></>} description="Questions about your HEYBIO page? An idea to share? Something not working? Here's how to reach the team behind HEYBIO." />
      <section className="he-container he-section" aria-labelledby="he-c-reach"><div className="he-heading he-reveal"><Eyebrow>GET IN TOUCH</Eyebrow><h2 id="he-c-reach">A real way<br /><em>to reach us.</em></h2></div><div className="he-contact-methods"><article className="he-contact-method he-contact-method--primary he-reveal"><Mail size={28} /><span className="he-small-label">SUPPORT & BUSINESS</span><h3>Email DIPO LABS.</h3><p>For account questions, suggestions, business enquiries or anything you want us to know.</p><a href={makeMailto("HEYBIO Enquiry")}>{email} <ArrowUpRight size={18} /></a></article><article className="he-contact-method he-reveal"><Instagram size={28} /><span className="he-small-label">SOCIAL</span><h3>Find us on Instagram.</h3><p>Follow the HEYBIO journey and visit our official social profile.</p><a href="https://www.instagram.com/haybio.in/" target="_blank" rel="noopener noreferrer">@haybio.in <ArrowUpRight size={18} /></a></article></div></section>
      <section className="he-surface he-section"><div className="he-container"><div className="he-heading he-reveal"><Eyebrow>CHOOSE A TOPIC</Eyebrow><h2>Get to the<br /><em>right conversation.</em></h2><p>These options open your email app with a relevant subject. There is no pretend support form or ticket number.</p></div><div className="he-contact-topics">{[{icon: LifeBuoy, title:"Account or login", label:"HEYBIO Account Support", copy:"Help with access, verification or a creator page."},{icon: Bug, title:"Report a problem", label:"HEYBIO Bug Report", copy:"Describe what happened and where you saw it."},{icon: MessageCircle, title:"Product feedback", label:"HEYBIO Product Feedback", copy:"Ideas that could make the experience better."},{icon: ShieldAlert, title:"Safety concern", label:"HEYBIO Safety Report", copy:"Report suspicious or abusive content with a public URL."}].map(({icon:Icon,title,label,copy}) => <a className="he-contact-topic he-reveal" key={title} href={makeMailto(label)}><Icon size={24} aria-hidden="true"/><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={19} aria-hidden="true"/></a>)}</div></div></section>
      <section className="he-container he-section he-half"><div className="he-reveal"><Eyebrow>BEFORE YOU EMAIL</Eyebrow><h2>Help us<br /><em>help you.</em></h2></div><div className="he-reveal"><p className="he-body-large">Tell us which page or feature you're using, what went wrong and what you expected to happen. A relevant screenshot can help—just hide private details first.</p><div className="he-privacy-note"><ShieldAlert size={22} /><p><strong>Please never share passwords, OTPs, authentication codes, card numbers or payment credentials</strong> by email or Instagram. We won't ask you for those details.</p></div></div></section>
    </EditorialLayout>
  );
}
