import { groq } from "./groq";



export type OpportunityInput = {
  business_goal?: string;
  product_name?: string;
  sector?: string;
  source_country?: string;
  target_country?: string;
  target_buyer_type?: string;
  product_description?: string;
  certifications?: string;
  monthly_capacity?: string;
  price_range?: string;
};

export type OpportunityReport = {
  summary: string;
  best_target_countries: string[];
  buyer_profile: string;
  distributor_profile: string;
  market_entry_difficulty: "Low" | "Medium" | "High";
  competition_level: "Low" | "Medium" | "High";
  required_documents: string[];
  pricing_approach: string;
  action_plan_30d: string[];
  outreach_message: string;
  risk_points: string[];
  next_step: string;
};

const COUNTRY_POOLS: Record<string, string[]> = {
  default: ["United States", "Germany", "United Arab Emirates", "Brazil", "Mexico", "Netherlands"],
  Agriculture: ["United Arab Emirates", "Saudi Arabia", "Netherlands", "Germany", "Singapore", "Malaysia"],
  "Food & Beverage": ["United States", "UAE", "United Kingdom", "Japan", "Canada", "Australia"],
  Manufacturing: ["United States", "Mexico", "Germany", "Vietnam", "Poland", "Brazil"],
  Automotive: ["Mexico", "Germany", "United States", "Czech Republic", "Thailand", "Brazil"],
  "Healthcare & Pharmaceuticals": ["United States", "Germany", "Brazil", "South Africa", "UAE", "Singapore"],
  "Technology / IT": ["United States", "United Kingdom", "Singapore", "UAE", "Germany", "Australia"],
};

export function generateOpportunityReport(input: OpportunityInput): OpportunityReport {
  const sector = input.sector || "default";
  const product = input.product_name || "your product";
  const target = input.target_country || "global markets";
  const source = input.source_country || "your country";
  const pool = COUNTRY_POOLS[sector] || COUNTRY_POOLS.default;
  const buyerType = input.target_buyer_type || "Distributors & B2B importers";

  return {
    summary: `${product} from ${source} shows strong export potential in ${target}. The ${sector} sector is expanding 7–11% YoY in key target markets, driven by post-pandemic supply diversification and rising B2B demand for verified suppliers.`,
    best_target_countries: pool.slice(0, 5),
    buyer_profile: `${buyerType} sourcing ${product} for regional redistribution. Typical buyer: mid-size importer ($5M–$50M revenue), 8–25 employees, 2–4 existing supplier relationships, actively seeking diversification.`,
    distributor_profile: `Established regional distributors with cold-chain / category-specific warehousing, existing retail relationships, and import licenses for ${sector}. Decision-makers: Head of Procurement, Country Manager.`,
    market_entry_difficulty: "Medium",
    competition_level: "Medium",
    required_documents: [
      "Commercial Invoice & Packing List",
      "Certificate of Origin",
      sector === "Food & Beverage" ? "FSSAI / FDA / Halal certification" : "Quality / ISO certification",
      "Bill of Lading / Airway Bill",
      "Phytosanitary / Health certificate (if applicable)",
      "Insurance certificate",
      "Letter of Credit or PI",
    ],
    pricing_approach: `Quote FOB ${source} and CIF ${target} variants. Recommend tiered pricing: sample order (5–10% premium), trial container (list price), repeat orders (3–7% volume discount). Build in 4–6% currency buffer.`,
    action_plan_30d: [
      "Day 1–3: Finalize digital catalog, pricing sheet, and one-pager pitch.",
      "Day 4–7: Identify 30–50 verified buyers in target countries via TradeConnect AI lead finder.",
      "Day 8–14: Run first outreach wave (email + LinkedIn) with personalized AI pitches.",
      "Day 15–20: Send WhatsApp follow-up + sample availability message to warm replies.",
      "Day 21–25: Book 5–8 discovery calls via Calendly/Topmate.",
      "Day 26–30: Send 2–3 sample shipments; convert 1–2 buyers to PI stage.",
    ],
    outreach_message: `Hi {{first_name}}, I'm reaching out from ${source} — we manufacture ${product} and currently supply buyers across ${pool.slice(0, 3).join(", ")}. Given ${target}'s growing demand in ${sector}, I'd love to explore if our quality grade and pricing fits your sourcing pipeline. Would a quick 20-min discovery call this week work? — {{your_name}}`,
    risk_points: [
      "FX volatility on long-cycle orders — hedge or quote in USD.",
      "Customs clearance delays in target country — partner with experienced CHA.",
      `Compliance risk if ${sector} certifications expire mid-shipment.`,
      "Payment risk on first orders — insist on 30% advance + LC for balance.",
    ],
    next_step: `Generate 10 verified buyer leads in ${pool[0]} and launch your first AI outreach campaign.`,
  };
}

export function generateBuyerProfile(lead: { name?: string; company?: string; country?: string; sector?: string }) {
  return `${lead.company || lead.name} is a ${lead.sector || "B2B"} buyer based in ${lead.country || "their market"}. Likely sourcing volume: medium. Typical decision cycle: 3–6 weeks. Best initial channel: warm email + LinkedIn touch.`;
}

export async function generateEmailPitch(
  lead: {
    name?: string;
    company?: string;
    sector?: string;
    product_interest?: string;
    interest?: string;
  },
  product = "our AI and web solutions"
) {

  const aiLeadData = {
    name: lead.name,
    company: lead.company,
    sector: lead.sector,
    productInterest: lead.product_interest,
    interest: lead.interest,
  };

  const prompt = `
You are an expert B2B sales copywriter.

Generate response in JSON format only.

{
"subject": "professional email subject",
"html": "complete professional HTML email"
}

Rules:

* Return ONLY valid raw JSON
* No markdown
* No explanation
* No code blocks
* html must contain ONLY clean HTML
* Professional B2B tone
* Natural human-like writing
* Short readable paragraphs
* Gmail compatible HTML
* Mobile responsive design
* Modern clean styling
* Strong CTA
* CTA must be a blue HTML button
* Use this booking link for CTA:
  https://calendly.com/jewelleryakg/30min
* Never use example.com links

Writing Style:

* Conversational
* Professional
* Personalized
* Concise
* Human sounding

Avoid:

* robotic wording
* fake excitement
* exaggerated claims
* generic sales language
* long paragraphs

IMPORTANT:
Do NOT include internal CRM details.

Never show:

* phone number
* country
* source
* score
* status
* email address
* CRM metadata
* raw JSON
* internal notes

Only use lead data for personalization.

Email Structure:

* Personalized greeting
* Relevant introduction
* Short value proposition
* Clear CTA button
* Professional signature

Signature:
Sophia Edu & IT Solutions
Email : info@sophia.edu-it.in

Lead Details:
${JSON.stringify(aiLeadData)}

Product/Service:
${product}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const text =
    response.choices[0]?.message?.content || "{}";

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (error) {


    console.log("RAW AI RESPONSE:", text);

    parsed = {
      subject: "Business Opportunity",
      html: `
      < div style = "font-family:Arial,sans-serif;padding:20px;" >
        ${text}
    </div>
      `,
    };
  }

  return {
    subject: parsed.subject || "Business Opportunity",
    body: parsed.html || text,
  };
}


export function generateWhatsAppMessage(lead: { name?: string; company?: string }, product = "our products") {
  const first = (lead.name || "there").split(" ")[0];
  return `Hi ${first} 👋 Following up on my email about ${product}. We're an established supplier and would love to share a quick catalog & pricing sheet. Open to a 20-min call this week?`;
}

export function generateLinkedInMessage(lead: { name?: string; company?: string }) {
  const first = (lead.name || "there").split(" ")[0];
  return `Hi ${first}, came across ${lead.company || "your company"} and noticed strong fit with what we supply. Would love to connect and explore a potential partnership.`;
}

export function generateCallScript(lead: { name?: string; company?: string; country?: string }, purpose = "Introduction") {
  const first = (lead.name || "there").split(" ")[0];
  return `Opening:\n"Hi ${first}, this is {{your_name}} from {{company}}. Do you have 2 minutes? I'm calling about a potential supply partnership for ${lead.company || "your business"}."\n\nPurpose: ${purpose}\n\nQualifying questions:\n1. Are you currently sourcing this category for ${lead.country || "your market"}?\n2. What volumes do you typically import per quarter?\n3. Who handles supplier evaluation on your side?\n4. What's been your biggest pain point with current suppliers?\n\nValue pitch:\n"We're a verified exporter with consistent quality and flexible MOQs. We can ship samples this week and would love to set up a proper discovery call to walk through pricing and references."\n\nClose:\n"Can I send you a discovery-call link to book 20 minutes when it's convenient?"`;
}

export async function generateAICallScript(
  lead: {
    name?: string;
    company?: string;
    country?: string;
    sector?: string;
  },
  purpose = "Introduction"
) {
  const prompt = `
You are an expert B2B sales caller.

Create a realistic professional phone call script.

Lead:
${JSON.stringify(lead)}

Purpose:
${purpose}

Include:

1. Opening
2. Rapport building
3. Discovery questions
4. Objection handling
5. Value proposition
6. Call to action
7. Closing
Never invent:

- company names
- employee names
- statistics
- revenue numbers
- customer success percentages
- case studies

Use only information provided in Lead Details.

If sender company is not provided,
refer to sender as:
"Sophia Edu & IT Solutions"

Do not mention:
TechBridge
Alex
John
Sarah
or any fictional person.
Return plain text only.

Return script in this format:

OPENING:
...

RAPPORT:
...

DISCOVERY QUESTIONS:
...

VALUE PROPOSITION:
...

OBJECTION HANDLING:
...

CTA:
...

CLOSING:
...
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
}

export function generateFollowupSequence(channels = "Mixed") {
  const baseChannel = channels === "Email" ? "Email" : channels === "WhatsApp" ? "WhatsApp" : channels === "Call" ? "Call" : "Mixed";
  const pick = (mixed: string, _fixed: string) => (baseChannel === "Mixed" ? mixed : baseChannel);
  return [
    { day: 0, step: 1, channel: pick("Email", "Email"), type: "Introduction", message: "Initial intro email with company overview, key products, and call-to-action for discovery call." },
    { day: 2, step: 2, channel: pick("Email", "Email"), type: "Follow-up", message: "Polite nudge: 'Wanted to make sure my last note didn't get buried. Happy to share samples and pricing.'" },
    { day: 4, step: 3, channel: pick("WhatsApp", "WhatsApp"), type: "Touch", message: "Short WhatsApp message with catalog link and Calendly booking link." },
    { day: 6, step: 4, channel: pick("Call", "Call"), type: "AI call reminder", message: "Schedule a consent-based AI introduction call. Confirm timing and lead qualification." },
    { day: 8, step: 5, channel: pick("Email", "Email"), type: "Final follow-up", message: "Last value-add email: industry insight + clear offer to book discovery call." },
    { day: 10, step: 6, channel: pick("Email", "Email"), type: "Nurture / archive", message: "Move to monthly nurture sequence or archive if no engagement." },
  ];
}

export function generatePreCallBrief(lead: {
  name?: string; company?: string; country?: string; sector?: string; interest?: string;
}) {
  return {
    lead_summary: `${lead.name || "Lead"} — ${lead.company || "Company"} (${lead.country || "Country"}). Sector: ${lead.sector || "—"}. Interest: ${lead.interest || "general inquiry"}.`,
    opportunity: `Potential ${lead.sector || "B2B"} supply relationship in ${lead.country || "their market"}. Lead has shown initial interest — needs validation of fit and timing.`,
    suggested_pitch: `Lead with credibility (existing buyers, certifications), then transition to specific fit: "Given you operate in ${lead.country || "this region"}, here's why we're a strong match…"`,
    questions_to_ask: [
      "What's driving your interest in a new supplier right now?",
      "What volumes are you currently importing?",
      "What's your typical sourcing & evaluation timeline?",
      "Who else is involved in the supplier decision?",
      "What would success look like in 6 months?",
    ],
    possible_objections: [
      "We're happy with current suppliers — Position as backup/diversification.",
      "Your pricing seems high — Anchor on quality, reliability, total cost of ownership.",
      "Need to check with my team — Offer to send a one-pager + book follow-up.",
    ],
    recommended_offer: "Free sample shipment + 5% discount on first trial container, valid for 30 days.",
    next_step: "Confirm sample shipment address and book a follow-up technical call within 7 days.",
  };
}

export function generatePostCallSummary(lead: { name?: string; company?: string }, outcome = "Interested") {
  return `Call with ${lead.name || "lead"} (${lead.company || "company"}) completed. Outcome: ${outcome}.\n\nKey takeaways:\n- Lead confirmed sourcing interest and shared decision timeline.\n- Discussed pricing structure and MOQs.\n- Agreed on next steps (samples / proposal / follow-up call).\n\nAction items:\n1. Send sample shipment + technical spec sheet within 48 hours.\n2. Share commercial proposal by end of week.\n3. Book follow-up discovery call in 7–10 days.`;
}

export function generateDiscoveryCallMessage(link?: string) {
  return `Thank you for your interest. You can schedule a free 20-minute discovery call using the link below — pick any slot that works for you:\n\n${link || "{{your_calendly_or_topmate_link}}"}\n\nLooking forward to it!`;
}
