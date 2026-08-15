Got it! I'll make the design decisions for you where needed. Here is your complete, solidified Figma prompt:

---

## Figma Design Prompt: BalikBayan Frontend

---

### Project Overview

Design a modern, minimal, professional web application called **BalikBayan** — a blockchain-powered OFW remittance platform built on Stellar and Soroban smart contracts. The platform serves four user types accessible from one app: OFW senders (Tatay abroad), family receivers (Nanay/Anak at home), and merchant partners (businesses offering perks). Users switch between roles after connecting their Freighter wallet.

The design must feel trustworthy, clean, and approachable — not intimidating like typical crypto apps. All blockchain complexity is completely hidden. Users only see peso amounts, simple actions, bill names they recognize (Meralco, Maynilad, PLDT), and clear status indicators. No technical terms like "smart contract", "escrow", "USDC", or "Soroban" appear anywhere in the UI.

---

### Brand Identity

**Name:** BalikBayan
**Tagline:** *Every peso sent. Every sacrifice remembered.*
**Personality:** Trustworthy, warm, modern, Filipino-proud

**Color Palette:**
- Primary Dark Navy: `#1A3A5C`
- Primary Blue: `#2563A0`
- Accent Sky Blue: `#60A5FA`
- Light Blue Background: `#F0F6FF`
- White: `#FFFFFF`
- Text Dark: `#1E293B`
- Text Muted: `#64748B`
- Success Green: `#22C55E`
- Warning Amber: `#F59E0B`
- Error Red: `#EF4444`
- Border Light: `#E2E8F0`

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Numbers/Amounts: Inter Mono

**Logo:** Minimalist balikbayan box icon with a subtle chain link underneath. "Balik" in `#1A3A5C`, "Bayan" in `#2563A0`. Flat, no gradients, no shadows.

---

### Design System — Build This First

Before any page, create a full component library:

**Buttons:**
- Primary: Navy fill `#1A3A5C`, white text, `8px` border radius
- Secondary: Outlined navy border, navy text
- Ghost: No border, navy text, hover underline
- Destructive: Red fill for cancel/dispute actions
- Disabled: Gray fill, not clickable, cursor not-allowed
- Loading state: Spinner inside button, text changes to "Processing..."

**Input Fields:**
- Default, Focus (blue border), Error (red border + error message below), Disabled
- All inputs have a visible label above and helper text below

**Cards:**
- White background, `1px` border `#E2E8F0`, `8px` radius, subtle shadow
- Hover state: slightly elevated shadow

**Status Chips:**
- Locked: Amber background `#FEF3C7`, amber text — for active escrows waiting for proof
- Fulfilled: Green background `#DCFCE7`, green text — payment confirmed
- Expired: Red background `#FEE2E2`, red text — deadline passed
- Disputed: Orange background `#FFEDD5`, orange text — frozen escrow
- Pending: Blue background `#DBEAFE`, blue text — proof submitted, awaiting verification

**Bill Type Icons:**
- Each bill type has a unique icon inside a colored circle:
  - Tuition: graduation cap, blue
  - Electricity: lightning bolt, amber
  - Water: water drop, cyan
  - Internet: wifi signal, purple
  - Medical: cross/plus, red
  - Rent: house, green
  - Grocery: shopping bag, orange
  - Medicine: pill, pink
  - Savings: piggy bank, teal
  - Custom: pencil, gray

**NFT Box Card:**
- Illustrated balikbayan box with tier-colored border
- Box number badge top-left (#001, #002...)
- Country flag sticker bottom-right
- Amount and date at the bottom
- Tier glow effect: Common (no glow), Silver (gray glow), Gold (gold glow), Diamond (blue glow), Legend (rainbow animated glow)

**Tier Badge:**
- Icon + tier name + colored pill
- Common: gray, Silver: silver, Gold: gold, Diamond: blue, Legend: gradient rainbow

**Wallet Connect Button:**
- Shows "Connect Freighter Wallet" when disconnected
- Shows first 6 and last 4 characters of wallet address when connected (e.g. `GCABC...XYZ1`)
- Clicking when connected shows dropdown: Copy Address, Disconnect, Switch Role

**Role Switcher:**
- Visible in navbar after wallet connects
- Toggle tabs: OFW View / Family View / Merchant View
- Active tab highlighted in navy

**Toast Notifications:**
- Success: green left border, checkmark icon
- Error: red left border, X icon
- Info: blue left border, info icon
- Always appears top-right, auto-dismisses after 4 seconds

**Empty States:**
- Every empty list or section has an illustration + headline + subtext + CTA button
- Example: No escrows yet → balikbayan box illustration → "No promises yet" → "Send your first promise"

**Loading States:**
- Skeleton loaders for all cards and lists
- Full-page loader when wallet is connecting

---

### Responsive Breakpoints

- Mobile: `375px`
- Tablet: `768px`
- Desktop: `1440px`

Design every page at all three breakpoints. Desktop is primary. Mobile uses bottom navigation bar with 4 tabs: Home, Send, Boxes, Perks.

---

### Navigation Structure

**Desktop — Left Sidebar (after login):**
- BalikBayan logo top
- Role switcher tabs below logo
- Nav links depending on role (see per-role below)
- Wallet address display at very bottom
- Disconnect button

**Mobile — Bottom Navigation Bar:**
- Home icon
- Send icon (OFW only)
- Boxes icon
- Perks icon
- Profile/Wallet icon

**Top Navbar (always visible):**
- Logo left
- Role switcher center
- Wallet connect button right
- Notification bell icon right

---

### Pages to Design

---

#### Page 1 — Landing Page (Pre-login)

**Purpose:** Explain BalikBayan simply and convert visitors to connect wallet.

**Navbar:** Logo left. "Connect Freighter Wallet" button right. No other nav links.

**Hero Section:**
- Headline: "Send money home with purpose."
- Subheadline: "Lock funds for tuition, bills, and essentials. Earn collectible BalikBayan boxes. Unlock real rewards for your family."
- Two buttons: "Connect Wallet" (primary) and "See How It Works" (ghost, scrolls down)
- Right side: Illustrated glowing balikbayan box with floating NFT badge above it
- Background: White with soft light blue gradient wash on right

**How It Works — 3 steps horizontal:**
- Step 1: "Lock funds for a purpose" — lock icon
- Step 2: "Family proves bill paid" — receipt checkmark icon
- Step 3: "Money releases automatically" — arrow release icon
- Each step: icon circle + bold title + one sentence description

**For Who — 3 role cards:**
- OFW Sender card: brief description + "I'm sending money" button
- Family Receiver card: brief description + "I'm receiving money" button
- Merchant Partner card: brief description + "Partner with us" button
- Clicking any card triggers wallet connect

**BalikBayan Box Tier Showcase:**
- Dark navy full-width section
- Left: Tier progression visual — 5 boxes lined up Common to Legend with tier names and one key perk each
- Right: "Every remittance earns a box. Every box builds your legacy."

**Trust Bar:**
- Three numbers: OFWs Served, Total Remittances Locked, Partner Merchants
- Clean horizontal strip, white background

**Footer:**
- Logo + tagline
- Links: About, How It Works, For Merchants, Privacy
- "Built on Stellar" badge with Stellar logo
- Copyright

---

#### Page 2 — Wallet Connect Flow

**Purpose:** Guide user through connecting Freighter and selecting their role.

**Step 1 — Connect Wallet Modal:**
- Modal appears on "Connect Wallet" click
- Title: "Connect your Freighter Wallet"
- Freighter logo + name displayed as the only wallet option
- "Install Freighter" link below if user doesn't have it
- "Connect" button — triggers Freighter browser popup
- Loading state: spinner + "Waiting for Freighter..."
- Error state: "Connection failed. Make sure Freighter is installed and set to Testnet."

**Step 2 — Select Your Role Modal (after wallet connects):**
- Title: "Who are you?"
- Three large cards to tap:
  - OFW Sender: icon of person abroad, "I send money home"
  - Family Receiver: icon of family at home, "I receive money from abroad"
  - Merchant Partner: icon of store, "I offer perks to OFW families"
- User can switch roles anytime from navbar

---

#### Page 3 — OFW Dashboard

**Purpose:** Main home for the OFW. Full overview of promises, collection, and tier.

**Layout:** Left sidebar + main content (desktop). Bottom nav (mobile).

**Sidebar Nav Links:** Dashboard, Send Money, My Boxes, Transaction History, Settings

**Top Stats Row — 4 cards:**
- Total Sent This Month (in PHP)
- Active Promises (count with lock icon)
- Current Tier (tier badge)
- Boxes to Next Tier (progress bar)

**Active Promises Section:**
- Section title: "Your Active Promises"
- Each promise card shows:
  - Bill type icon + bill name (e.g. "Meralco Electricity")
  - Recipient nickname (e.g. "Nanay Rosa")
  - Amount locked in PHP
  - Status chip (Locked / Proof Submitted / Fulfilled / Expired / Disputed)
  - Deadline countdown (e.g. "5 days left")
  - Two action buttons: "View Details" and "Cancel" (cancel only shows if status is Locked)
- Empty state: "No active promises. Send your first promise."

**Recent BalikBayan Boxes — horizontal scroll row:**
- Shows 3 most recent boxes
- Each: box illustration, box number, amount, date, country flag
- "View Full Collection" button at end of row

**Recent Activity Feed:**
- Timeline list
- Each item: colored dot + description + timestamp
- Examples: "Promise created for Meralco — PHP 2,200", "Proof submitted by Nanay Rosa", "Funds released", "Box #005 minted — Silver tier unlocked!"

---

#### Page 4 — Send Money / Create Promise (OFW)

**Purpose:** Core action flow. Must feel as simple as GCash. 4-step wizard.

**Progress Bar at top:** Step 1 of 4 — dots connected by line, active step highlighted navy.

---

**Step 1 — Who are you sending to?**
- Input: "Recipient Stellar wallet address" — text field with paste button and QR scan icon
- OR select from saved contacts — shows list of saved family wallets with nicknames and country flags
- "Add new contact" option at bottom of list
- "Next" button — disabled until valid wallet address entered

---

**Step 2 — How much?**
- Input: Amount in PHP — large number input, prominent
- Below input: "≈ X USDC" shown in real time as conversion (small muted text)
- Below that: "Fee: less than PHP 1" in green
- Toggle: One-time send / Monthly recurring (toggle switch)
- If recurring selected: shows "Lock on the 1st of every month" note
- "Next" button

---

**Step 3 — What is this money for?**
- Section title: "Choose a bill type"
- Grid of bill type preset cards (tap to select):
  - Each card: colored icon circle + bill name
  - Tuition, Electricity, Water, Internet, Medical, Rent, Grocery, Medicine, Savings, Custom
  - Selected card gets navy border + checkmark
- After selecting, additional fields appear below:

  **If Tuition selected:**
  - Input: School name (text field with suggestions dropdown — UST, PUP, DLSU, UP, Ateneo, Other)
  - Input: Semester (dropdown — 1st Sem, 2nd Sem, Summer)
  - Input: Student name

  **If Electricity selected:**
  - Dropdown: Provider (Meralco, VECO, CEPALCO, Other)
  - Input: Account number
  - Input: Expected bill amount (PHP)

  **If Water selected:**
  - Dropdown: Provider (Maynilad, Manila Water, Local provider)
  - Input: Account number

  **If Internet/Cable selected:**
  - Dropdown: Provider (PLDT, Globe, Sky Cable, Converge, Other)
  - Input: Account number

  **If Medical selected:**
  - Input: Hospital or clinic name
  - Input: Patient name

  **If Rent selected:**
  - Input: Landlord name
  - Input: Landlord Stellar wallet OR GCash number

  **If Custom selected:**
  - Text area: "Describe what this money is for" (max 200 characters)

- Deadline picker: "Release funds if not confirmed by:" — date picker, minimum 3 days from today
- Toggle: Enable backup approver — if ON shows input for backup wallet address
- "Next" button

---

**Step 4 — Review and Confirm**
- Summary card showing all details:
  - Recipient wallet (shortened) + nickname
  - Amount in PHP + USDC equivalent
  - Bill type icon + bill name
  - Payee details (account number, school name, etc.)
  - Deadline date
  - Fee: less than PHP 1
- Checkbox: "I confirm all details above are correct"
- Primary button: "Lock Funds and Send Promise"
- Below button: small note — "A BalikBayan Box will be minted to your wallet once the family confirms payment"
- Loading state after clicking: "Signing transaction..." → "Sending to blockchain..." → "Confirmed!"

**Success Screen (full page):**
- Animated balikbayan box bouncing with confetti
- "Your promise is locked!"
- Shows new box preview if this fulfills a milestone
- Two buttons: "Send Another Promise" and "Go to Dashboard"

---

#### Page 5 — Family Dashboard

**Purpose:** Home screen for family. Shows all active bill conditions and tier perks.

**Top Tier Banner:**
- Full-width colored banner matching current tier color
- Shows: Tier badge + tier name + "Show this at [partner merchant] for X% off"
- If Common tier: "Complete 5 promises to reach Silver Tier"

**Active Bills Section:**
- Section title: "Bills to Confirm"
- Each bill card shows:
  - Bill type icon + bill name + provider name
  - Amount locked in PHP
  - Status chip
  - Deadline countdown
  - If status is Locked: "Submit Proof" button (primary, prominent)
  - If status is Proof Submitted: "Verification in progress..." with spinner
  - If status is Fulfilled: Green checkmark, "Funds Released"

**Submit Proof Flow — triggered by "Submit Proof" button:**
- Drawer slides up from bottom (mobile) or modal appears (desktop)
- Title: "Prove [Bill Name] was paid"
- Three options shown as tabs:
  - "Upload Receipt Photo" — drag and drop area or camera button
  - "Scan QR Code" — opens camera for QR scan
  - "Type Account Number" — manual input of account number + amount paid
- After submitting: Loading animation with message "Checking your receipt with AI..."
- Success: Green checkmark + "Receipt verified! Funds are being released to your account."
- Failure: Red warning + "We couldn't verify this receipt. Please try again or ask Tatay to approve manually."

**Tier Perks Section:**
- Section title: "Your Current Perks"
- Grid of merchant perk cards:
  - Merchant logo placeholder (gray circle with store icon)
  - Merchant name
  - Discount offer (e.g. "5% off on all purchases")
  - "Show QR Code" button — opens full-screen QR modal for cashier to scan
  - Locked perks shown grayed out with "Reach Gold Tier to unlock"
- Progress bar: "X more promises until [next tier]"

**Family Activity Feed:**
- Timeline of recent events: promise received, proof submitted, funds released, new perk unlocked

---

#### Page 6 — NFT Collection / BalikBayan Boxes (OFW)

**Purpose:** Full box collection. This is the emotional legacy page.

**Header Stats Row:**
- Total Boxes Collected
- Lifetime Amount Sent (PHP)
- Current Streak (consecutive months)
- Member Since (date)

**Tier Progress Tracker:**
- Horizontal visual timeline: Common → Silver → Gold → Diamond → Legend
- Current tier glowing/highlighted
- Completed tiers filled navy
- Future tiers grayed out
- Box count shown at each threshold (5, 12, 24, 60)

**Filter and Sort Bar:**
- Filter: All / Common / Silver / Gold / Diamond / Legend
- Filter: By Year (dropdown)
- Sort: Newest / Oldest / Largest Amount

**Box Collection Grid:**
- 3 columns desktop, 2 columns tablet, 1 column mobile
- Each box card: box illustration, box number, tier border color, country flag sticker, amount, date, bill type icon, special milestone sticker if applicable

**Box Detail Modal (on click):**
- Large box illustration left
- Right side: full metadata
  - Box number
  - Amount sent in PHP
  - Date and time
  - Country sent from + flag
  - Bill type fulfilled
  - Blockchain transaction hash (shortened, with copy button and external link to Stellar Explorer)
- "Share My Box" button — generates a shareable image card
- "View on Stellar Explorer" link

---

#### Page 7 — Transaction History

**Purpose:** Full record of all transactions for OFW and family.

**Filter Bar:**
- Date range picker
- Status filter: All / Active / Fulfilled / Expired / Disputed
- Bill type filter: All / Tuition / Electricity / Water / etc.
- Search by recipient name or account number

**Desktop — Table view:**
- Columns: Date, Recipient, Bill Type (icon + name), Amount (PHP), Status chip, Action button
- Clicking a row expands it to show: proof photo thumbnail, AI verification result, blockchain hash, release timestamp

**Mobile — Card list view:**
- Each card: bill icon, bill name, amount, status chip, date, "View Details" button

**Export bar:**
- "Download PDF" button
- "Download CSV" button

---

#### Page 8 — Merchant Partner View

**Purpose:** Merchants verify customer NFT tier and redeem discounts.

**Merchant Dashboard:**
- Stats: Total Redemptions This Month, Customers Reached, Estimated Discount Value Given
- Recent redemptions list: customer wallet (shortened), tier badge, discount applied, timestamp

**Redemption Scanner:**
- Large camera button: "Scan Customer QR Code"
- Opens camera, scans QR from customer's phone
- Verification result card shows:
  - Customer tier badge (Silver / Gold / Diamond / Legend)
  - Discount to apply (e.g. "Apply 10% discount")
  - Valid / Invalid status with large colored indicator
  - Timestamp of verification

---

### Interaction and Prototype Notes

**Required Prototype Flows in Figma:**

Flow 1 — OFW Send Flow:
Landing → Connect Wallet Modal → Select Role (OFW) → OFW Dashboard → Send Money Step 1 → Step 2 → Step 3 (select Electricity → pick Meralco → enter account number) → Step 4 Review → Success Screen → OFW Dashboard (box count updated)

Flow 2 — Family Confirm Flow:
Landing → Connect Wallet → Select Role (Family) → Family Dashboard → Submit Proof (upload receipt) → AI Verification loading → Success → Dashboard updated (funds released, tier checked)

Flow 3 — Merchant Redeem Flow:
Landing → Connect Wallet → Select Role (Merchant) → Merchant Dashboard → Scan QR → Verification Result

**Figma Technical Requirements:**
- Use Auto Layout on every frame and component
- Use Variants for all buttons, inputs, cards, and status chips
- Use Component Properties for show/hide states (error, loading, empty, success)
- Every clickable element must have a hover state defined
- All modals and drawers must have overlay backgrounds
- Use real Filipino placeholder content — not Lorem Ipsum:
  - Names: Tatay Eddie, Nanay Rosa, Anak Miguel
  - Amounts: PHP 18,500 / PHP 2,200 / PHP 850
  - Wallets: GCABC...XYZ1
  - Schools: Polytechnic University of the Philippines
  - Providers: Meralco, Maynilad, PLDT

---

### Copy and Tone Rules

- No blockchain jargon anywhere in the UI
- Never use: smart contract, escrow, USDC, Soroban, mint, wallet address (say "your BalikBayan ID" instead)
- Use instead: "locked funds", "promise", "digital box", "released", "earned", "confirmed"
- Error messages: friendly and actionable ("We couldn't verify this receipt. Please try again or contact support.")
- Success messages: warm and celebratory ("Your promise is locked! Tatay will be notified.")
- Loading messages: reassuring ("Checking your receipt..." / "Sending to blockchain..." / "Almost there...")

---

### Deliverables Expected

- Design system / component library frame
- 8 page designs at desktop (1440px), tablet (768px), and mobile (375px)
- 3 prototype flows fully connected and clickable
- All bill type icons as exportable SVGs
- NFT box illustrations for all 5 tiers
- Handoff-ready: proper layer naming, grouped frames, no detached components

---

That's your complete, solidified Figma prompt. Every button has a defined state, every bill type has its own fields, Freighter wallet connect flow is fully specified, and all three user roles are covered with their own flows. Ready to hand to any designer!