"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatCurrency } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CreditCard,
  Trash2,
  X,
  Check,
  ShoppingBag,
  Car,
  Gamepad2,
  Zap,
  Home,
  Heart,
  GraduationCap,
  Shirt,
  Gift,
  Briefcase,
  Laptop,
  Coffee,
  Bus,
  Film,
  Wifi,
  Stethoscope,
  BookOpen,
  PawPrint,
  MoreHorizontal,
} from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

interface CreditCardSpend {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

const INCOME_QUICK = [
  { cat: "Sueldo", icon: Briefcase, amount: 4500000, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { cat: "Freelance", icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10" },
  { cat: "Venta", icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10" },
  { cat: "Regalo", icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
  { cat: "Reembolso", icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
  { cat: "Otro ingreso", icon: Plus, color: "text-cyan-500", bg: "bg-cyan-500/10" },
]

const EXPENSE_QUICK = [
  { cat: "Comida", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10" },
  { cat: "Transporte", icon: Bus, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { cat: "Servicios", icon: Wifi, color: "text-sky-500", bg: "bg-sky-500/10" },
  { cat: "Salud", icon: Stethoscope, color: "text-red-500", bg: "bg-red-500/10" },
  { cat: "Otro gasto", icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-500/10" },
]

const EXPENSE_ALL = [
  { cat: "Comida", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10" },
  { cat: "Transporte", icon: Bus, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { cat: "Entretenimiento", icon: Film, color: "text-pink-500", bg: "bg-pink-500/10" },
  { cat: "Servicios", icon: Wifi, color: "text-sky-500", bg: "bg-sky-500/10" },
  { cat: "Vivienda", icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { cat: "Salud", icon: Stethoscope, color: "text-red-500", bg: "bg-red-500/10" },
  { cat: "Ropa", icon: Shirt, color: "text-violet-500", bg: "bg-violet-500/10" },
  { cat: "Educación", icon: BookOpen, color: "text-teal-500", bg: "bg-teal-500/10" },
  { cat: "Mascotas", icon: PawPrint, color: "text-rose-500", bg: "bg-rose-500/10" },
  { cat: "Otro gasto", icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-500/10" },
]

const CREDIT_QUICK = [
  { cat: "Comida", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10" },
  { cat: "Transporte", icon: Car, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { cat: "Compras", icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10" },
  { cat: "Entretenimiento", icon: Gamepad2, color: "text-pink-500", bg: "bg-pink-500/10" },
  { cat: "Servicios", icon: Zap, color: "text-sky-500", bg: "bg-sky-500/10" },
  { cat: "Salud", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  { cat: "Otro", icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-500/10" },
]

function getMonthPeriod(): { start: string; end: string; label: string; shortLabel: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  let startMonth = month
  let startYear = year
  if (day < 27) {
    startMonth = month - 1
    if (startMonth < 0) { startMonth = 11; startYear = year - 1 }
  }

  const endMonth = startMonth + 1
  let endYear = startYear
  let actualEndMonth = endMonth
  if (endMonth > 11) { actualEndMonth = 0; endYear = startYear + 1 }

  const start = `${startYear}-${String(startMonth + 1).padStart(2, "0")}-27`
  const lastDay = new Date(endYear, actualEndMonth + 1, 0).getDate()
  const endDay = 26 > lastDay ? lastDay : 26
  const end = `${endYear}-${String(actualEndMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`

  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  const shortMonths = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  const label = `${months[startMonth]} 27 - ${months[actualEndMonth]} 26`
  const shortLabel = `${shortMonths[startMonth]} 27 - ${shortMonths[actualEndMonth]} 26`

  return { start, end, label, shortLabel }
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creditSpends, setCreditSpends] = useState<CreditCardSpend[]>([])
  const [mounted, setMounted] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"tx" | "credit">("tx")
  const [activeTab, setActiveTab] = useState<"home" | "history" | "credit">("home")

  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<"income" | "expense">("expense")
  const [formAmount, setFormAmount] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formDesc, setFormDesc] = useState("")

  const [showCreditForm, setShowCreditForm] = useState(false)
  const [crAmount, setCrAmount] = useState("")
  const [crCategory, setCrCategory] = useState("")
  const [crDesc, setCrDesc] = useState("")

  useEffect(() => {
    const savedTx = localStorage.getItem("lifeos_transactions")
    const savedCr = localStorage.getItem("lifeos_credit")
    if (savedTx) setTransactions(JSON.parse(savedTx))
    if (savedCr) setCreditSpends(JSON.parse(savedCr))
    setMounted(true)
  }, [])

  useEffect(() => { if (mounted) localStorage.setItem("lifeos_transactions", JSON.stringify(transactions)) }, [transactions, mounted])
  useEffect(() => { if (mounted) localStorage.setItem("lifeos_credit", JSON.stringify(creditSpends)) }, [creditSpends, mounted])

  const period = getMonthPeriod()
  const today = new Date().toISOString().split("T")[0]

  const monthTx = transactions.filter((t) => t.date >= period.start && t.date <= period.end)
  const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const monthExpenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const balance = monthIncome - monthExpenses

  const monthCredit = creditSpends.filter((c) => c.date >= period.start && c.date <= period.end)
  const creditTotal = monthCredit.reduce((s, c) => s + c.amount, 0)

  const sortedTx = [...monthTx].sort((a, b) => b.date.localeCompare(a.date))
  const sortedCredit = [...monthCredit].sort((a, b) => b.date.localeCompare(a.date))

  function openForm(type: "income" | "expense", cat: string, amount?: number) {
    setFormType(type)
    setFormCategory(cat)
    setFormAmount(amount ? String(amount) : "")
    setFormDesc("")
    setShowForm(true)
  }

  function submitForm() {
    const amount = parseInt(formAmount)
    if (!amount || !formCategory) return
    const tx: Transaction = { id: generateId(), type: formType, amount, category: formCategory, description: formDesc || formCategory, date: today }
    setTransactions((prev) => [tx, ...prev])
    setToastMsg(formType === "income" ? "Ingreso registrado" : "Gasto registrado")
    setTimeout(() => setToastMsg(null), 2000)
    setShowForm(false)
  }

  function submitCredit() {
    const amount = parseInt(crAmount)
    if (!amount || !crCategory) return
    const cs: CreditCardSpend = { id: generateId(), amount, category: crCategory, description: crDesc || crCategory, date: today }
    setCreditSpends((prev) => [cs, ...prev])
    setToastMsg("Gasto de tarjeta registrado")
    setTimeout(() => setToastMsg(null), 2000)
    setShowCreditForm(false)
  }

  function openCreditForm(cat: string) {
    setCrCategory(cat)
    setCrAmount("")
    setCrDesc("")
    setShowCreditForm(true)
  }

  function deleteTx(id: string) { setDeleteConfirm(id); setDeleteType("tx") }
  function deleteCr(id: string) { setDeleteConfirm(id); setDeleteType("credit") }

  return (
    <motion.div 
      className="space-y-8 overflow-x-hidden"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1">Finanzas</h2>
          <p className="text-base text-muted-foreground">{period.label}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border border-primary/10 shadow-sm">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-semibold">Saldo disponible</p>
          <p className={cn("text-5xl font-extrabold tracking-tight mt-2", balance >= 0 ? "text-emerald-500" : "text-red-500")}>
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">{period.shortLabel}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Ingresos", value: monthIncome, icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Gastos", value: monthExpenses, icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Ahorrado", value: balance > 0 ? balance : 0, icon: PiggyBank, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={cn("rounded-2xl p-3 text-center border border-transparent min-w-0", s.bg)}>
                <Icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">{s.label}</p>
                <p className={cn("text-sm font-bold mt-0.5", s.color)}>{formatCurrency(s.value)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-1.5 bg-muted/50 rounded-2xl p-1">
        {[
          { id: "home" as const, label: "Inicio" },
          { id: "history" as const, label: "Historial" },
          { id: "credit" as const, label: "T. Crédito" },
        ].map((tab) => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all",
              activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "home" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-[2rem]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold">Ingresos</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {INCOME_QUICK.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.cat}
                    onClick={() => openForm("income", item.cat, item.amount)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-border/50 p-3.5 text-left transition-all active:scale-[0.98] hover:shadow-sm hover:border-emerald-500/20",
                      item.bg, "bg-opacity-30"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.bg)}>
                      <Icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.cat}</p>
                      {item.amount && <p className="text-[11px] text-muted-foreground">{formatCurrency(item.amount)}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-red-500" />
                <span className="text-sm font-bold">Gastos</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_QUICK.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.cat}
                    onClick={() => openForm("expense", item.cat)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-border/50 p-3.5 text-left transition-all active:scale-[0.98] hover:shadow-sm hover:border-red-500/20",
                      item.bg, "bg-opacity-30"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.bg)}>
                      <Icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <p className="text-sm font-semibold">{item.cat}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
            <span>{sortedTx.length} transacciones</span>
            <span>·</span>
            <span className="text-emerald-500 font-medium">{formatCurrency(monthIncome)} ingreso</span>
            <span>·</span>
            <span className="text-red-500 font-medium">{formatCurrency(monthExpenses)} gasto</span>
          </div>
          {sortedTx.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Sin movimientos</p>
              <p className="text-xs mt-1">Registra tu primer ingreso o gasto</p>
            </div>
          ) : (
            sortedTx.map((tx, i) => {
              const catInfo = [...INCOME_QUICK, ...EXPENSE_ALL].find((c) => c.cat === tx.category)
              const Icon = catInfo?.icon || MoreHorizontal
              return (
                <div key={tx.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl p-3.5 group transition-colors",
                    tx.type === "income" ? "bg-emerald-500/5" : "bg-red-500/5"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    tx.type === "income" ? "bg-emerald-500/20" : "bg-red-500/20"
                  )}>
                    <Icon className={cn("h-5 w-5", tx.type === "income" ? "text-emerald-500" : "text-red-500")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded-md">{tx.category}</Badge>
                      <span>{new Date(tx.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-bold", tx.type === "income" ? "text-emerald-500" : "text-red-500")}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                  <button onClick={() => deleteTx(tx.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-accent rounded-lg ml-1">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === "credit" && (
        <div className="space-y-5">
          <div className="rounded-[20px] border bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 p-5 text-center">
            <CreditCard className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Gastos tarjeta de crédito</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{formatCurrency(creditTotal)}</p>
            <Badge variant="warning" className="mt-2 text-[9px]">No afecta tu saldo disponible</Badge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-amber-500" />
                <span className="text-sm font-bold">Registrar gasto</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CREDIT_QUICK.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.cat}
                    onClick={() => openCreditForm(item.cat)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-border/50 p-3.5 text-left transition-all active:scale-[0.98] hover:shadow-sm hover:border-amber-500/20",
                      item.bg, "bg-opacity-30"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.bg)}>
                      <Icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <p className="text-sm font-semibold">{item.cat}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {sortedCredit.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{sortedCredit.length} gastos este mes</span>
              </div>
              <div className="space-y-2">
                {sortedCredit.map((cs) => (
                  <div key={cs.id} className="flex items-center gap-3 rounded-2xl bg-amber-500/5 p-3.5 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                      <CreditCard className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{cs.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded-md">{cs.category}</Badge>
                        <span>{new Date(cs.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-amber-600">{formatCurrency(cs.amount)}</p>
                    <button onClick={() => deleteCr(cs.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-accent rounded-lg">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowForm(false)}>
          <div className="w-full max-w-[calc(100vw-2rem)] max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                {formType === "income" ? "Nuevo ingreso" : "Nuevo gasto"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-accent rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground font-medium">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="pl-9 rounded-2xl h-14 text-2xl font-bold border-2"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Categoría</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(formType === "income" ? INCOME_QUICK : EXPENSE_ALL).map((item) => (
                    <button key={item.cat}
                      onClick={() => setFormCategory(item.cat)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-all border",
                        formCategory === item.cat
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nota (opcional)</label>
                <Input
                  placeholder="Ej: Almuerzo con amigos"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="rounded-xl h-11 mt-1.5 text-sm"
                />
              </div>
            </div>

            <Button className="w-full rounded-2xl h-12 text-sm gap-2 font-semibold"
              onClick={submitForm}>
              <Check className="h-4 w-4" /> Registrar {formType === "income" ? "ingreso" : "gasto"}
            </Button>
          </div>
        </div>
      )}

      {showCreditForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCreditForm(false)}>
          <div className="w-full max-w-[calc(100vw-2rem)] max-w-sm rounded-[20px] bg-background p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Gasto tarjeta</h3>
              <button onClick={() => setShowCreditForm(false)} className="p-2 hover:bg-accent rounded-xl">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground font-medium">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={crAmount}
                    onChange={(e) => setCrAmount(e.target.value)}
                    className="pl-9 rounded-2xl h-14 text-2xl font-bold border-2 border-amber-500/30 focus:border-amber-500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Categoría</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {CREDIT_QUICK.map((item) => (
                    <button key={item.cat}
                      onClick={() => setCrCategory(item.cat)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-all border",
                        crCategory === item.cat
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nota (opcional)</label>
                <Input
                  placeholder="Ej: Suscripción Netflix"
                  value={crDesc}
                  onChange={(e) => setCrDesc(e.target.value)}
                  className="rounded-xl h-11 mt-1.5 text-sm"
                />
              </div>
            </div>

            <Button className="w-full rounded-2xl h-12 text-sm gap-2 font-semibold bg-amber-500 hover:bg-amber-600"
              onClick={submitCredit}>
              <CreditCard className="h-4 w-4" /> Registrar gasto
            </Button>
          </div>
        </div>
      )}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-foreground text-background px-5 py-3 text-sm font-semibold shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {toastMsg}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="¿Eliminar transacción?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => {
          if (deleteType === "tx") setTransactions(prev => prev.filter(t => t.id !== deleteConfirm))
          else setCreditSpends(prev => prev.filter(c => c.id !== deleteConfirm))
          setToastMsg("Eliminado")
          setTimeout(() => setToastMsg(null), 2000)
          setDeleteConfirm(null)
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  )
}
