"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

/* =============================================================
   암환자 혈액검사 관찰 체크리스트
   - Claude Design "MacroLens" 다크 테마 컴포넌트를 React로 이식
   - 좌측 사이드바 내비게이션 → 상단 메뉴바로 변경
   - localStorage('bloodchk-v1')에 체크/기록/메모 저장
   ============================================================= */

type Grade = "base" | "watch" | "caution"

interface Indicator {
  key: string
  kr: string
  en: string
  watch: string
  ref: string
  point: string
  grade: Grade
  flag?: boolean
}

interface ChecklistItem {
  id: string
  t: string
}

interface ChecklistGroup {
  id: string
  num: string
  title: string
  tag?: string
  note?: string
  items: ChecklistItem[]
}

interface Record {
  id: string
  date: string
  values: { [key: string]: number }
}

interface Memo {
  id: string
  text: string
  done: boolean
  ts: number
}

type View = "indicators" | "checklist" | "trends" | "memo"

const INDICATORS: Indicator[] = [
  { key: "WBC", kr: "백혈구", en: "WBC", watch: "감염·염증", ref: "4~10 (예시)", point: "'높은 정상'도 염증 신호일 수 있음", grade: "base" },
  { key: "HGB", kr: "헤모글로빈", en: "Hemoglobin", watch: "빈혈·산소운반", ref: "여성 12~14", point: "항암 중 저하 가능 · 철분제 임의 복용 주의", grade: "base" },
  { key: "PLT", kr: "혈소판", en: "Platelet", watch: "지혈·전신 상태", ref: "항암 중 100~200대", point: "급격한 변화 시 의료진과 상의", grade: "caution", flag: true },
  { key: "NLR", kr: "호중구:림프구", en: "NLR", watch: "면역 균형", ref: "개인차 큼", point: "감염(코로나·감기) 후 일시적 변동", grade: "base" },
  { key: "CRP", kr: "CRP", en: "CRP", watch: "급성 염증", ref: "검사지별 상이", point: "본인 참고범위 확인 필수", grade: "base" },
  { key: "ESR", kr: "ESR", en: "ESR", watch: "만성 염증", ref: "20 이하(예시)", point: "천천히 변함 · 항염 식이·생활 관리", grade: "watch" },
  { key: "GLU", kr: "공복혈당·당화혈색소", en: "Glucose · HbA1c", watch: "혈당 관리", ref: "HbA1c 5.7 미만", point: "운동 부족·과일 과다 시 상승", grade: "base" },
  { key: "LIP", kr: "중성지방·콜레스테롤", en: "TG · Cholesterol", watch: "대사·염증", ref: "중성지방 150 이하", point: "마른 사람도 관리 · 체중 변화 반영", grade: "base" },
  { key: "TP", kr: "총단백", en: "Total protein", watch: "영양 상태", ref: "6.5~8 (예시)", point: "영양 상태의 기본 지표", grade: "base" },
  { key: "LFT", kr: "GOT/GPT", en: "AST / ALT", watch: "간 기능", ref: "검사지별 상이", point: "보충제 복용 중 상승 시 제품 점검", grade: "base" },
  { key: "LDH", kr: "LDH", en: "LDH", watch: "세포 손상·종양 활동", ref: "병원별 상이(중간값)", point: "지속 상승 시 의료진과 상의", grade: "caution", flag: true },
  { key: "TSH", kr: "TSH", en: "TSH", watch: "갑상선", ref: "검사지별 상이", point: "항암 중 오르내림 관찰", grade: "base" },
  { key: "UPH", kr: "소변 pH", en: "Urine pH", watch: "대사 상태 참고", ref: "약산~중성", point: "변화 추세를 참고 지표로 관찰", grade: "watch" },
  { key: "TM", kr: "종양표지자", en: "Tumor markers", watch: "암종별 추적", ref: "암종에 따라 다름", point: "CEA·CA19-9·CA15-3·CA125·PSA 등", grade: "caution" },
]

const CHECKLIST: ChecklistGroup[] = [
  { id: "g1", num: "①", title: "감염·면역 상태", items: [
    { id: "c1", t: "백혈구가 높은 정상(8~10)에 걸쳐 있진 않은가" },
    { id: "c2", t: "헤모글로빈이 떨어지는 추세인가 (항암 중 주의)" },
    { id: "c3", t: "호중구:림프구 균형이 크게 무너지진 않았나" },
    { id: "c4", t: "최근 감염 이력(코로나·감기)이 있었나" },
  ]},
  { id: "g2", num: "②", title: "염증 지표", items: [
    { id: "c5", t: "CRP — 내 검사지 참고범위부터 확인" },
    { id: "c6", t: "ESR — 이전 대비 상승/하강 추세 확인" },
    { id: "c7", t: "염증 관리(식이·생활)를 꾸준히 하고 있나" },
  ]},
  { id: "g3", num: "③", title: "진행 감시", tag: "가장 중요", note: "→ 해당 시 다음 진료에서 반드시 상의", items: [
    { id: "c8", t: "혈소판의 급격한 변화가 있는가" },
    { id: "c9", t: "LDH가 지속적으로 상승하는가" },
    { id: "c10", t: "종양표지자가 오르는 추세인가" },
  ]},
  { id: "g4", num: "④", title: "대사·영양·간", items: [
    { id: "c11", t: "공복혈당·당화혈색소 상승 추세인가" },
    { id: "c12", t: "중성지방 150 이하, 콜레스테롤·LDL 관리" },
    { id: "c13", t: "총단백으로 영양 상태 확인" },
    { id: "c14", t: "GOT/GPT — 보충제 복용 중 상승 여부" },
    { id: "c15", t: "체중 변화가 혈당·지질에 반영되는가" },
  ]},
  { id: "g5", num: "⑤", title: "기타 추적", items: [
    { id: "c16", t: "TSH(갑상선) 항암 중 변동 관찰" },
    { id: "c17", t: "소변 pH 변화 추세 참고" },
  ]},
  { id: "g6", num: "⑥", title: "기록 습관", items: [
    { id: "c18", t: "검사 날짜와 수치를 표로 모아 두기" },
    { id: "c19", t: "모든 항목은 '이번 수치'가 아니라 '추세'로 판단" },
    { id: "c20", t: "궁금한 항목을 미리 적어 진료 때 질문하기" },
  ]},
]

const TOTAL_CHECKS = 20
const STORAGE_KEY = "bloodchk-v1"

/* ---------- helpers (DCLogic 이식) ---------- */
function today() {
  return new Date().toISOString().slice(0, 10)
}
function fmt(v: number | null | undefined) {
  if (v == null || isNaN(v)) return "—"
  return Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })
}
function shortDate(d: string) {
  const p = String(d).split("-")
  return p.length === 3 ? p[1] + "." + p[2] : d
}
function longDate(d: string) {
  const p = String(d).split("-")
  return p.length === 3 ? p[0] + ". " + p[1] + ". " + p[2] : d
}
function series(records: Record[], key: string) {
  return [...records]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((r) => ({ date: r.date, v: r.values[key] }))
    .filter((x) => x.v != null && !isNaN(x.v))
}
function spark(s: { v: number }[]) {
  const W = 72, H = 22, p = 3
  const vals = s.map((x) => x.v)
  let mn = Math.min(...vals), mx = Math.max(...vals)
  if (mn === mx) { mn -= 1; mx += 1 }
  return s
    .map((x, i) => {
      const cx = p + (i * (W - 2 * p)) / (s.length - 1)
      const cy = p + (H - 2 * p) * (1 - (x.v - mn) / (mx - mn))
      return cx.toFixed(1) + "," + cy.toFixed(1)
    })
    .join(" ")
}
function consecUp(records: Record[], key: string) {
  const s = series(records, key)
  let c = 0
  for (let i = s.length - 1; i > 0; i--) { if (s[i].v > s[i - 1].v) c++; else break }
  return { c, n: s.length }
}
function consecDown(records: Record[], key: string) {
  const s = series(records, key)
  let c = 0
  for (let i = s.length - 1; i > 0; i--) { if (s[i].v < s[i - 1].v) c++; else break }
  return { c, n: s.length }
}
function buildAi(records: Record[]) {
  if (!records.length)
    return { text: "아직 입력된 검사 기록이 없습니다. '추세' 탭에서 검사일별 수치를 입력하시면, 이곳에서 변화 추세를 요약해 드립니다.", isAlert: false, pill: "중립" }
  const alerts: string[] = []
  ;([["LDH", "LDH"], ["PLT", "혈소판"], ["TM", "종양표지자"]] as const).forEach(([k, nm]) => {
    const r = consecUp(records, k)
    if (r.n >= 2 && r.c >= 2) alerts.push(nm + "이(가) 최근 " + (r.c + 1) + "회 연속 상승했습니다.")
  })
  const hgb = consecDown(records, "HGB")
  if (hgb.n >= 2 && hgb.c >= 2) alerts.push("헤모글로빈이 " + (hgb.c + 1) + "회 연속 하락하고 있어 항암 중이라면 주의가 필요합니다.")
  if (alerts.length)
    return { text: alerts.join(" ") + " 다음 진료에서 담당 의료진과 함께 확인해 보시기를 권합니다.", isAlert: true, pill: "추세 주의" }
  return { text: "현재 기록된 수치에서 뚜렷한 추세 경보는 보이지 않습니다. 계속해서 검사값을 기록하며 변화를 관찰하세요.", isAlert: false, pill: "중립" }
}
interface ChartPt { cx: number; cy: number; labelY: number; val: string; date: string }
interface ChartTick { y: number; label: string }
interface Chart {
  hasData: boolean
  single?: boolean
  name: string
  en: string
  oneVal?: string
  poly?: string
  pts?: ChartPt[]
  ticks?: ChartTick[]
}
function buildChart(records: Record[], key: string): Chart {
  const ind = INDICATORS.find((i) => i.key === key) || ({ kr: "", en: "" } as Indicator)
  const s = series(records, key)
  if (!s.length) return { hasData: false, name: ind.kr, en: ind.en }
  if (s.length === 1) return { hasData: true, single: true, name: ind.kr, en: ind.en, oneVal: fmt(s[0].v) }
  const W = 640, H = 240, padL = 48, padR = 24, padT = 24, padB = 44
  const vals = s.map((x) => x.v)
  let mn = Math.min(...vals), mx = Math.max(...vals)
  if (mn === mx) { mn -= 1; mx += 1 }
  const pad = (mx - mn) * 0.15
  mn -= pad; mx += pad
  const xOf = (i: number) => padL + (i * (W - padL - padR)) / (s.length - 1)
  const yOf = (v: number) => padT + (H - padT - padB) * (1 - (v - mn) / (mx - mn))
  const pts: ChartPt[] = s.map((x, i) => {
    const cy = yOf(x.v)
    return { cx: +xOf(i).toFixed(1), cy: +cy.toFixed(1), labelY: +(cy - 10).toFixed(1), val: fmt(x.v), date: shortDate(x.date) }
  })
  const poly = pts.map((p) => p.cx + "," + p.cy).join(" ")
  const ticks: ChartTick[] = []
  for (let t = 4; t >= 0; t--) { const v = mn + ((mx - mn) * t) / 4; ticks.push({ y: +yOf(v).toFixed(1), label: fmt(v) }) }
  return { hasData: true, single: false, name: ind.kr, en: ind.en, poly, pts, ticks }
}

/* ---------- nav icons ---------- */
function NavIcon({ view }: { view: View }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  if (view === "indicators")
    return (<svg {...common}><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="14" y2="18" /></svg>)
  if (view === "checklist")
    return (<svg {...common}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>)
  if (view === "trends")
    return (<svg {...common}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>)
  return (<svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>)
}

const NAV: { view: View; label: string; title: string }[] = [
  { view: "indicators", label: "지표", title: "주요 지표" },
  { view: "checklist", label: "체크", title: "진료 전 체크" },
  { view: "trends", label: "추세", title: "추세 기록" },
  { view: "memo", label: "메모", title: "진료 메모" },
]

export default function BloodChecklistPage() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>("indicators")
  const [checks, setChecks] = useState<{ [id: string]: boolean }>({})
  const [records, setRecords] = useState<Record[]>([])
  const [memos, setMemos] = useState<Memo[]>([])
  const [trendKey, setTrendKey] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<{ date: string; values: { [k: string]: string } }>({ date: today(), values: {} })
  const [newMemo, setNewMemo] = useState("")

  // load from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        setChecks(s.checks || {})
        setRecords(s.records || [])
        setMemos(s.memos || [])
      }
    } catch (e) { /* ignore */ }
  }, [])

  // persist
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ checks, records, memos }))
    } catch (e) { /* ignore */ }
  }, [mounted, checks, records, memos])

  /* ---------- derived ---------- */
  const done = useMemo(
    () => CHECKLIST.reduce((sum, g) => sum + g.items.filter((it) => checks[it.id]).length, 0),
    [checks]
  )
  const pct = Math.round((done / TOTAL_CHECKS) * 100)
  const ai = useMemo(() => buildAi(records), [records])

  const indicatorRows = useMemo(
    () =>
      INDICATORS.map((ind) => {
        const s = series(records, ind.key)
        const has = s.length > 0
        const latest = has ? s[s.length - 1].v : null
        const prev = s.length >= 2 ? s[s.length - 2].v : null
        let deltaStr = "—"
        if (prev != null && latest != null) {
          const diff = latest - prev
          const dir = diff > 0 ? "↑" : diff < 0 ? "↓" : "↔"
          const pctv = prev !== 0 ? Math.abs((diff / prev) * 100) : 0
          deltaStr = dir + " " + pctv.toFixed(1) + "%"
        } else if (has) deltaStr = "1회 기록"
        return {
          ...ind,
          latestStr: has ? fmt(latest) : "—",
          deltaStr,
          spark: s.length >= 2 ? spark(s) : null,
        }
      }),
    [records]
  )

  const avail = useMemo(() => INDICATORS.filter((i) => series(records, i.key).length >= 1), [records])
  const chartKey = trendKey && avail.find((i) => i.key === trendKey) ? trendKey : avail[0] ? avail[0].key : null
  const chart: Chart = chartKey ? buildChart(records, chartKey) : { hasData: false, name: "", en: "" }
  const chips = avail.map((i) => ({ key: i.key, kr: i.kr, active: i.key === chartKey }))

  const recordsView = useMemo(
    () =>
      [...records]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((r) => ({
          id: r.id,
          dateStr: longDate(r.date),
          cells: INDICATORS.filter((i) => r.values[i.key] != null).map((i) => ({ kr: i.kr, val: fmt(r.values[i.key]) })),
        })),
    [records]
  )

  const memosView = useMemo(() => [...memos].sort((a, b) => b.ts - a.ts), [memos])

  /* ---------- actions ---------- */
  const toggleCheck = (id: string) => setChecks((c) => ({ ...c, [id]: !c[id] }))
  const openTrend = (key: string) => { setTrendKey(key); setView("trends") }
  const toggleForm = () => { setShowForm((v) => !v); setDraft({ date: today(), values: {} }) }
  const saveRecord = () => {
    const values: { [k: string]: number } = {}
    for (const k in draft.values) { const n = parseFloat(draft.values[k]); if (!isNaN(n)) values[k] = n }
    if (!Object.keys(values).length) { setShowForm(false); return }
    const rec: Record = { id: "r" + Date.now(), date: draft.date || today(), values }
    setRecords((rs) => [...rs, rec])
    setShowForm(false)
    setDraft({ date: today(), values: {} })
  }
  const deleteRecord = (id: string) => setRecords((rs) => rs.filter((r) => r.id !== id))
  const addMemo = () => {
    const t = newMemo.trim()
    if (!t) return
    setMemos((ms) => [...ms, { id: "m" + Date.now(), text: t, done: false, ts: Date.now() }])
    setNewMemo("")
  }
  const toggleMemo = (id: string) => setMemos((ms) => ms.map((m) => (m.id === id ? { ...m, done: !m.done } : m)))
  const deleteMemo = (id: string) => setMemos((ms) => ms.filter((m) => m.id !== id))

  const gradePill = (g: Grade) => {
    if (g === "caution") return { bg: "var(--gold-soft)", color: "var(--gold)", label: "추세 주의" }
    if (g === "watch") return { bg: "var(--info-soft)", color: "var(--info)", label: "추세 관찰" }
    return { bg: "var(--neutral-soft)", color: "var(--fg-2)", label: "기본 관찰" }
  }

  return (
    <div className="bc-root">
      <style>{CSS}</style>

      {/* ============ 상단 메뉴바 ============ */}
      <div className="bc-topbar">
        <Link href="/" className="bc-brand" title="옆집나약사 홈으로">
          <span className="bc-logo"><span className="bc-logo-dot" /></span>
          <span className="bc-brand-name">옆집나약사</span>
        </Link>
        <nav className="bc-nav" aria-label="혈액검사 체크리스트 메뉴">
          {NAV.map((n) => (
            <button
              key={n.view}
              className={"bc-nav-btn" + (view === n.view ? " active" : "")}
              onClick={() => setView(n.view)}
              title={n.title}
            >
              <NavIcon view={n.view} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="bc-topbar-prog">
          <span className="bc-topbar-prog-label">진료 전 체크</span>
          <span className="bc-mono">{done}<span style={{ color: "var(--fg-3)" }}>/{TOTAL_CHECKS}</span></span>
        </div>
      </div>

      {/* ============ 본문 ============ */}
      <div className="bc-main">
        <div className="bc-container">
          <header className="bc-header">
            <div>
              <div className="bc-title">암환자 혈액검사 관찰 체크리스트</div>
              <div className="bc-subtitle">
                <span className="bc-dot-live" />
                <span>옆집나약사 · <a href="https://cancerwith.kr" target="_blank" rel="noopener noreferrer">cancerwith.kr</a> · 약사가 함께 확인하는 건강 정보</span>
              </div>
            </div>
            <div className="bc-header-prog">
              <div className="bc-header-prog-label">진료 전 체크</div>
              <div className="bc-header-prog-num bc-mono">{done}<span style={{ color: "var(--fg-3)" }}>/{TOTAL_CHECKS}</span></div>
            </div>
          </header>

          {/* ============ VIEW: INDICATORS ============ */}
          {view === "indicators" && (
            <div>
              <p className="bc-lead">혈액검사는 단일 수치보다 시간에 따른 변화(추세)를 보는 것이 핵심입니다. 아래 항목을 검사지와 나란히 놓고, 이전 검사와 비교하며 체크해 보세요. 수치의 참고범위(정상범위)는 병원·검사기관마다 다르므로 반드시 본인 검사지 기준으로 확인합니다.</p>

              {/* AI 관찰 요약 */}
              <div className="bc-card" style={{ borderLeft: `3px solid ${ai.isAlert ? "var(--ai-orange)" : "var(--bull)"}`, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: "var(--fs-small)", fontWeight: 600, color: "var(--fg-1)", letterSpacing: "0.02em" }}>AI 관찰 요약</span>
                  <span
                    className="bc-pill"
                    style={{ background: ai.isAlert ? "var(--gold-soft)" : "var(--neutral-soft)", color: ai.isAlert ? "var(--gold)" : "var(--fg-2)" }}
                  >
                    {ai.pill}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)", color: "var(--fg-2)" }}>{ai.text}</p>
                <p style={{ margin: "10px 0 0", fontSize: "var(--fs-micro)", lineHeight: "var(--lh-micro)", color: "var(--fg-4)" }}>추세 요약은 입력한 기록만으로 만든 참고용 안내이며, 의학적 판단이 아닙니다.</p>
              </div>

              <div className="bc-section-label">A · 주요 지표 한눈에 보기 <span style={{ color: "var(--fg-4)" }}>— 행을 누르면 추세 그래프로 이동</span></div>

              <div className="bc-card" style={{ padding: 0, overflowX: "auto" }}>
                <table className="bc-table">
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>지표</th>
                      <th className="bc-th-hide" style={{ whiteSpace: "nowrap" }}>무엇을 보나</th>
                      <th style={{ whiteSpace: "nowrap" }}>참고 기준(예시)</th>
                      <th>관찰 포인트</th>
                      <th style={{ whiteSpace: "nowrap" }}>최근값 · 추세</th>
                      <th style={{ whiteSpace: "nowrap" }}>관찰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicatorRows.map((ind) => {
                      const pill = gradePill(ind.grade)
                      return (
                        <tr key={ind.key} className="bc-row" onClick={() => openTrend(ind.key)} style={{ cursor: "pointer" }}>
                          <td style={{ verticalAlign: "top", whiteSpace: "nowrap" }}>
                            <div style={{ fontWeight: 500, color: "var(--fg-1)" }}>
                              {ind.flag && <span style={{ color: "var(--gold)" }}>⚑ </span>}{ind.kr}
                            </div>
                            <div className="bc-mono" style={{ fontSize: "var(--fs-micro)", color: "var(--fg-3)", letterSpacing: "0.02em" }}>{ind.en}</div>
                          </td>
                          <td className="bc-th-hide" style={{ verticalAlign: "top", color: "var(--fg-2)", fontSize: "var(--fs-small)", whiteSpace: "nowrap" }}>{ind.watch}</td>
                          <td style={{ verticalAlign: "top", color: "var(--fg-2)", fontSize: "var(--fs-small)" }}>{ind.ref}</td>
                          <td style={{ verticalAlign: "top", color: "var(--fg-3)", fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)", minWidth: 180 }}>{ind.point}</td>
                          <td style={{ verticalAlign: "top", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span className="bc-mono" style={{ fontWeight: 500, color: "var(--fg-1)" }}>{ind.latestStr}</span>
                              {ind.spark && (
                                <svg width="72" height="22" viewBox="0 0 72 22" style={{ display: "block" }}>
                                  <polyline points={ind.spark} fill="none" stroke="var(--info)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div className="bc-mono" style={{ fontSize: "var(--fs-micro)", color: "var(--fg-3)", marginTop: 3 }}>{ind.deltaStr}</div>
                          </td>
                          <td style={{ verticalAlign: "top", whiteSpace: "nowrap" }}>
                            <span className="bc-pill" style={{ background: pill.bg, color: pill.color }}>{pill.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bc-card" style={{ background: "var(--gold-soft)", marginTop: 16 }}>
                <div style={{ fontSize: "var(--fs-small)", fontWeight: 600, color: "var(--gold)", marginBottom: 4 }}>특히 &apos;추세&apos;로 눈여겨볼 지표</div>
                <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: "var(--lh-body)", color: "var(--fg-2)" }}>혈소판 · ESR · LDH · 소변 pH · (해당 암종의) 종양표지자. 이 항목들이 이전보다 뚜렷하게, 지속적으로 변할 때는 다음 진료에서 꼭 의료진과 함께 확인하세요.</p>
              </div>
            </div>
          )}

          {/* ============ VIEW: CHECKLIST ============ */}
          {view === "checklist" && (
            <div>
              <div className="bc-section-label" style={{ marginBottom: 10 }}>B · 진료 전 체크리스트</div>
              <div className="bc-card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--fg-2)" }}>전체 진행률</span>
                  <span className="bc-mono" style={{ fontSize: "var(--fs-small)", color: "var(--fg-1)" }}>{done} / {TOTAL_CHECKS}</span>
                </div>
                <div style={{ height: 6, background: "var(--bg-surface-lo)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--bull)", borderRadius: 999, width: pct + "%", transition: "width var(--dur-base) var(--ease-out)" }} />
                </div>
              </div>

              <div className="bc-check-grid">
                {CHECKLIST.map((g) => {
                  const gd = g.items.filter((it) => checks[it.id]).length
                  return (
                    <div key={g.id} className="bc-card">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span className="bc-mono" style={{ color: "var(--bull)", fontWeight: 600 }}>{g.num}</span>
                        <span style={{ fontSize: "var(--fs-h2)", fontWeight: 500, color: "var(--fg-1)" }}>{g.title}</span>
                        {g.tag && <span className="bc-tag">{g.tag}</span>}
                        <span className="bc-mono" style={{ marginLeft: "auto", fontSize: "var(--fs-small)", color: "var(--fg-3)" }}>{gd}/{g.items.length}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {g.items.map((it) => {
                          const checked = !!checks[it.id]
                          return (
                            <div key={it.id} className="bc-check-item" onClick={() => toggleCheck(it.id)}>
                              {checked ? (
                                <span className="bc-checkbox checked">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                </span>
                              ) : (
                                <span className="bc-checkbox" />
                              )}
                              <span style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)", color: checked ? "var(--fg-3)" : "var(--fg-2)" }}>{it.t}</span>
                            </div>
                          )
                        })}
                      </div>
                      {g.note && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--divider)", fontSize: "var(--fs-small)", color: "var(--ai-orange)" }}>{g.note}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ============ VIEW: TRENDS ============ */}
          {view === "trends" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <div className="bc-section-label">추세 기록 — 검사일별 수치 입력 · 비교</div>
                <button onClick={toggleForm} className="bc-btn-primary">{showForm ? "✕ 닫기" : "＋ 검사 기록 추가"}</button>
              </div>

              {/* Add record form */}
              {showForm && (
                <div className="bc-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <label style={{ fontSize: "var(--fs-small)", color: "var(--fg-2)" }}>검사일</label>
                    <input
                      type="date"
                      className="bc-input bc-mono"
                      value={draft.date}
                      onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                      style={{ width: "auto" }}
                    />
                    <span style={{ fontSize: "var(--fs-micro)", color: "var(--fg-4)" }}>해당하는 지표만 입력하면 됩니다 · 본인 검사지 수치 기준</span>
                  </div>
                  <div className="bc-draft-grid">
                    {INDICATORS.map((i) => (
                      <div key={i.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: "var(--fs-small)", color: "var(--fg-2)" }}>
                          {i.kr} <span className="bc-mono" style={{ fontSize: "var(--fs-micro)", color: "var(--fg-4)" }}>{i.en}</span>
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          className="bc-input bc-mono"
                          value={draft.values[i.key] ?? ""}
                          placeholder={i.ref}
                          onChange={(e) => { const v = e.target.value; setDraft((d) => ({ ...d, values: { ...d.values, [i.key]: v } })) }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button onClick={saveRecord} className="bc-btn-primary">저장</button>
                    <button onClick={toggleForm} className="bc-btn-ghost">취소</button>
                  </div>
                </div>
              )}

              {/* Chart */}
              {avail.length > 0 && (
                <div className="bc-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {chips.map((chip) => (
                      <button
                        key={chip.key}
                        onClick={() => setTrendKey(chip.key)}
                        className="bc-chip"
                        style={{
                          borderColor: chip.active ? "var(--bull)" : "var(--border)",
                          color: chip.active ? "var(--bull)" : "var(--fg-2)",
                        }}
                      >
                        {chip.kr}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: "var(--fs-h2)", fontWeight: 500, color: "var(--fg-1)" }}>{chart.name}</span>
                    <span className="bc-mono" style={{ fontSize: "var(--fs-micro)", color: "var(--fg-3)" }}>{chart.en}</span>
                  </div>
                  {chart.hasData && !chart.single && (
                    <svg viewBox="0 0 640 240" style={{ width: "100%", height: "auto", display: "block" }}>
                      {chart.ticks!.map((tk, idx) => (
                        <g key={idx}>
                          <line x1="48" x2="616" y1={tk.y} y2={tk.y} stroke="var(--divider)" strokeWidth="1" />
                          <text x="42" y={tk.y} textAnchor="end" dominantBaseline="middle" fill="#6B7691" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{tk.label}</text>
                        </g>
                      ))}
                      <polyline points={chart.poly} fill="none" stroke="var(--info)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {chart.pts!.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.cx} cy={p.cy} r="4" fill="var(--bg-surface)" stroke="var(--info)" strokeWidth="2" />
                          <text x={p.cx} y={p.labelY} textAnchor="middle" fill="#E8ECF4" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{p.val}</text>
                          <text x={p.cx} y="230" textAnchor="middle" fill="#6B7691" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{p.date}</text>
                        </g>
                      ))}
                    </svg>
                  )}
                  {chart.hasData && chart.single && (
                    <p style={{ margin: "8px 0", fontSize: "var(--fs-small)", color: "var(--fg-3)" }}>기록이 1회뿐입니다 — 2회 이상 입력하면 추세선이 그려집니다. (현재 값: <span className="bc-mono" style={{ color: "var(--fg-1)" }}>{chart.oneVal}</span>)</p>
                  )}
                </div>
              )}

              {avail.length === 0 && (
                <div className="bc-empty" style={{ marginBottom: 16 }}>
                  <p style={{ margin: 0, color: "var(--fg-3)", fontSize: "var(--fs-body)" }}>아직 기록이 없습니다. 위 <span style={{ color: "var(--bull)" }}>＋ 검사 기록 추가</span>를 눌러 첫 검사일의 수치를 입력해 보세요.</p>
                </div>
              )}

              {/* Records list */}
              {records.length > 0 && (
                <>
                  <div className="bc-section-label" style={{ marginBottom: 8 }}>검사일별 기록</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recordsView.map((rec) => (
                      <div key={rec.id} className="bc-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span className="bc-mono" style={{ fontWeight: 500, color: "var(--fg-1)" }}>{rec.dateStr}</span>
                          <button onClick={() => deleteRecord(rec.id)} className="bc-del">삭제</button>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {rec.cells.map((c, idx) => (
                            <span key={idx} style={{ display: "inline-flex", alignItems: "baseline", gap: 6, padding: "5px 10px", borderRadius: "var(--r-input)", background: "var(--bg-surface-lo)", border: "1px solid var(--divider)" }}>
                              <span style={{ fontSize: "var(--fs-micro)", color: "var(--fg-3)" }}>{c.kr}</span>
                              <span className="bc-mono" style={{ fontSize: "var(--fs-small)", color: "var(--fg-1)" }}>{c.val}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============ VIEW: MEMO ============ */}
          {view === "memo" && (
            <div>
              <div className="bc-section-label" style={{ marginBottom: 10 }}>진료 메모 — 다음 진료 때 물어볼 것을 미리 적어 두세요</div>
              <div className="bc-card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    className="bc-input"
                    style={{ flex: 1, height: 38 }}
                    value={newMemo}
                    onChange={(e) => setNewMemo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addMemo() }}
                    placeholder="예: LDH가 지난 검사보다 올랐는데 괜찮은지 여쭤보기"
                  />
                  <button onClick={addMemo} className="bc-btn-primary" style={{ height: 38 }}>추가</button>
                </div>
              </div>

              {memosView.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {memosView.map((m) => (
                    <div key={m.id} className="bc-card" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px var(--sp-pad)" }}>
                      <span onClick={() => toggleMemo(m.id)} style={{ cursor: "pointer", flex: "none", marginTop: 1 }}>
                        {m.done ? (
                          <span className="bc-checkbox checked">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          </span>
                        ) : (
                          <span className="bc-checkbox" />
                        )}
                      </span>
                      <span style={{ flex: 1, fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)", color: m.done ? "var(--fg-4)" : "var(--fg-2)", textDecoration: m.done ? "line-through" : "none" }}>{m.text}</span>
                      <button onClick={() => deleteMemo(m.id)} className="bc-del" style={{ flex: "none" }}>삭제</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bc-empty">
                  <p style={{ margin: 0, color: "var(--fg-3)", fontSize: "var(--fs-body)" }}>아직 메모가 없습니다. 궁금한 항목을 적어 진료 때 질문해 보세요.</p>
                </div>
              )}
            </div>
          )}

          {/* ============ TAGLINE + DISCLAIMER ============ */}
          <div style={{ marginTop: 24, padding: "14px 16px", background: "var(--bull-soft)", borderRadius: "var(--r-card)", textAlign: "center" }}>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--fg-1)", fontWeight: 500 }}>내 검사 수치, 하나가 아니라 &apos;추세&apos;로 함께 봐요</span>
          </div>

          <footer style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 8px", fontSize: "var(--fs-micro)", lineHeight: "var(--lh-micro)", color: "var(--fg-3)" }}>안내 · 이 자료는 혈액검사를 이해하고 진료 때 질문거리를 준비하는 데 도움을 주기 위한 참고용 교육 자료입니다. 수치의 실제 해석과 치료 방향 결정은 담당 의료진의 몫이며, 여기 적힌 기준값은 예시로 검사기관마다 다릅니다. 특정 수치가 걱정된다면 자가 판단이나 보충제 임의 복용 대신 담당 의료진과 상의하세요. 빈혈·철분제 등 보충제는 원인에 따라 복용 여부가 달라질 수 있어 전문가 상담이 필요합니다.</p>
            <p style={{ margin: 0, fontSize: "var(--fs-micro)", lineHeight: "var(--lh-micro)", color: "var(--fg-4)" }}>© 옆집나약사 (cancerwith.kr) · 약사가 함께 확인하는 건강 정보 · 교육용 배포 자료</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

const CSS = `
.bc-root {
  --bg-base:#0A0E1A; --bg-surface:#131826; --bg-surface-hi:#1A2030; --bg-surface-lo:#0E1320;
  --border:#252D3F; --border-hi:#2F3A52; --divider:#1C2336;
  --fg-1:#FFFFFF; --fg-2:#B8C0D0; --fg-3:#6B7691; --fg-4:#4A5470;
  --bull:#00D89C; --bull-soft:rgba(0,216,156,0.12); --bear:#FF4D6D; --bear-soft:rgba(255,77,109,0.12);
  --gold:#FFB800; --gold-soft:rgba(255,184,0,0.12); --ai-orange:#FF6000; --ai-orange-soft:rgba(255,96,0,0.12);
  --info:#4A9EFF; --info-soft:rgba(74,158,255,0.12); --neutral:#6B7691; --neutral-soft:rgba(107,118,145,0.12);
  --font-kr:'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;
  --font-mono:'JetBrains Mono','SF Mono',Menlo,Consolas,monospace;
  --fs-h1:24px; --lh-h1:32px; --fs-h2:18px; --lh-h2:24px; --fs-body:14px; --lh-body:20px;
  --fs-small:12px; --lh-small:16px; --fs-micro:11px; --lh-micro:14px;
  --r-card:12px; --r-input:6px; --r-pill:999px; --sp-pad:14px;
  --dur-base:200ms; --ease-out:cubic-bezier(0.4,0,0.2,1);
  background: var(--bg-base);
  color: var(--fg-2);
  font-family: var(--font-kr);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  min-height: 100vh;
}
.bc-root * { box-sizing: border-box; }
.bc-root a { color: var(--info); text-decoration: none; }
.bc-root a:hover { color: #7db6ff; }
.bc-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

@keyframes bc-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
.bc-dot-live { width:8px; height:8px; border-radius:999px; background:var(--bull); animation:bc-pulse 1.5s ease-in-out infinite; display:inline-block; }

/* ===== 상단 메뉴바 ===== */
.bc-topbar {
  position: sticky; top: 64px; z-index: 40;
  display: flex; align-items: center; gap: 12px;
  height: 56px; padding: 0 16px;
  background: rgba(19,24,38,0.92); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.bc-brand { display: flex; align-items: center; gap: 8px; flex: none; }
.bc-brand-name { font-size: var(--fs-body); font-weight: 600; color: var(--fg-1); white-space: nowrap; }
.bc-logo { width:32px; height:32px; border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; }
.bc-logo-dot { width:11px; height:11px; border-radius:999px; background:var(--bull); display:block; }
.bc-nav { display: flex; align-items: center; gap: 4px; margin: 0 auto; overflow-x: auto; scrollbar-width: none; }
.bc-nav::-webkit-scrollbar { display: none; }
.bc-nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 38px; padding: 0 14px; border: none; border-radius: var(--r-input);
  background: none; color: var(--fg-3); cursor: pointer;
  font-family: var(--font-kr); font-size: var(--fs-body); font-weight: 500; white-space: nowrap;
  transition: color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
}
.bc-nav-btn:hover { color: var(--fg-2); background: var(--bg-surface-hi); }
.bc-nav-btn.active { color: var(--bull); background: var(--bull-soft); }
.bc-topbar-prog { display: flex; align-items: center; gap: 8px; flex: none; }
.bc-topbar-prog-label { font-size: var(--fs-micro); color: var(--fg-3); }
.bc-topbar-prog .bc-mono { font-size: var(--fs-h2); font-weight: 600; color: var(--fg-1); }

/* ===== 본문 ===== */
.bc-main { min-height: calc(100vh - 120px); }
.bc-container { max-width: 1200px; margin: 0 auto; padding: 16px; }
.bc-header {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;
  padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 16px;
}
.bc-title { font-size: var(--fs-h1); line-height: var(--lh-h1); font-weight: 600; color: var(--fg-1); letter-spacing: -0.005em; }
.bc-subtitle { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: var(--fs-small); color: var(--fg-3); }
.bc-header-prog { text-align: right; }
.bc-header-prog-label { font-size: var(--fs-micro); color: var(--fg-3); letter-spacing: 0.02em; }
.bc-header-prog-num { font-size: var(--fs-h2); font-weight: 600; color: var(--fg-1); margin-top: 2px; }
.bc-lead { font-size: var(--fs-body); color: var(--fg-2); max-width: 820px; margin: 0 0 16px; }
.bc-section-label { font-size: var(--fs-small); font-weight: 500; color: var(--fg-3); letter-spacing: 0.02em; margin-bottom: 8px; }

.bc-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--r-card); padding: var(--sp-pad); }
.bc-pill { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: var(--r-pill); font-size: var(--fs-small); font-weight: 500; line-height: 1; white-space: nowrap; }
.bc-tag { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: var(--r-pill); font-size: var(--fs-micro); font-weight: 500; background: var(--gold-soft); color: var(--gold); }

/* ===== table ===== */
.bc-table { width: 100%; border-collapse: collapse; min-width: 720px; }
.bc-table th { text-align: left; padding: 10px 12px; font-size: var(--fs-small); font-weight: 500; color: var(--fg-3); border-bottom: 1px solid var(--border); }
.bc-table td { padding: 11px 12px; border-bottom: 1px solid var(--divider); }
.bc-row:hover { background: var(--bg-surface-hi); }

/* ===== checklist ===== */
.bc-check-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.bc-check-item { display: flex; align-items: flex-start; gap: 10px; padding: 7px 6px; border-radius: var(--r-input); cursor: pointer; }
.bc-check-item:hover { background: var(--bg-surface-hi); }
.bc-checkbox { flex: none; width: 18px; height: 18px; border-radius: 5px; border: 1px solid var(--border-hi); margin-top: 1px; display: flex; align-items: center; justify-content: center; }
.bc-checkbox.checked { background: var(--bull); border-color: var(--bull); }

/* ===== trends ===== */
.bc-draft-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
.bc-input { height: 34px; padding: 0 10px; border-radius: var(--r-input); border: 1px solid var(--border); background: var(--bg-surface-lo); color: var(--fg-1); font-family: var(--font-kr); font-size: var(--fs-small); width: 100%; }
.bc-input:focus { outline: none; border-color: var(--info); }
.bc-btn-primary { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 16px; border-radius: var(--r-input); border: none; background: var(--bull); color: #0A0E1A; font-family: var(--font-kr); font-size: var(--fs-small); font-weight: 600; cursor: pointer; }
.bc-btn-ghost { height: 34px; padding: 0 16px; border-radius: var(--r-input); border: 1px solid var(--border); background: none; color: var(--fg-2); font-family: var(--font-kr); font-size: var(--fs-small); cursor: pointer; }
.bc-chip { height: 28px; padding: 0 12px; border-radius: var(--r-pill); border: 1px solid var(--border); background: none; font-family: var(--font-kr); font-size: var(--fs-small); font-weight: 500; cursor: pointer; }
.bc-del { background: none; border: none; color: var(--fg-4); font-family: var(--font-kr); font-size: var(--fs-small); cursor: pointer; }
.bc-del:hover { color: var(--bear); }
.bc-empty { background: var(--bg-surface); border: 1px dashed var(--border-hi); border-radius: var(--r-card); padding: 32px 16px; text-align: center; }

@media (max-width: 768px) {
  .bc-topbar { top: 0; }
  .bc-brand-name, .bc-topbar-prog { display: none; }
  .bc-nav-btn { padding: 0 12px; }
  .bc-th-hide { display: none !important; }
}
`
