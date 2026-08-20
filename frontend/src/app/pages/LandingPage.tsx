import { Package, Send, Receipt, CheckCircle2, ArrowRight, Users, Heart, Store, Sparkles, Shield, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} as const;

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
} as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
} as const;

const TIER_SHOWCASE = [
  { tier: 'Common', boxes: '0–4 boxes', bg: 'from-slate-400 to-slate-500', glow: '' },
  { tier: 'Silver', boxes: '5–11 boxes', bg: 'from-slate-300 to-slate-500', glow: '' },
  { tier: 'Gold', boxes: '12–23 boxes', bg: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-200' },
  { tier: 'Diamond', boxes: '24–59 boxes', bg: 'from-blue-400 to-indigo-600', glow: 'shadow-blue-200' },
  { tier: 'Legend', boxes: '60+ boxes', bg: 'from-yellow-400 via-pink-500 to-purple-600', glow: 'shadow-purple-200' },
];

export function LandingPage() {
  const { connectWallet, walletConnected, walletError, setUserRole } = useApp();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Advance from the connect modal to role selection only once the context
  // confirms a wallet is actually connected — not just because the async
  // call resolved (connectWallet() resolves on both success and failure).
  useEffect(() => {
    if (walletConnected && showConnectModal) {
      setShowConnectModal(false);
      setShowRoleModal(true);
    }
  }, [walletConnected, showConnectModal]);

  const handleConnect = () => {
    setShowConnectModal(true);
  };

  const confirmConnect = async () => {
    setIsConnecting(true);
    // connectWallet() never throws — it reports failure via context's walletError
    // instead — so success is determined by checking walletConnected afterward,
    // not by a try/catch (a plain catch here would silently swallow wallet-not-found,
    // rejected, and other errors and still advance to role selection).
    await connectWallet();
    setIsConnecting(false);
  };

  return (
    <>
      <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {/* Hero */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-white to-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(196,226,245,0.6),transparent_70%)] blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(75,184,250,0.2),transparent_70%)] blur-3xl pointer-events-none" />

          <div className="hidden lg:flex absolute top-24 right-[15%] w-14 h-14 rounded-2xl bg-white shadow-lg shadow-blue-100 border border-[#C4E2F5] items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
            <Package className="w-6 h-6 text-[#2C5EAD]" />
          </div>
          <div className="hidden lg:flex absolute top-48 right-[8%] w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md items-center justify-center animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="hidden lg:flex absolute bottom-32 right-[20%] w-12 h-12 rounded-2xl bg-white shadow-lg border border-[#C4E2F5] items-center justify-center animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
            <Shield className="w-5 h-5 text-[#1591DC]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center relative">
            <motion.div variants={heroContainer} initial="hidden" animate="show">
              <motion.div variants={heroItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4E2F5] text-[#2C5EAD] text-xs font-bold mb-6 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Blockchain-Secured Remittance
              </motion.div>
              <motion.h1 variants={heroItem} className="text-5xl sm:text-6xl font-extrabold text-[#1E293B] leading-[1.1] tracking-tight mb-6">
                Send Money<br />
                <motion.span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 45%, transparent 60%), linear-gradient(90deg, #2C5EAD, #4BB8FA)',
                    backgroundSize: '250% 100%, 100% 100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                  animate={{ backgroundPosition: ['-150% 0, 0 0', '150% 0, 0 0'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                >
                  With Purpose.
                </motion.span>
              </motion.h1>
              <motion.p variants={heroItem} className="text-xl text-[#64748B] leading-relaxed mb-10 max-w-lg">
                Every peso is protected until it fulfills its promise. Blockchain escrow ensures your hard-earned money reaches exactly where it was meant to go.
              </motion.p>
              <motion.div variants={heroItem} className="flex flex-wrap gap-4">
                <motion.button
                  onClick={handleConnect}
                  whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(21,145,220,0.3)' }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2C5EAD] text-white font-bold text-base hover:bg-[#1591DC] transition-colors shadow-lg shadow-blue-200"
                >
                  <Wallet className="w-5 h-5" /> Connect Wallet
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-[#C4E2F5] text-[#2C5EAD] font-bold text-base hover:bg-[#EFF6FF] transition-colors"
                >
                  See How It Works
                </motion.button>
              </motion.div>
              <motion.p variants={heroItem} className="mt-6 text-sm text-[#64748B] italic">"Every peso sent. Every sacrifice remembered."</motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-[#E2E8F0] p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#64748B] font-medium">Escrow Protected</p>
                    <p className="text-3xl font-extrabold text-[#1E293B]">₱24,500</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C5EAD] to-[#4BB8FA] flex items-center justify-center shadow-md">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="h-px bg-[#E2E8F0]" />
                {[
                  { label: 'Maria Santos — Electricity', progress: 60, icon: Send, color: '#F59E0B' },
                  { label: 'Jose Reyes — Tuition', progress: 15, icon: Send, color: '#2C5EAD' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                      <p.icon className="w-4 h-4" style={{ color: p.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B] truncate">{p.label}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-[#EFF6FF] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.progress}%` }}
                          transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-[#2C5EAD] to-[#4BB8FA]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.6, ease: 'easeOut' }}
                  className="pt-2"
                >
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-sm flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800">Gold NFT Box Earned!</p>
                      <p className="text-xs text-amber-600">Tuition promise fulfilled</p>
                    </div>
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
                      className="ml-auto"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.4 }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <p className="text-xs font-bold text-[#1591DC] uppercase tracking-widest mb-3">How It Works</p>
              <h2 className="text-4xl font-extrabold text-[#1E293B] tracking-tight">Three steps. One promise kept.</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 relative">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
                className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-[#C4E2F5] via-[#4BB8FA] to-[#C4E2F5]"
              />
              {[
                { num: '01', icon: Send, title: 'Lock funds for a purpose', body: "Specify the exact bill or expense. Funds enter blockchain escrow on Stellar and are locked until conditions are met.", color: '#2C5EAD' },
                { num: '02', icon: Receipt, title: 'Family pays the bill', body: 'Your family submits a receipt. Our AI verifies authenticity and confirms payment in seconds.', color: '#1591DC' },
                { num: '03', icon: Package, title: 'Earn a BalikBayan Box', body: 'Funds release instantly. A collectible NFT is minted — building trust and unlocking rewards.', color: '#4BB8FA' },
              ].map((step, idx) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
                  whileHover={{ y: -6 }}
                  className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] hover:shadow-xl hover:shadow-blue-50 transition-shadow"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${step.color}22, ${step.color}44)`, border: `1.5px solid ${step.color}33` }}
                  >
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <span className="text-xs font-bold text-[#64748B] mb-2">{step.num}</span>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-3">{step.title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* User Roles */}
        <section className="py-24 bg-gradient-to-b from-[#EFF6FF] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.4 }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <p className="text-xs font-bold text-[#1591DC] uppercase tracking-widest mb-3">For Everyone</p>
              <h2 className="text-4xl font-extrabold text-[#1E293B] tracking-tight">One platform. Every role.</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, label: 'OFW Sender', desc: 'Send remittances with full accountability.', features: ['Send with confidence', 'Track all promises', 'Earn collectibles'], cta: "I'm sending money", gradient: 'from-[#2C5EAD] to-[#1591DC]' },
                { icon: Heart, label: 'Family Receiver', desc: 'Receive funds transparently and earn rewards.', features: ['Confirm payments easily', 'Redeem merchant perks', 'Build loyalty tier'], cta: "I'm receiving money", gradient: 'from-[#1591DC] to-[#4BB8FA]' },
                { icon: Store, label: 'Merchant Partner', desc: 'Serve loyal families. Grow your business.', features: ['Scan & verify QR codes', 'Apply tiered discounts', 'Join loyalty ecosystem'], cta: 'Partner with us', gradient: 'from-[#4BB8FA] to-[#C4E2F5]' },
              ].map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl border border-[#E2E8F0] p-8 hover:shadow-2xl hover:shadow-blue-100 transition-shadow"
                >
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.08 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg mb-6`}
                  >
                    <card.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2">{card.label}</h3>
                  <p className="text-[#64748B] text-sm mb-6">{card.desc}</p>
                  <ul className="space-y-2 mb-8">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#1E293B]">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleConnect}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#EFF6FF] text-[#2C5EAD] font-bold text-sm hover:bg-[#C4E2F5] transition-colors"
                  >
                    {card.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* NFT Tier Showcase */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.4 }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <p className="text-xs font-bold text-[#1591DC] uppercase tracking-widest mb-3">Collectibles</p>
              <h2 className="text-4xl font-extrabold text-[#1E293B] tracking-tight">BalikBayan Box Tiers</h2>
              <p className="text-[#64748B] mt-3 max-w-xl mx-auto">Every fulfilled promise mints a collectible NFT. The more you send, the rarer your collection.</p>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-5">
              {TIER_SHOWCASE.map((t, idx) => (
                <motion.div
                  key={t.tier}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                  whileHover={{ y: -10, scale: 1.04 }}
                  className={`group relative w-44 rounded-3xl overflow-hidden border border-white/20 shadow-xl ${t.glow} cursor-pointer`}
                >
                  <div className={`h-36 bg-gradient-to-br ${t.bg} flex items-center justify-center relative`}>
                    <Package className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform" />
                    {t.tier === 'Legend' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-600/20 animate-pulse" />
                    )}
                  </div>
                  <div className="bg-white p-4">
                    <p className="font-extrabold text-[#1E293B] text-sm">{t.tier}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{t.boxes}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24 bg-gradient-to-br from-[#2C5EAD] to-[#1591DC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.4 }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-extrabold text-white tracking-tight">Trusted by OFWs worldwide</h2>
              <p className="text-blue-200 mt-3">Real numbers. Real families. Real impact.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'OFWs Served', value: '12,547', sub: 'And growing' },
                { label: 'Total Remittances Locked', value: '₱2.8B', sub: 'Secured on-chain' },
                { label: 'Partner Merchants', value: '348', sub: 'Across the Philippines' },
              ].map((s, idx) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
                  whileHover={{ y: -4 }}
                  className="text-center p-6 rounded-3xl bg-white/10 backdrop-blur border border-white/20"
                >
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-blue-100 text-sm font-semibold mt-1">{s.label}</p>
                  <p className="text-blue-200/70 text-xs mt-0.5">{s.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1E293B] text-slate-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2C5EAD] to-[#4BB8FA] flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-white text-lg">BalikBayan</span>
                </div>
                <p className="text-sm leading-relaxed">Every peso sent. Every sacrifice remembered.</p>
              </div>
              {[
                { title: 'Platform', links: ['How It Works', 'NFT Boxes', 'Merchant Partners'] },
                { title: 'Resources', links: ['Smart Contract', 'GitHub'] },
                { title: 'Legal', links: ['Terms of Service', 'Privacy Policy'] },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-white font-bold text-sm mb-4">{col.title}</p>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="text-sm hover:text-white transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm">© 2026 BalikBayan. Building financial accountability for OFW families.</p>
              <p className="text-sm">Built by Lito Cruz · Built on Stellar</p>
            </div>
          </div>
        </footer>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-4">Connect a Stellar Wallet</h2>

            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                <Package size={40} className="text-[#1591DC]" />
              </div>
              <p className="text-center text-[#64748B]">
                Choose from Freighter, xBull, Albedo, Rabet, Lobstr, or Hana to start using BalikBayan
              </p>
            </div>

            {walletError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                {walletError}
              </div>
            )}

            <div className="space-y-3">
              <Button className="w-full" loading={isConnecting} onClick={confirmConnect}>
                {isConnecting ? 'Connecting…' : 'Choose a Wallet'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowConnectModal(false)}>
                Cancel
              </Button>
            </div>

            <p className="text-xs text-[#64748B] text-center mt-4">
              Make sure your wallet is set to Testnet
            </p>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-semibold text-[#1E293B] mb-6 text-center">Who are you?</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setUserRole('ofw');
                  setShowRoleModal(false);
                }}
                className="p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#1591DC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B]">OFW Sender</h3>
                  <p className="text-sm text-[#64748B] text-center">I send money home</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setUserRole('family');
                  setShowRoleModal(false);
                }}
                className="p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#1591DC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B]">Family Receiver</h3>
                  <p className="text-sm text-[#64748B] text-center">I receive money from abroad</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setUserRole('merchant');
                  setShowRoleModal(false);
                }}
                className="p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#1591DC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store size={32} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-[#1E293B]">Merchant Partner</h3>
                  <p className="text-sm text-[#64748B] text-center">I offer perks to OFW families</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-6 w-full py-2 text-[#64748B] hover:text-[#1E293B]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
