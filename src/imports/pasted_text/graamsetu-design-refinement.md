**Figma AI Prompt — GraamSetu Human-First Design Fix**

Refine the **existing GraamSetu UI design** to remove the “AI-generated template” feel and make it look **human-crafted, calm, and product-grade**.

Important rules:

* **Do NOT redesign the layout**
* **Do NOT create new screens**
* Only **refine and simplify the current design**
* Focus on **clean typography, minimal UI, and restrained styling**

---

# 1. Colours & Backgrounds

Improve colour usage for a **clean paper-like interface**.

Changes to apply:

• Remove **all gradients on cards, tiles, and stat boxes**

Replace with:

```
background: #FFFBF0
```

Gradients should exist **only on module headers**.

---

• Use **one page background colour only**

Replace alternating backgrounds with:

```
page background: #FDF4E3
```

Separate sections using **spacing and layout**, not background changes.

---

• Remove glow and heavy shadows

Remove:

```
box-shadow
filter: drop-shadow
```

Replace with subtle borders:

```
border: 1px solid #C1440E18
```

The interface should feel **like printed paper, not floating cards**.

---

# 2. Typography

Simplify typography to feel more human and editorial.

Rules:

• Use **only two font weights per component**

```
700 – main label or title
400 – all supporting text
```

Remove excessive weights like 500 / 600 / 800 / 900 inside the same card.

---

• Reduce hero heading size

Replace large responsive headline with:

```
font-size: 36px
```

Landing pages should feel **confident and restrained**.

---

• Remove ALL CAPS labels

Remove:

```
text-transform: uppercase
letter-spacing: 2px
```

Use **sentence case everywhere**.

Only the **GraamSetu logo** may keep brand styling.

---

• Remove mid-sentence bolding

Avoid bolding multiple words inside a sentence.

Use **plain readable prose**.

---

# 3. Layout & Spacing

Improve layout to avoid the common **AI-generated grid pattern**.

---

• Replace the 3-column feature grid

Instead of equal cards, use a **vertical list of modules**:

Layout structure:

Left side:
Large module number

Right side:
Module name
One short sentence

Example:

1 GraamScore
Alternative credit identity built from real financial behaviour.

This asymmetric layout feels **more editorial and human**.

---

• Remove animated stat counters

Delete large animated numbers like:

```
190M+
₹1.78L Cr
63%
317
```

Replace with **one paragraph of real context**:

Example:

"India has 190 million people with no credit score.
₹1.78 lakh crore in government benefits goes unclaimed every year.
GraamSetu helps families access both."

---

• Reduce padding across sections

Replace:

```
sections: 60px padding
cards: 22px padding
```

With:

```
sections: 40px padding
cards: 14px padding
```

Tighter spacing creates a **more confident layout**.

---

• Reduce border radius

Replace rounded “blob” shapes with subtle corners.

```
Cards: 8px
Buttons: 6px
Tags: 4px
```

This improves the **hand-crafted feel**.

---

# 4. Copy & Language

Improve clarity and tone.

---

Rewrite hero headline to:

```
आपका हक़। आपका पैसा। एक जगह।
Your rights. Your money. One place.
```

---

Remove arrows from buttons.

Replace:

```
Live Demo देखें →
Apply करें →
Get Started →
```

With:

```
Demo देखें
Apply करें
शुरू करें
```

---

Remove explanatory sections that say what will come next.

Example to delete:

“Five modules. One platform.”

Instead **show the modules immediately**.

---

Replace motivational closing lines with a clear action:

```
अभी शुरू करें — यह सेवा बिलकुल मुफ़्त है।
(Start now — this service is completely free.)
```

---

# 5. Components

Refine decorative elements.

---

• Remove Rangoli / Kolam patterns from cards and sections

Keep the **Warli village illustration only in the hero section**.

All cards should use **solid backgrounds only**.

---

• Remove emojis from UI labels

Replace:

```
⭐ GraamScore
🏛 HaqDar
📋 Action Items
```

With plain text:

```
GraamScore
HaqDar
Action Items
```

Icons may remain, but **no emoji**.

---

• One primary action per screen

Hero: **one CTA button only**

Dashboard: show **most urgent action first**, modules below.

Avoid showing everything at once.

---

• Reduce Madhubani divider usage

Use **only one divider** between the hero and the first section.

All other sections should rely on **spacing only**.

---

• Remove trust badge strip

Delete the footer badge list:

```
RBI AA · DPDP · DigiLocker · MyScheme · CPGRAMS
```

Mention RBI AA **once inside body text** instead of displaying badges.

---

# Design Outcome

After these refinements, the design should feel:

* Minimal
* Calm
* Human-crafted
* Editorial
* Trustworthy
* Government-grade but modern
* Not template-like

Keep the **existing structure**, only refine the visuals and typography.
