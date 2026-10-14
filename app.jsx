import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./chatbot.jsx";
import { createClient } from "@supabase/supabase-js";
import { Activity, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Droplets, Dumbbell, Flame, Heart, Home, Leaf, LogOut, Moon, Plus, Salad, Settings2, ShieldCheck, ShoppingBag, Sparkles, Sun, Target, Weight, X, Zap } from "lucide-react";
const SUPABASE_URL = "", SUPABASE_ANON_KEY = "", N8N_WEBHOOK_URL = "", UPI_ID = "9125759495@fam", WHATSAPP_NUMBER = "9125759495", SHOP_NAME = "Fitnova";
const products = [{ id: 1, name: "Plant Protein", type: "Vanilla \xB7 20 servings", price: 32, nutrition: "21g protein \xB7 120 kcal", image: "assets/product-1.png" }, { id: 2, name: "Daily Greens", type: "Matcha blend \xB7 30 servings", price: 26, nutrition: "4g fiber \xB7 35 kcal", image: "assets/product-2.png" }, { id: 3, name: "Everyday Multi", type: "Vegan \xB7 60 capsules", price: 19, nutrition: "Essential micronutrients", image: "assets/product-3.png" }, { id: 4, name: "Trail Mix", type: "Almond \xB7 seed \xB7 cacao", price: 12, nutrition: "8g protein \xB7 180 kcal", image: "assets/product-4.png" }];
const workouts = [{ name: "Full body foundations", level: "Beginner", mins: 22, focus: "Strength", moves: "Squat \xB7 wall push-up \xB7 glute bridge", query: "beginner+full+body+workout+no+equipment" }, { name: "Low-impact flow", level: "Beginner", mins: 18, focus: "Mobility", moves: "March \xB7 step-back lunge \xB7 standing reach", query: "low+impact+beginner+workout" }, { name: "Upper body + core", level: "Moderate", mins: 32, focus: "Strength", moves: "Dumbbell row \xB7 shoulder press \xB7 dead bug", query: "upper+body+core+workout+dumbbells" }, { name: "Tempo run intervals", level: "Moderate", mins: 28, focus: "Cardio", moves: "Warm-up \xB7 5 intervals \xB7 cool-down", query: "beginner+tempo+run+intervals" }, { name: "Power + conditioning", level: "Advanced", mins: 38, focus: "Strength", moves: "Thruster \xB7 renegade row \xB7 jump squat", query: "advanced+strength+conditioning+workout" }, { name: "Progressive run", level: "Advanced", mins: 42, focus: "Cardio", moves: "Easy pace \xB7 build \xB7 recovery", query: "advanced+progressive+running+workout" }];
const seed = { water: 4, calories: 1240, protein: 68, sleep: 7.5, mood: "Good", stress: 2, streak: 6, completed: false, food: [{ id: 1, name: "Greek yogurt bowl", calories: 320, protein: 24, sample: true }, { id: 2, name: "Tofu grain bowl", calories: 520, protein: 31, sample: true }], weights: [68.4, 68.2, 68.5, 68.1, 68, 67.9, 68.1], schedule: {}, cycleStart: "", cycleLength: 28, notes: [] };
function read(k, d) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
}
function App() {
  const [page, setPage] = useState("home"), [dark, setDark] = useState(() => read("fitnova-dark", false)), [data, setData] = useState(() => read("fitnova-data", seed)), [user, setUser] = useState(() => read("fitnova-user", null)), [client, setClient] = useState(null), [url, setUrl] = useState(() => read("fitnova-url", SUPABASE_URL)), [anon, setAnon] = useState(() => read("fitnova-key", SUPABASE_ANON_KEY)), [settings, setSettings] = useState(false), [authMode, setAuthMode] = useState("signup"), [error, setError] = useState(""), [toast, setToast] = useState("");
  const [level, setLevel] = useState("All"), [month, setMonth] = useState(new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1)), [date, setDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10)), [pick, setPick] = useState(workouts[0].name), [meal, setMeal] = useState(""), [cal, setCal] = useState(""), [protein, setProtein] = useState(""), [weight, setWeight] = useState(""), [bmi, setBmi] = useState(null), [form, setForm] = useState({ weight: "", height: "", age: "", activity: "1.4", sex: "female", goal: "maintain" });
  const [cycleDate, setCycleDate] = useState(""), [cycleDays, setCycleDays] = useState(28), [symptoms, setSymptoms] = useState([]), [cart, setCart] = useState([]), [buyer, setBuyer] = useState(""), [messages, setMessages] = useState([{ role: "assistant", content: "Hey, I'm Nova. What would make today feel like a win?" }]), [draft, setDraft] = useState(""), [busy, setBusy] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    document.body.dataset.fitnovaPage = page;
    document.body.dataset.fitnovaDark = dark ? "true" : "false";
  }, [page, dark]);
  const update = (fn) => setData((d) => typeof fn === "function" ? fn(d) : { ...d, ...fn });
  const say = (t) => {
    setToast(t);
    setTimeout(() => setToast(""), 2500);
  };
  useEffect(() => {
    const navigate = (e) => setPage(e.detail.page);
    window.addEventListener("fitnova:navigate", navigate);
    return () => window.removeEventListener("fitnova:navigate", navigate);
  }, []);
  useEffect(() => {
    localStorage.setItem("fitnova-data", JSON.stringify(data));
    if (dataReady && client && user && !String(user.id).startsWith("demo-")) client.from("fitnova_user_data").upsert({ user_id: user.id, data, updated_at: (/* @__PURE__ */ new Date()).toISOString() }, { onConflict: "user_id" }).then((r) => {
      if (r.error) console.warn("Supabase sync", r.error.message);
    });
  }, [data, client, user, dataReady]);
  useEffect(() => {
    localStorage.setItem("fitnova-dark", JSON.stringify(dark));
    localStorage.setItem("fitnova-user", JSON.stringify(user));
  }, [dark, user]);
  useEffect(() => {
    let u = url || read("fitnova-url", SUPABASE_URL), k = anon || read("fitnova-key", SUPABASE_ANON_KEY);
    if (u && k) {
      let c = createClient(u, k);
      setClient(c);
      c.auth.getSession().then(({ data: r }) => {
        if (r.session?.user) {
          let x = r.session.user;
          setUser({ id: x.id, email: x.email, name: x.user_metadata?.name || x.email.split("@")[0] });
        }
      });
    }
  }, []);
  useEffect(() => {
    if (!client || !user || String(user.id).startsWith("demo-")) return;
    setDataReady(false);
    client.from("fitnova_user_data").select("data").eq("user_id", user.id).maybeSingle().then(({ data: r, error: error2 }) => {
      if (!error2 && r?.data) setData(r.data);
      setDataReady(true);
    });
  }, [client, user?.id]);
  async function connect() {
    if (!url.trim() || !anon.trim()) {
      say("Add your Supabase URL and anon key");
      return;
    }
    let c = createClient(url.trim(), anon.trim());
    setClient(c);
    localStorage.setItem("fitnova-url", JSON.stringify(url.trim()));
    localStorage.setItem("fitnova-key", JSON.stringify(anon.trim()));
    setSettings(false);
    say("Supabase connected");
  }
  async function auth(e) {
    e.preventDefault();
    setError("");
    let f = new FormData(e.currentTarget), email = f.get("email"), password = f.get("password"), name = f.get("name");
    try {
      if (client) {
        let r = authMode === "signup" ? await client.auth.signUp({ email, password, options: { data: { name } } }) : await client.auth.signInWithPassword({ email, password });
        if (r.error) throw r.error;
        if (r.data.user) {
          setDataReady(false);
          setUser({ id: r.data.user.id, email: r.data.user.email, name: name || r.data.user.user_metadata?.name || String(email).split("@")[0] });
        }
      } else {
        if (String(password).length < 4) throw Error("Password must have at least 4 characters.");
        setUser({ id: "demo-" + String(email).toLowerCase(), email, name: name || String(email).split("@")[0] });
      }
      setPage("dashboard");
      say(client ? "Welcome to Fitnova" : "Demo account ready \xB7 saved on this device");
    } catch (e2) {
      setError(e2.message);
    }
  }
  async function signout() {
    if (client) await client.auth.signOut();
    setUser(null);
    setPage("home");
  }
  function go(p) {
    if (p === "dashboard" && !user) {
      setPage("auth");
      setAuthMode("signup");
    } else setPage(p);
  }
  const nav = [["dashboard", "Dashboard", Home], ["workouts", "Workouts", Dumbbell], ["schedule", "Schedule", CalendarDays], ["nutrition", "Food log", Salad], ["trackers", "Trackers", Activity], ["pcod", "PCOD tracker", Heart], ["calculators", "Calculators", Target], ["store", "Store", ShoppingBag], ["coach", "Nova coach", Sparkles], ["pricing", "Pricing", Zap]];
  const count = cart.reduce((a, x) => a + x.qty, 0), total = cart.reduce((a, x) => a + x.qty * x.price, 0);
  function add(p) {
    setCart((v) => {
      let old = v.find((x) => x.id === p.id);
      return old ? v.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...v, { ...p, qty: 1 }];
    });
    setPage("checkout");
    say("Added to order");
  }
  function amount(id, n) {
    setCart((v) => v.map((x) => x.id === id ? { ...x, qty: x.qty + n } : x).filter((x) => x.qty > 0));
  }
  function confirm() {
    let stamp = (/* @__PURE__ */ new Date()).toLocaleString(), lines = cart.map((x) => x.name + " \xD7 " + x.qty + " \u2014 \u20B9" + (x.price * x.qty).toFixed(2)).join("\n"), message = ["Thank you for your order from " + SHOP_NAME + "!", "", "Order details:", lines, "", "Total: \u20B9" + total.toFixed(2), "Name: " + (buyer.trim() || "Not provided"), "Date: " + stamp].join("\n"), payload = { name: buyer.trim() || null, items: cart.map((x) => ({ name: x.name, quantity: x.qty, unit_price: x.price, line_total: x.price * x.qty })), total, currency: "INR", created_at: (/* @__PURE__ */ new Date()).toISOString() };
    if (N8N_WEBHOOK_URL) fetch(N8N_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {
    });
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
    setCart([]);
    say("Order details opened in WhatsApp");
  }
  async function send(e) {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    let history = [...messages, { role: "user", content: draft.trim() }];
    setMessages(history);
    setDraft("");
    setBusy(true);
    try {
      let r = await window.websim.chat.completions.create({ messages: [{ role: "system", content: "You are Nova, a warm, practical wellness coach. Give concise, encouraging ideas. Never diagnose, prescribe, or claim to treat conditions. This app is for wellness tracking, not medical advice. For PCOD, injury, severe symptoms, pregnancy, or medication questions, recommend a qualified clinician." }, ...history.slice(-10)] });
      setMessages((v) => [...v, { role: "assistant", content: r.content }]);
    } catch {
      setMessages((v) => [...v, { role: "assistant", content: "I couldn't reach Nova just now. Please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }
  const modal = settings ? /* @__PURE__ */ jsxDEV(Settings, { url, setUrl, anon, setAnon, connect, close: () => setSettings(false), connected: !!client }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 11,
    columnNumber: 22
  }, this) : null;
  if (page === "home") return /* @__PURE__ */ jsxDEV("div", { className: (dark ? "dark " : "") + "app min-h-screen", children: [
    /* @__PURE__ */ jsxDEV("header", { className: "flex items-center justify-between px-6 py-5 md:px-12", children: [
      /* @__PURE__ */ jsxDEV(Brand, { onClick: () => setPage("home") }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 152
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "home-nav-links flex items-center gap-8 text-sm font-semibold text-muted", children: [
        /* @__PURE__ */ jsxDEV("a", { href: "#features", children: "Why Fitnova" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 279
        }, this),
        /* @__PURE__ */ jsxDEV("a", { href: "#pricing", children: "Pricing" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 314
        }, this),
        /* @__PURE__ */ jsxDEV("button", { onClick: () => {
          setPage("auth");
          setAuthMode("login");
        }, children: "Log in" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 344
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 190
      }, this),
      /* @__PURE__ */ jsxDEV("button", { "aria-label": "Toggle color mode", className: "fit-button ghost !p-2", onClick: () => setDark(!dark), children: dark ? /* @__PURE__ */ jsxDEV(Sun, { size: 17 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 534
      }, this) : /* @__PURE__ */ jsxDEV(Moon, { size: 17 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 551
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 426
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "fit-button !px-4 !py-2.5", onClick: () => {
        setPage("auth");
        setAuthMode("signup");
      }, children: [
        "Get started ",
        /* @__PURE__ */ jsxDEV(ArrowRight, { className: "ml-1 inline", size: 15 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 689
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 578
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 79
    }, this),
    /* @__PURE__ */ jsxDEV("section", { className: "home-grid px-6 py-14 md:px-12 md:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
          /* @__PURE__ */ jsxDEV(Sparkles, { size: 13, className: "mr-1" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 916
          }, this),
          " Your rhythm. Your rules."
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 894
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "hero-title mt-6 text-6xl font-extrabold leading-[1.03] md:text-[76px]", children: [
          "Feel good",
          /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 1081
          }, this),
          "in your ",
          /* @__PURE__ */ jsxDEV("span", { className: "text-[#42865d]", children: "own way." }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 1094
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 986
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-6 max-w-lg text-lg leading-relaxed text-muted", children: "A calmer kind of fitness app. Build strength, notice patterns, celebrate little wins." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 1147
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button px-6 py-3.5", onClick: () => {
            setPage("auth");
            setAuthMode("signup");
          }, children: [
            "Start for free ",
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "ml-2 inline", size: 17 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 12,
              columnNumber: 1455
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 1343
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button ghost px-6 py-3.5", onClick: () => go("workouts"), children: "Explore workouts" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 1511
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 1300
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-8 text-sm text-muted", children: "Small steps count. Always." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 1620
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 889
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-6 md:p-7", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Your day, gently guided" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 12,
              columnNumber: 1772
            }, this),
            /* @__PURE__ */ jsxDEV("h3", { className: "mt-1 text-xl font-extrabold", children: "A little progress" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 12,
              columnNumber: 1833
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 1767
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
            /* @__PURE__ */ jsxDEV(Flame, { size: 14, className: "mr-1" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 12,
              columnNumber: 1927
            }, this),
            " 6 day streak"
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 1905
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 1729
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "hero-orb mx-auto my-7 grid h-48 w-48 place-items-center rounded-full text-center text-white", children: /* @__PURE__ */ jsxDEV("div", { className: "display text-5xl font-extrabold", children: [
          "72%",
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-normal", children: "daily rhythm" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 2149
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 2097
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 1988
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-2", children: [[Flame, "1,240", "kcal"], [Dumbbell, "68g", "protein"], [Heart, "Good", "mood"]].map(([I, v, l]) => /* @__PURE__ */ jsxDEV("div", { className: "surface p-3 text-center", children: [
          /* @__PURE__ */ jsxDEV(I, { size: 17, className: "mx-auto text-[#4e8e63]" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 2391
          }, this),
          /* @__PURE__ */ jsxDEV("b", { className: "mt-1 block text-sm", children: v }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 2440
          }, this),
          /* @__PURE__ */ jsxDEV("small", { className: "text-muted", children: l }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 12,
            columnNumber: 2481
          }, this)
        ] }, l, true, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 2342
        }, this)) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 2212
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-center text-[10px] text-muted", children: "Illustrative sample data" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 2536
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 1695
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 814
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 754
    }, this),
    /* @__PURE__ */ jsxDEV("section", { id: "features", className: "px-6 py-20 md:px-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "One home for your wellbeing" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 2731
      }, this),
      /* @__PURE__ */ jsxDEV("h2", { className: "mt-4 text-4xl font-extrabold", children: "More in tune. Less all-or-nothing." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 2787
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [[Dumbbell, "Move with joy", "Workouts at every level and a flexible schedule."], [Salad, "Fuel your day", "Log meals and notice nutrition without pressure."], [Moon, "Notice your patterns", "Track sleep, mood, stress, weight, and cycle trends."], [Sparkles, "A coach in your corner", "Nova turns big goals into doable next steps."]].map(([I, t, b]) => /* @__PURE__ */ jsxDEV("article", { className: "panel card-hover p-5", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "metric-icon", children: /* @__PURE__ */ jsxDEV(I, { size: 19 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3353
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3323
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mt-5 text-lg font-bold", children: t }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3374
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm leading-relaxed text-muted", children: b }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3421
        }, this)
      ] }, t, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 3273
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 2871
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 2696
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 2641
    }, this),
    /* @__PURE__ */ jsxDEV("section", { id: "pricing", className: "bg-[#eaf1eb] px-6 py-16 dark:bg-[#142220]", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Start where you are" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3672
        }, this),
        /* @__PURE__ */ jsxDEV("h2", { className: "mt-4 text-4xl font-extrabold", children: "Good habits aren't behind a paywall." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3720
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-muted", children: "Build a steady routine for free. Upgrade if deeper insights feel right." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3806
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 3667
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxDEV(Plan, { title: "Free", price: "$0", list: ["Daily wellness dashboard", "Workout library", "Core trackers & calculators"], onClick: () => {
          setPage("auth");
          setAuthMode("signup");
        } }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 3961
        }, this),
        /* @__PURE__ */ jsxDEV(Plan, { title: "Premium", price: "$8", list: ["Everything in Free", "Weekly insights", "More Nova coach chats"], premium: true, onClick: () => setPage("pricing") }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 12,
          columnNumber: 4130
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 3918
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 3593
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 3517
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "flex justify-between px-6 py-6 text-xs text-muted md:px-12", children: [
      /* @__PURE__ */ jsxDEV("span", { children: "\xA9 2026 Fitnova" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 4378
      }, this),
      /* @__PURE__ */ jsxDEV("span", { children: "Wellness tracking only. Not medical advice." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 12,
        columnNumber: 4405
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 4299
    }, this),
    toast && /* @__PURE__ */ jsxDEV("div", { className: "toast", children: toast }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 12,
      columnNumber: 4478
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 12,
    columnNumber: 25
  }, this);
  if (page === "auth") return /* @__PURE__ */ jsxDEV("div", { className: (dark ? "dark " : "") + "app grid min-h-screen place-items-center p-5", children: [
    /* @__PURE__ */ jsxDEV("button", { className: "absolute left-6 top-6", onClick: () => setPage("home"), children: /* @__PURE__ */ jsxDEV(Brand, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 179
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 107
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "fit-button ghost absolute right-6 top-6 !p-2", onClick: () => setDark(!dark), children: dark ? /* @__PURE__ */ jsxDEV(Sun, { size: 17 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 296
    }, this) : /* @__PURE__ */ jsxDEV(Moon, { size: 17 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 313
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 196
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel w-full max-w-md p-8", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
        /* @__PURE__ */ jsxDEV(Leaf, { size: 13, className: "mr-1" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 405
        }, this),
        " A softer start"
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 383
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "mt-5 text-3xl font-extrabold", children: authMode === "signup" ? "Make room for you." : "Welcome back." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 461
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm text-muted", children: client ? "Authentication powered by Supabase." : "Demo mode saves your account on this device." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 569
      }, this),
      /* @__PURE__ */ jsxDEV("form", { className: "mt-6 space-y-4", onSubmit: auth, children: [
        authMode === "signup" && /* @__PURE__ */ jsxDEV("label", { className: "block text-xs font-semibold", children: [
          "Name",
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", name: "name", placeholder: "Your name" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 13,
            columnNumber: 827
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 776
        }, this),
        /* @__PURE__ */ jsxDEV("label", { className: "block text-xs font-semibold", children: [
          "Email",
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", type: "email", name: "email", required: true }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 13,
            columnNumber: 959
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 907
        }, this),
        /* @__PURE__ */ jsxDEV("label", { className: "block text-xs font-semibold", children: [
          "Password",
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", type: "password", name: "password", minLength: "4", required: true }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 13,
            columnNumber: 1092
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 1037
        }, this),
        error && /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-rose-600", children: error }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 1198
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button w-full", children: [
          authMode === "signup" ? "Create free account" : "Log in",
          /* @__PURE__ */ jsxDEV(ArrowRight, { size: 16, className: "ml-2 inline" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 13,
            columnNumber: 1337
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 1247
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 705
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-center text-sm text-muted", children: [
        authMode === "signup" ? "Already have an account?" : "New to Fitnova?",
        " ",
        /* @__PURE__ */ jsxDEV("button", { className: "font-bold text-[#367950]", onClick: () => setAuthMode(authMode === "signup" ? "login" : "signup"), children: authMode === "signup" ? "Log in" : "Sign up" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 13,
          columnNumber: 1518
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 1400
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "mt-5 w-full text-xs text-[#397651]", onClick: () => setSettings(true), children: "Configure Supabase" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 1680
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-center text-[10px] text-muted", children: "Wellness tracking only. Not medical advice." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 13,
        columnNumber: 1794
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 340
    }, this),
    modal,
    toast && /* @__PURE__ */ jsxDEV("div", { className: "toast", children: toast }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 13,
      columnNumber: 1917
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 13,
    columnNumber: 25
  }, this);
  let content;
  if (page === "dashboard") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-4 flex justify-between", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "A snapshot, not a scorecard." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 76
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Sample data \xB7 edit any tracker" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 142
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 15,
      columnNumber: 33
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel flex flex-col justify-between gap-5 bg-[#e8f2e9] p-6 dark:bg-[#21362b] md:flex-row md:items-center", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Today's movement" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 334
        }, this),
        /* @__PURE__ */ jsxDEV("h2", { className: "mt-4 text-2xl font-extrabold", children: "Full body foundations" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 379
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm text-muted", children: "22 min \xB7 Beginner \xB7 equipment-free strength" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 450
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-5", onClick: () => {
          update((d) => ({ ...d, completed: !d.completed, streak: d.completed ? d.streak : Math.max(7, d.streak) }));
          say(data.completed ? "Workout unmarked" : "Workout complete \xB7 nice work!");
        }, children: data.completed ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV(Check, { size: 15, className: "mr-1 inline" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 15,
            columnNumber: 769
          }, this),
          "Completed"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 767
        }, this) : "Mark complete \u2192" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 536
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 329
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "hero-orb grid h-36 w-full max-w-48 place-items-center rounded-2xl", children: /* @__PURE__ */ jsxDEV(Dumbbell, { size: 38, className: "text-white" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 940
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 857
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 15,
      columnNumber: 207
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4", children: [[Flame, "Calories", data.calories, "kcal", data.calories / 2e3], [Dumbbell, "Protein", data.protein, "g", data.protein / 110], [Droplets, "Water", data.water, "glasses", data.water / 8], [Moon, "Sleep", data.sleep, "hrs", data.sleep / 8]].map(([I, t, v, u, p]) => /* @__PURE__ */ jsxDEV("div", { className: "panel metric-card", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "metric-icon", children: /* @__PURE__ */ jsxDEV(I, { size: 18 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1363
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1333
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-3 text-2xl font-extrabold", children: [
        v,
        /* @__PURE__ */ jsxDEV("small", { className: "ml-1 text-xs font-normal text-muted", children: u }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 1433
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1384
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: [
        t,
        " ",
        /* @__PURE__ */ jsxDEV("span", { className: "float-right", children: "sample" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 1543
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1505
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "progress mt-3", children: /* @__PURE__ */ jsxDEV("span", { style: { width: Math.min(100, p * 100) + "%" } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1621
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1590
      }, this)
    ] }, t, true, {
      fileName: "<stdin>",
      lineNumber: 15,
      columnNumber: 1290
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 15,
      columnNumber: 996
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-5 grid gap-5 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Consistency" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 1763
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mt-1 text-lg font-bold", children: [
          /* @__PURE__ */ jsxDEV(Flame, { className: "mr-1 inline text-orange-400" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 15,
            columnNumber: 1851
          }, this),
          data.streak,
          " day streak"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 1812
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-5 flex justify-between", children: ["M", "T", "W", "T", "F", "S", "S"].map((x, i) => /* @__PURE__ */ jsxDEV("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-[#e5f2e8] text-xs text-[#347951]", children: i < 5 ? /* @__PURE__ */ jsxDEV(Check, { size: 15 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2125
        }, this) : x }, i, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2013
        }, this)) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 1928
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 1736
      }, this),
      /* @__PURE__ */ jsxDEV(Mood, { data, update }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 2167
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Stress check-in" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2229
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: "How's your stress?" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2282
        }, this),
        /* @__PURE__ */ jsxDEV(Stress, { value: data.stress, onChange: (v) => update((d) => ({ ...d, stress: v })) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2339
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-xs text-muted", children: "A check-in, not a judgment." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2411
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 2202
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 15,
      columnNumber: 1688
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel mt-5 flex items-center justify-between p-5", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Hydration" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2564
        }, this),
        /* @__PURE__ */ jsxDEV("b", { className: "text-lg", children: [
          data.water,
          " / 8 glasses"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2611
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 2559
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "fit-button secondary", onClick: () => update((d) => ({ ...d, water: Math.min(8, d.water + 1) })), children: [
        /* @__PURE__ */ jsxDEV(Plus, { size: 16, className: "mr-1 inline" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 15,
          columnNumber: 2771
        }, this),
        "Add glass"
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 15,
        columnNumber: 2668
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 15,
      columnNumber: 2493
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 15,
    columnNumber: 31
  }, this);
  else if (page === "workouts") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-5 flex flex-wrap gap-2", children: ["All", "Beginner", "Moderate", "Advanced"].map((x) => /* @__PURE__ */ jsxDEV("button", { className: "chip " + (level === x ? "active" : ""), onClick: () => setLevel(x), children: x }, x, false, {
      fileName: "<stdin>",
      lineNumber: 16,
      columnNumber: 129
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 16,
      columnNumber: 37
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: workouts.filter((w) => level === "All" || level === w.level).map((w, i) => /* @__PURE__ */ jsxDEV("article", { className: "panel card-hover overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "relative grid h-36 place-items-center " + ["bg-[#e1f0e4]", "bg-[#f6eadd]", "bg-[#e4edf3]"][i % 3], children: [
        /* @__PURE__ */ jsxDEV(Dumbbell, { size: 42, className: "text-[#397952]" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 16,
          columnNumber: 533
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "tag absolute right-3 top-3", children: w.level }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 16,
          columnNumber: 581
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 16,
        columnNumber: 423
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: [
          w.focus,
          " \xB7 ",
          w.mins,
          " min"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 16,
          columnNumber: 669
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mt-2 text-lg font-bold", children: w.name }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 16,
          columnNumber: 731
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-xs text-muted", children: w.moves }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 16,
          columnNumber: 783
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex gap-2", children: [
          /* @__PURE__ */ jsxDEV("a", { className: "fit-button flex-1 text-center !py-2.5", target: "_blank", rel: "noreferrer", href: "https://www.youtube.com/results?search_query=" + w.query, children: "Watch on YouTube" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 16,
            columnNumber: 868
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button secondary", onClick: () => {
            setPick(w.name);
            setPage("schedule");
          }, children: /* @__PURE__ */ jsxDEV(CalendarDays, { size: 17 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 16,
            columnNumber: 1130
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 16,
            columnNumber: 1037
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 16,
          columnNumber: 835
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 16,
        columnNumber: 648
      }, this)
    ] }, w.name, true, {
      fileName: "<stdin>",
      lineNumber: 16,
      columnNumber: 356
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 16,
      columnNumber: 235
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 16,
    columnNumber: 35
  }, this);
  else if (page === "schedule") content = /* @__PURE__ */ jsxDEV("div", { className: "grid gap-5 xl:grid-cols-[1fr_300px]", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button ghost !p-2", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), children: /* @__PURE__ */ jsxDEV(ChevronLeft, { size: 18 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 288
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 171
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "text-xl font-extrabold", children: month.toLocaleDateString("en", { month: "long", year: "numeric" }) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 321
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button ghost !p-2", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), children: /* @__PURE__ */ jsxDEV(ChevronRight, { size: 18 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 544
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 427
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 115
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-7 gap-2", children: [
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => /* @__PURE__ */ jsxDEV("div", { className: "text-center text-xs text-muted", children: x }, x, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 676
        }, this)),
        calendar(month).map((d, i) => {
          let k = d ? month.getFullYear() + "-" + String(month.getMonth() + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0") : "";
          return /* @__PURE__ */ jsxDEV("button", { disabled: !d, onClick: () => setDate(k), className: "calendar-cell " + (date === k ? "selected" : ""), children: d && /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("b", { children: d }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 17,
              columnNumber: 1002
            }, this),
            data.schedule[k] && /* @__PURE__ */ jsxDEV("small", { className: "mt-2 block truncate text-[#397952]", children: data.schedule[k] }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 17,
              columnNumber: 1031
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 17,
            columnNumber: 1e3
          }, this) }, i, false, {
            fileName: "<stdin>",
            lineNumber: 17,
            columnNumber: 887
          }, this);
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 584
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 17,
      columnNumber: 88
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel h-fit p-5", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Plan a session" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 1173
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "mt-4 text-lg font-bold", children: "Make it yours" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 1216
      }, this),
      /* @__PURE__ */ jsxDEV("label", { className: "mt-4 block text-xs text-muted", children: [
        "Workout",
        /* @__PURE__ */ jsxDEV("select", { className: "fit-input mt-1", value: pick, onChange: (e) => setPick(e.target.value), children: workouts.map((w) => /* @__PURE__ */ jsxDEV("option", { children: w.name }, w.name, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 1432
        }, this)) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 1329
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 1273
      }, this),
      /* @__PURE__ */ jsxDEV("label", { className: "mt-4 block text-xs text-muted", children: [
        "Date",
        /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", type: "date", value: date, onChange: (e) => setDate(e.target.value) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 17,
          columnNumber: 1542
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 1489
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-4 w-full", onClick: () => {
        update((d) => ({ ...d, schedule: { ...d.schedule, [date]: pick } }));
        say("Workout added to calendar");
      }, children: "Add to calendar" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 1648
      }, this),
      data.schedule[date] && /* @__PURE__ */ jsxDEV("button", { className: "mt-3 w-full text-sm text-rose-500", onClick: () => update((d) => {
        let s = { ...d.schedule };
        delete s[date];
        return { ...d, schedule: s };
      }), children: "Remove workout" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 1843
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-xs text-muted", children: "Rest days count, too." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 2010
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 17,
      columnNumber: 1140
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 17,
    columnNumber: 35
  }, this);
  else if (page === "nutrition") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 md:grid-cols-3", children: [[Flame, "Calories", data.calories, "kcal"], [Dumbbell, "Protein", data.protein, "g"], [Droplets, "Water", data.water, "glasses"]].map(([I, t, v, u]) => /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "metric-icon", children: /* @__PURE__ */ jsxDEV(I, { size: 18 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 284
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 254
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm text-muted", children: [
        t,
        " today"
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 305
      }, this),
      /* @__PURE__ */ jsxDEV("b", { className: "text-2xl", children: [
        v,
        " ",
        /* @__PURE__ */ jsxDEV("small", { className: "text-xs font-normal text-muted", children: u }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 385
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 357
      }, this)
    ] }, t, true, {
      fileName: "<stdin>",
      lineNumber: 18,
      columnNumber: 219
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 18,
      columnNumber: 38
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-5 grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: "Add a meal" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 539
        }, this),
        /* @__PURE__ */ jsxDEV("form", { className: "mt-4 space-y-3", onSubmit: (e) => {
          e.preventDefault();
          if (!meal.trim()) return;
          update((d) => ({ ...d, food: [...d.food, { id: Date.now(), name: meal, calories: Number(cal) || 0, protein: Number(protein) || 0 }], calories: d.calories + (Number(cal) || 0), protein: d.protein + (Number(protein) || 0) }));
          setMeal("");
          setCal("");
          setProtein("");
          say("Meal added");
        }, children: [
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input", placeholder: "Meal or snack", value: meal, onChange: (e) => setMeal(e.target.value), required: true }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 18,
            columnNumber: 925
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxDEV("input", { className: "fit-input", type: "number", placeholder: "Calories", value: cal, onChange: (e) => setCal(e.target.value) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 1083
            }, this),
            /* @__PURE__ */ jsxDEV("input", { className: "fit-input", type: "number", placeholder: "Protein (g)", value: protein, onChange: (e) => setProtein(e.target.value) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 1199
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 18,
            columnNumber: 1043
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button w-full", children: "Add to food log" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 18,
            columnNumber: 1332
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 588
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-xs text-muted", children: "Nutrition values are estimates." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 1401
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 512
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: [
          "Food log ",
          /* @__PURE__ */ jsxDEV("small", { className: "text-xs font-normal text-muted", children: "sample entries labeled" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 18,
            columnNumber: 1551
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 1508
        }, this),
        data.food.map((f) => /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between border-b border-[#edf0ed] py-4", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("b", { children: [
              f.name,
              " ",
              f.sample && /* @__PURE__ */ jsxDEV("small", { className: "tag", children: "Sample" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 18,
                columnNumber: 1762
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 1739
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: f.sample ? "Illustrative entry" : "Logged today" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 1804
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 18,
            columnNumber: 1734
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxDEV("b", { children: [
              f.calories,
              " kcal"
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 1922
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: [
              f.protein,
              "g protein"
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 1946
            }, this),
            /* @__PURE__ */ jsxDEV("button", { className: "text-xs text-rose-500", onClick: () => update((d) => ({ ...d, food: d.food.filter((x) => x.id !== f.id), calories: Math.max(0, d.calories - f.calories), protein: Math.max(0, d.protein - f.protein) })), children: "Remove" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 18,
              columnNumber: 2004
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 18,
            columnNumber: 1894
          }, this)
        ] }, f.id, true, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 1654
        }, this))
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 1481
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 18,
      columnNumber: 464
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel mt-5 flex items-center justify-between p-5", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Hydration" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 2310
        }, this),
        /* @__PURE__ */ jsxDEV("b", { children: [
          data.water,
          " / 8 glasses"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 2357
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 2305
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "fit-button secondary", onClick: () => update((d) => ({ ...d, water: Math.min(8, d.water + 1) })), children: [
        /* @__PURE__ */ jsxDEV(Plus, { size: 16, className: "mr-1 inline" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 18,
          columnNumber: 2497
        }, this),
        "Add glass"
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 2394
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 18,
      columnNumber: 2239
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 18,
    columnNumber: 36
  }, this);
  else if (page === "trackers") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "grid gap-5 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "A trend, not a target" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 107
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: [
          "Weight over time ",
          /* @__PURE__ */ jsxDEV("small", { className: "text-xs font-normal text-muted", children: "kg \xB7 sample history" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 217
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 166
        }, this),
        /* @__PURE__ */ jsxDEV(Chart, { values: data.weights }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 299
        }, this),
        /* @__PURE__ */ jsxDEV("form", { className: "mt-4 flex gap-2", onSubmit: (e) => {
          e.preventDefault();
          if (!weight) return;
          update((d) => ({ ...d, weights: [...d.weights.slice(-6), Number(weight)] }));
          setWeight("");
          say("Weight logged");
        }, children: [
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input", type: "number", step: "0.1", placeholder: "Today's weight (kg)", value: weight, onChange: (e) => setWeight(e.target.value) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 519
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button shrink-0", children: "Log weight" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 663
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 329
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-xs text-muted", children: "Scale readings fluctuate. Track only if useful for you." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 729
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 80
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Rest & recovery" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 860
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: "Sleep" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 913
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "surface mt-5 p-4", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: "Last night's sleep \xB7 sample" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 991
          }, this),
          /* @__PURE__ */ jsxDEV("b", { className: "mt-1 block text-3xl", children: [
            data.sleep,
            " hrs"
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 1056
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "progress mt-3", children: /* @__PURE__ */ jsxDEV("span", { style: { width: Math.min(100, data.sleep / 8 * 100) + "%", background: "#9788c8" } }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 1142
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 1111
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 957
        }, this),
        /* @__PURE__ */ jsxDEV("form", { className: "mt-4 flex gap-2", onSubmit: (e) => {
          e.preventDefault();
          let v = Number(e.currentTarget.h.value);
          if (v) update((d) => ({ ...d, sleep: v }));
          e.currentTarget.reset();
        }, children: [
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input", name: "h", type: "number", min: "0", max: "24", step: "0.1", placeholder: "Log sleep hours" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 1397
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button", children: "Log" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 19,
            columnNumber: 1508
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 1233
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-5", children: /* @__PURE__ */ jsxDEV(Mood, { data, update }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 1580
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 19,
          columnNumber: 1558
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 833
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 19,
      columnNumber: 37
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel mt-5 p-5", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Stress check-in" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 1665
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: "Where are you today?" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 1718
      }, this),
      /* @__PURE__ */ jsxDEV(Stress, { value: data.stress, onChange: (v) => {
        update((d) => ({ ...d, stress: v }));
        say("Check-in saved");
      } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 1777
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-xs text-muted", children: "A rating for your own awareness, not a grade." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 1873
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 19,
      columnNumber: 1633
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 19,
    columnNumber: 35
  }, this);
  else if (page === "calculators") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-5 rounded-2xl bg-[#eaf3ed] p-4 text-sm text-[#567060] dark:bg-[#21362b]", children: "General estimates only, not medical guidance or prescriptions." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 20,
      columnNumber: 40
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid gap-5 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "BMI \xB7 screening estimate" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 270
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mt-3 text-xl font-extrabold", children: "BMI calculator" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 323
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-xs text-muted", children: "BMI has limitations and does not describe overall health." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 386
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxDEV("input", { id: "bmiw", className: "fit-input", type: "number", placeholder: "Weight (kg)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 531
          }, this),
          /* @__PURE__ */ jsxDEV("input", { id: "bmih", className: "fit-input", type: "number", placeholder: "Height (cm)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 611
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 486
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-4 w-full", onClick: () => {
          let w = Number(document.getElementById("bmiw").value), h = Number(document.getElementById("bmih").value) / 100;
          if (w && h) setBmi((w / (h * h)).toFixed(1));
          else say("Enter valid height and weight");
        }, children: "Calculate BMI" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 697
        }, this),
        bmi && /* @__PURE__ */ jsxDEV("div", { className: "surface mt-4 p-4", children: [
          /* @__PURE__ */ jsxDEV("small", { className: "text-muted", children: "Estimated BMI" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 1001
          }, this),
          /* @__PURE__ */ jsxDEV("b", { className: "block text-3xl", children: bmi }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 1052
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 967
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 20,
        columnNumber: 243
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Calorie & protein calculator" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 1131
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mt-3 text-xl font-extrabold", children: "Personal estimate" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 1188
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
          [["weight", "Weight (kg)"], ["height", "Height (cm)"], ["age", "Age"]].map(([k, l]) => /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted", children: [
            l,
            /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", type: "number", value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 1431
            }, this)
          ] }, k, true, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 1382
          }, this)),
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted", children: [
            "Activity",
            /* @__PURE__ */ jsxDEV("select", { className: "fit-input mt-1", value: form.activity, onChange: (e) => setForm({ ...form, activity: e.target.value }), children: [
              /* @__PURE__ */ jsxDEV("option", { value: "1.2", children: "Mostly seated" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 1718
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "1.4", children: "Lightly active" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 1760
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "1.6", children: "Moderately active" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 1803
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "1.75", children: "Very active" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 1849
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 1604
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 1558
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted", children: [
            "Equation input",
            /* @__PURE__ */ jsxDEV("select", { className: "fit-input mt-1", value: form.sex, onChange: (e) => setForm({ ...form, sex: e.target.value }), children: [
              /* @__PURE__ */ jsxDEV("option", { value: "female", children: "Female constant" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2063
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "male", children: "Male constant" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2110
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 1959
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 1907
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted", children: [
            "Goal",
            /* @__PURE__ */ jsxDEV("select", { className: "fit-input mt-1", value: form.goal, onChange: (e) => setForm({ ...form, goal: e.target.value }), children: [
              /* @__PURE__ */ jsxDEV("option", { value: "maintain", children: "Maintain" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2318
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "gentle", children: "Gentle deficit" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2360
              }, this),
              /* @__PURE__ */ jsxDEV("option", { value: "gain", children: "Support gain" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2406
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 2212
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 2170
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 20,
          columnNumber: 1254
        }, this),
        form.weight && form.height && form.age && (() => {
          let base = (10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + (form.sex === "female" ? -161 : 5)) * Number(form.activity), kcal = Math.round(base + (form.goal === "gentle" ? -250 : form.goal === "gain" ? 200 : 0));
          return /* @__PURE__ */ jsxDEV("div", { className: "surface mt-4 grid grid-cols-2 gap-3 p-4", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("small", { className: "text-muted", children: "Estimated daily calories" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2787
              }, this),
              /* @__PURE__ */ jsxDEV("b", { className: "block text-2xl", children: kcal }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2849
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 2782
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("small", { className: "text-muted", children: "Protein guide" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2900
              }, this),
              /* @__PURE__ */ jsxDEV("b", { className: "block text-2xl", children: [
                Math.round(Number(form.weight) * 1.4),
                " g"
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 20,
                columnNumber: 2951
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 2895
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "col-span-2 text-[10px] text-muted", children: "Broad estimates may not suit everyone, including people under 18, pregnant, with health conditions, or with a history of disordered eating." }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 20,
              columnNumber: 3030
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 20,
            columnNumber: 2725
          }, this);
        })()
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 20,
        columnNumber: 1104
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 20,
      columnNumber: 200
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 20,
    columnNumber: 38
  }, this);
  else if (page === "pcod") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-5 rounded-2xl bg-[#f1eafa] p-4 text-sm text-[#6a557e] dark:bg-[#30283a]", children: "Private wellness journal only, not diagnostic or treatment advice. Cycle patterns vary; discuss concerns with a qualified clinician." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 21,
      columnNumber: 33
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid gap-5 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Cycle notes" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 333
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "mt-4 text-xl font-extrabold", children: "Log what you notice" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 373
        }, this),
        /* @__PURE__ */ jsxDEV("label", { className: "mt-5 block text-xs text-muted", children: [
          "Last period start",
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", type: "date", value: cycleDate, onChange: (e) => setCycleDate(e.target.value) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 21,
            columnNumber: 507
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 441
        }, this),
        /* @__PURE__ */ jsxDEV("label", { className: "mt-4 block text-xs text-muted", children: [
          "Typical cycle length",
          /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", type: "number", value: cycleDays, onChange: (e) => setCycleDays(e.target.value) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 21,
            columnNumber: 692
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 623
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-xs text-muted", children: "Optional symptom notes" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 810
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-2 flex flex-wrap gap-2", children: ["Cramps", "Energy", "Skin", "Cravings", "Sleep", "Other"].map((s) => /* @__PURE__ */ jsxDEV("button", { className: "chip " + (symptoms.includes(s) ? "active" : ""), onClick: () => setSymptoms((v) => v.includes(s) ? v.filter((x) => x !== s) : [...v, s]), children: s }, s, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 980
        }, this)) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 875
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-5 w-full", onClick: () => {
          update((d) => ({ ...d, cycleStart: cycleDate, cycleLength: Number(cycleDays), notes: [...d.notes, { date: (/* @__PURE__ */ new Date()).toLocaleDateString(), symptoms }] }));
          setSymptoms([]);
          say("Cycle note saved");
        }, children: "Save note" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 1143
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 21,
        columnNumber: 306
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Your entries" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 1440
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold", children: "Cycle journal" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 1490
        }, this),
        data.cycleStart && /* @__PURE__ */ jsxDEV("div", { className: "surface mt-4 p-4", children: [
          /* @__PURE__ */ jsxDEV("small", { className: "text-muted", children: "Last period start" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 21,
            columnNumber: 1594
          }, this),
          /* @__PURE__ */ jsxDEV("b", { className: "block", children: [
            data.cycleStart,
            " \xB7 ",
            data.cycleLength,
            " days"
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 21,
            columnNumber: 1649
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 1560
        }, this),
        data.notes.length ? data.notes.slice().reverse().map((n, i) => /* @__PURE__ */ jsxDEV("div", { className: "surface mt-3 p-4", children: [
          /* @__PURE__ */ jsxDEV("b", { children: n.date }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 21,
            columnNumber: 1825
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: n.symptoms.join(" \xB7 ") || "No symptoms selected" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 21,
            columnNumber: 1840
          }, this)
        ] }, i, true, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 1783
        }, this)) : /* @__PURE__ */ jsxDEV("div", { className: "surface mt-4 py-10 text-center text-sm text-muted", children: "Saved notes appear here." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 21,
          columnNumber: 1934
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 21,
        columnNumber: 1413
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 21,
      columnNumber: 263
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 21,
    columnNumber: 31
  }, this);
  else if (page === "store") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-5 flex justify-between", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Sample product catalog \xB7 details illustrative." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 77
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
        /* @__PURE__ */ jsxDEV(ShoppingBag, { size: 13, className: "mr-1" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 22,
          columnNumber: 183
        }, this),
        " ",
        count,
        " items"
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 161
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 22,
      columnNumber: 34
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: products.map((p) => /* @__PURE__ */ jsxDEV("article", { className: "panel card-hover p-3", children: [
      /* @__PURE__ */ jsxDEV("img", { className: "product-image", src: p.image, alt: p.name }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 379
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "px-2 pb-2 pt-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-bold", children: p.name }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 22,
              columnNumber: 513
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-xs text-muted", children: p.type }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 22,
              columnNumber: 552
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 22,
            columnNumber: 508
          }, this),
          /* @__PURE__ */ jsxDEV("b", { children: [
            "\u20B9",
            p.price
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 22,
            columnNumber: 609
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 22,
          columnNumber: 470
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 rounded-xl bg-[#f4f7f4] px-3 py-2 text-xs text-[#58715f] dark:bg-[#22322f]", children: p.nutrition }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 22,
          columnNumber: 632
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-4 w-full", onClick: () => add(p), children: [
          "Order now ",
          /* @__PURE__ */ jsxDEV(Plus, { size: 15, className: "ml-1 inline" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 22,
            columnNumber: 822
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 22,
          columnNumber: 748
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 438
      }, this)
    ] }, p.id, true, {
      fileName: "<stdin>",
      lineNumber: 22,
      columnNumber: 326
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 22,
      columnNumber: 251
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-xs text-muted", children: "Check product labels. Sample catalog, not medical recommendations." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 22,
      columnNumber: 896
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 22,
    columnNumber: 32
  }, this);
  else if (page === "checkout") content = /* @__PURE__ */ jsxDEV("div", { className: "mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1.1fr_.9fr]", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "panel p-6", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Order confirmation" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 134
      }, this),
      /* @__PURE__ */ jsxDEV("h2", { className: "mt-4 text-2xl font-extrabold", children: "Review your order" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 181
      }, this),
      /* @__PURE__ */ jsxDEV("label", { className: "mt-5 block text-xs text-muted", children: [
        "Name for order (optional)",
        /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", value: buyer, onChange: (e) => setBuyer(e.target.value), placeholder: "Your name" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 322
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 248
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-5 divide-y divide-[#edf0ed]", children: cart.map((x) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 py-4", children: [
        /* @__PURE__ */ jsxDEV("img", { src: x.image, className: "h-14 w-14 rounded-xl object-cover" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 560
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxDEV("b", { children: x.name }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 23,
            columnNumber: 658
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: [
            "\u20B9",
            x.price,
            " each"
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 23,
            columnNumber: 673
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 626
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button secondary !px-2 !py-1", onClick: () => amount(x.id, -1), children: "\u2212" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 23,
            columnNumber: 773
          }, this),
          x.qty,
          /* @__PURE__ */ jsxDEV("button", { className: "fit-button secondary !px-2 !py-1", onClick: () => amount(x.id, 1), children: "+" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 23,
            columnNumber: 873
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 732
        }, this),
        /* @__PURE__ */ jsxDEV("b", { className: "w-20 text-right", children: [
          "\u20B9",
          (x.price * x.qty).toFixed(2)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 971
        }, this)
      ] }, x.id, true, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 503
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 442
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between border-t border-[#e9efea] pt-4 text-lg font-extrabold", children: [
        /* @__PURE__ */ jsxDEV("span", { children: "Total" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 1141
        }, this),
        /* @__PURE__ */ jsxDEV("span", { children: [
          "\u20B9",
          total.toFixed(2)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 1159
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1049
      }, this),
      !cart.length && /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-sm text-muted", children: [
        "Order is empty. ",
        /* @__PURE__ */ jsxDEV("button", { className: "text-[#397651]", onClick: () => setPage("store"), children: "Browse store" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 1267
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1212
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 23,
      columnNumber: 107
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel flex flex-col items-center p-6 text-center", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "UPI payment" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1431
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "mt-4 text-xl font-extrabold", children: "Pay with any UPI app" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1471
      }, this),
      cart.length > 0 && /* @__PURE__ */ jsxDEV("img", { className: "mt-5 h-52 w-52 rounded-xl border border-[#e5ebe6] p-2", alt: "UPI payment QR code", src: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent("upi://pay?pa=" + UPI_ID + "&pn=" + SHOP_NAME + "&am=" + total.toFixed(2) + "&cu=INR") }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1556
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-sm leading-relaxed text-muted", children: "Scan and pay using any UPI app. After paying, tap below to confirm your order." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1820
      }, this),
      /* @__PURE__ */ jsxDEV("button", { disabled: !cart.length, className: "fit-button mt-5 w-full", onClick: confirm, children: [
        "Confirm Order on WhatsApp ",
        /* @__PURE__ */ jsxDEV(ArrowRight, { size: 16, className: "ml-1 inline" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 23,
          columnNumber: 2068
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 1957
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-[10px] text-muted", children: "Payment is not automatically verified." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 2124
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "mt-4 text-xs text-[#397651]", onClick: () => setPage("store"), children: "Continue shopping" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 2209
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 23,
      columnNumber: 1365
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 23,
    columnNumber: 35
  }, this);
  else if (page === "coach") content = /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mb-4 rounded-2xl bg-[#eaf3ed] p-4 text-xs text-[#567060]", children: [
      /* @__PURE__ */ jsxDEV(ShieldCheck, { size: 15, className: "mr-2 inline" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 24,
        columnNumber: 141
      }, this),
      "General wellness ideas only, not medical advice or diagnosis."
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 24,
      columnNumber: 67
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "panel flex h-[min(68vh,680px)] min-h-[450px] flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 border-b border-[#e9efea] p-4", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "metric-icon", children: /* @__PURE__ */ jsxDEV(Sparkles, { size: 20 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 444
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 414
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("b", { children: "Nova" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 24,
            columnNumber: 477
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted", children: "Your steady-step coach" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 24,
            columnNumber: 488
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 472
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "tag ml-auto", children: "AI coach" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 554
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 24,
        columnNumber: 343
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 space-y-4 overflow-y-auto p-5", children: [
        messages.map((m, i) => /* @__PURE__ */ jsxDEV("div", { className: "flex " + (m.role === "user" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed " + (m.role === "user" ? "bg-[#2f7653] text-white" : "bg-[#f1f5f1] dark:bg-[#243431]"), children: m.content }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 761
        }, this) }, i, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 680
        }, this)),
        busy && /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: "Nova is thinking\u2026" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 948
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 24,
        columnNumber: 605
      }, this),
      /* @__PURE__ */ jsxDEV("form", { className: "flex gap-2 border-t border-[#e9efea] p-4", onSubmit: send, children: [
        /* @__PURE__ */ jsxDEV("input", { className: "fit-input", placeholder: "Ask Nova about a small next step\u2026", value: draft, onChange: (e) => setDraft(e.target.value) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 1085
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "fit-button", disabled: busy, children: /* @__PURE__ */ jsxDEV(ArrowRight, { size: 18 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 1263
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 1216
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 24,
        columnNumber: 1010
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 24,
      columnNumber: 256
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 24,
    columnNumber: 32
  }, this);
  else if (page === "pricing") content = /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-2xl text-center", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Flexible by design" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 25,
        columnNumber: 83
      }, this),
      /* @__PURE__ */ jsxDEV("h2", { className: "mt-4 text-4xl font-extrabold", children: "Wellbeing that works for you." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 25,
        columnNumber: 130
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-muted", children: "Start free. Upgrade only when it feels right." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 25,
        columnNumber: 209
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 25,
      columnNumber: 36
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxDEV(Plan, { title: "Free", price: "$0", list: ["Daily wellness dashboard", "Workout library & scheduler", "Food, water, sleep & mood logs", "BMI and nutrition calculators", "PCOD cycle journal"], onClick: () => user ? setPage("dashboard") : (setPage("auth"), setAuthMode("signup")) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 25,
        columnNumber: 361
      }, this),
      /* @__PURE__ */ jsxDEV(Plan, { title: "Premium", price: "$8", list: ["Everything in Free", "Personalized weekly insights", "More Nova coach chats", "More trend history"], premium: true, onClick: () => say("Premium billing isn't configured in this demo") }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 25,
        columnNumber: 624
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 25,
      columnNumber: 295
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-center text-xs text-muted", children: "Premium billing is a preview only; no payment is collected." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 25,
      columnNumber: 845
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 25,
    columnNumber: 34
  }, this);
  const title = (nav.find((x) => x[0] === page) || [null, "Fitnova"])[1];
  return /* @__PURE__ */ jsxDEV("div", { className: (dark ? "dark " : "") + "app min-h-screen", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "mx-auto flex min-h-screen max-w-[1600px]", children: [
      /* @__PURE__ */ jsxDEV("aside", { className: "sidebar flex flex-col gap-6 p-5", children: [
        /* @__PURE__ */ jsxDEV(Brand, { onClick: () => setPage("home") }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 26,
          columnNumber: 231
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted", children: "Your space" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 274
          }, this),
          nav.map(([id, label, I]) => /* @__PURE__ */ jsxDEV("button", { className: "nav-item " + (page === id ? "active" : ""), onClick: () => go(id), children: [
            /* @__PURE__ */ jsxDEV(I, { size: 18 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 484
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: label }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 498
            }, this)
          ] }, id, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 398
          }, this))
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 26,
          columnNumber: 269
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-auto space-y-2", children: [
          /* @__PURE__ */ jsxDEV("button", { className: "nav-item", onClick: () => setSettings(true), children: [
            /* @__PURE__ */ jsxDEV(Settings2, { size: 18 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 631
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: client ? "Supabase connected" : "Connect Supabase" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 653
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 570
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "nav-item", onClick: () => setDark(!dark), children: [
            dark ? /* @__PURE__ */ jsxDEV(Sun, { size: 18 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 787
            }, this) : /* @__PURE__ */ jsxDEV(Moon, { size: 18 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 804
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: dark ? "Light mode" : "Dark mode" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 822
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 723
          }, this),
          user ? /* @__PURE__ */ jsxDEV("button", { className: "nav-item", onClick: signout, children: [
            /* @__PURE__ */ jsxDEV(LogOut, { size: 18 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 928
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: "Sign out" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 947
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 881
          }, this) : /* @__PURE__ */ jsxDEV("button", { className: "nav-item", onClick: () => {
            setPage("auth");
            setAuthMode("login");
          }, children: "Log in" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 978
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mx-2 rounded-2xl bg-[#edf4ee] p-3 text-xs text-[#557160] dark:bg-[#233831]", children: [
            /* @__PURE__ */ jsxDEV(ShieldCheck, { size: 15, className: "mb-2" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1168
            }, this),
            /* @__PURE__ */ jsxDEV("b", { children: "Wellness, your way" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1209
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "mt-1", children: "Not medical advice." }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1234
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 1076
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 26,
          columnNumber: 535
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 26,
        columnNumber: 180
      }, this),
      /* @__PURE__ */ jsxDEV("main", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxDEV("header", { className: "topbar flex items-center justify-between px-8 py-6", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: (/* @__PURE__ */ new Date()).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1406
            }, this),
            /* @__PURE__ */ jsxDEV("h1", { className: "mt-1 text-2xl font-extrabold", children: title }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1525
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 1401
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "hidden rounded-full border border-[#e3eae4] px-3 py-2 text-xs text-muted sm:inline-flex", children: client ? "Supabase connected" : "Sample data \xB7 this device" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1629
            }, this),
            /* @__PURE__ */ jsxDEV("button", { className: "grid h-10 w-10 place-items-center rounded-full bg-[#eaf2ec] text-[#397651]", onClick: () => setDark(!dark), children: dark ? /* @__PURE__ */ jsxDEV(Sun, { size: 17 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1929
            }, this) : /* @__PURE__ */ jsxDEV(Moon, { size: 17 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1946
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1799
            }, this),
            /* @__PURE__ */ jsxDEV("button", { className: "grid h-10 w-10 place-items-center rounded-full bg-[#dcecdf] font-bold text-[#2f7653]", children: user?.name?.[0]?.toUpperCase() || "F" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 26,
              columnNumber: 1973
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 26,
            columnNumber: 1588
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 26,
          columnNumber: 1330
        }, this),
        /* @__PURE__ */ jsxDEV("section", { className: "main-content px-8 pb-10", children: content }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 26,
          columnNumber: 2139
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 26,
        columnNumber: 1297
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 26,
      columnNumber: 122
    }, this),
    /* @__PURE__ */ jsxDEV("nav", { className: "mobile-bottom", children: [nav[0], nav[1], nav[2], nav[8], nav[9]].map(([id, label, I]) => /* @__PURE__ */ jsxDEV("button", { className: "nav-item " + (page === id ? "active" : ""), onClick: () => go(id), "aria-label": label, children: [
      /* @__PURE__ */ jsxDEV(I, { size: 19 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 26,
        columnNumber: 2410
      }, this),
      /* @__PURE__ */ jsxDEV("span", { children: label }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 26,
        columnNumber: 2424
      }, this)
    ] }, id, true, {
      fileName: "<stdin>",
      lineNumber: 26,
      columnNumber: 2305
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 26,
      columnNumber: 2216
    }, this),
    modal,
    toast && /* @__PURE__ */ jsxDEV("div", { className: "toast", children: toast }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 26,
      columnNumber: 2476
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 26,
    columnNumber: 68
  }, this);
}
function Brand({ onClick }) {
  return /* @__PURE__ */ jsxDEV("button", { className: "flex items-center gap-2 text-left", onClick, children: [
    /* @__PURE__ */ jsxDEV("span", { className: "grid h-9 w-9 place-items-center rounded-xl bg-[#2f7653] text-white", children: /* @__PURE__ */ jsxDEV(Activity, { size: 19 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 27,
      columnNumber: 191
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 27,
      columnNumber: 106
    }, this),
    /* @__PURE__ */ jsxDEV("b", { className: "display text-xl", children: [
      "fitnova",
      /* @__PURE__ */ jsxDEV("span", { className: "text-[#58a676", children: "." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 27,
        columnNumber: 257
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 27,
      columnNumber: 219
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 27,
    columnNumber: 34
  }, this);
}
function Stress({ value, onChange }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex gap-2", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxDEV("button", { className: "h-9 flex-1 rounded-lg text-sm font-bold " + (n <= value ? "bg-[#dcecdf] text-[#367950]" : "bg-[#f0f3f0] text-muted"), onClick: () => onChange(n), children: n }, n, false, {
    fileName: "<stdin>",
    lineNumber: 28,
    columnNumber: 95
  }, this)) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 28,
    columnNumber: 42
  }, this);
}
function Mood({ data, update }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "panel p-5", children: [
    /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted", children: [
      "Mood check-in \xB7 ",
      data.mood
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 29,
      columnNumber: 64
    }, this),
    /* @__PURE__ */ jsxDEV("h3", { className: "mt-1 text-lg font-bold", children: "How are you feeling?" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 29,
      columnNumber: 129
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex justify-between", children: [["Low", "\u{1F614}"], ["Okay", "\u{1F610}"], ["Good", "\u{1F642}"], ["Great", "\u{1F31F}"]].map(([m, e]) => /* @__PURE__ */ jsxDEV("button", { onClick: () => update((d) => ({ ...d, mood: m })), className: "rounded-xl p-2 text-center " + (data.mood === m ? "bg-[#eaf3ed]" : ""), children: [
      /* @__PURE__ */ jsxDEV("span", { className: "block", children: e }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 29,
        columnNumber: 441
      }, this),
      /* @__PURE__ */ jsxDEV("small", { children: m }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 29,
        columnNumber: 475
      }, this)
    ] }, m, true, {
      fileName: "<stdin>",
      lineNumber: 29,
      columnNumber: 308
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 29,
      columnNumber: 193
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 29,
    columnNumber: 37
  }, this);
}
function calendar(m) {
  let offset = (new Date(m.getFullYear(), m.getMonth(), 1).getDay() + 6) % 7, total = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), a = Array(offset).fill(null);
  for (let i = 1; i <= total; i++) a.push(i);
  while (a.length % 7) a.push(null);
  return a;
}
function Chart({ values }) {
  let min = Math.min(...values) - 0.3, max = Math.max(...values) + 0.3, pts = values.map((v, i) => 15 + i * 270 / (values.length - 1) + "," + (110 - (v - min) / (max - min) * 82)).join(" ");
  return /* @__PURE__ */ jsxDEV("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 300 132", className: "h-40 w-full", children: [
      /* @__PURE__ */ jsxDEV("line", { x1: "10", y1: "28", x2: "290", y2: "28", stroke: "#e9efea", strokeDasharray: "4 5" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 31,
        columnNumber: 257
      }, this),
      /* @__PURE__ */ jsxDEV("line", { x1: "10", y1: "69", x2: "290", y2: "69", stroke: "#e9efea", strokeDasharray: "4 5" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 31,
        columnNumber: 336
      }, this),
      /* @__PURE__ */ jsxDEV("line", { x1: "10", y1: "110", x2: "290", y2: "110", stroke: "#e9efea", strokeDasharray: "4 5" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 31,
        columnNumber: 415
      }, this),
      /* @__PURE__ */ jsxDEV("polyline", { points: pts, fill: "none", stroke: "#58a676", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 31,
        columnNumber: 496
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 31,
      columnNumber: 206
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between text-[10px] text-muted", children: "Mon Tue Wed Thu Fri Sat Today" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 31,
      columnNumber: 616
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 31,
    columnNumber: 184
  }, this);
}
function Plan({ title, price, list, premium, onClick }) {
  return /* @__PURE__ */ jsxDEV("article", { className: "panel p-6 " + (premium ? "border-[#83ba91] ring-1 ring-[#83ba91]" : ""), children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-xl font-extrabold", children: title }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 184
      }, this),
      premium && /* @__PURE__ */ jsxDEV("span", { className: "tag", children: "Popular" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 245
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 146
    }, this),
    /* @__PURE__ */ jsxDEV("b", { className: "mt-4 block text-4xl", children: [
      price,
      /* @__PURE__ */ jsxDEV("small", { className: "text-sm font-normal text-muted", children: premium ? " / month" : " / forever" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 330
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 288
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-5 space-y-3", children: list.map((x) => /* @__PURE__ */ jsxDEV("p", { className: "text-sm", children: [
      /* @__PURE__ */ jsxDEV(Check, { className: "mr-2 inline text-[#42865d]", size: 15 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 501
      }, this),
      x
    ] }, x, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 470
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 425
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-6 w-full " + (premium ? "" : "secondary"), onClick, children: [
      premium ? "Choose Premium" : "Get started free",
      /* @__PURE__ */ jsxDEV(ArrowRight, { className: "ml-2 inline", size: 15 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 707
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 573
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 32,
    columnNumber: 58
  }, this);
}
function Settings({ url, setUrl, anon, setAnon, connect, close, connected }) {
  let sql = ["create table public.fitnova_user_data (", " user_id uuid primary key references auth.users(id) on delete cascade,", " data jsonb not null default '{}'::jsonb,", " updated_at timestamptz default now()", " );", "alter table public.fitnova_user_data enable row level security;", "create policy Users_manage_own_data on public.fitnova_user_data", " for all using (auth.uid() = user_id)", " with check (auth.uid() = user_id);"];
  return /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 z-50 grid place-items-center bg-[#10221a88] p-4", children: /* @__PURE__ */ jsxDEV("div", { className: "panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
          /* @__PURE__ */ jsxDEV(Settings2, { size: 13, className: "mr-1" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 33,
            columnNumber: 718
          }, this),
          "Data connection"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 33,
          columnNumber: 696
        }, this),
        /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-xl font-extrabold", children: "Connect Supabase" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 33,
          columnNumber: 779
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 691
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: close, children: /* @__PURE__ */ jsxDEV(X, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 874
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 850
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 653
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm text-muted", children: "Project credentials stay in this browser. Tracker data is locally cached too." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 893
    }, this),
    /* @__PURE__ */ jsxDEV("label", { className: "mt-4 block text-xs", children: [
      "Project URL",
      /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", value: url, placeholder: "https://your-project.supabase.co", onChange: (e) => setUrl(e.target.value) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 1062
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 1013
    }, this),
    /* @__PURE__ */ jsxDEV("label", { className: "mt-3 block text-xs", children: [
      "Anon / publishable key",
      /* @__PURE__ */ jsxDEV("input", { className: "fit-input mt-1", value: anon, placeholder: "sb_publishable_...", onChange: (e) => setAnon(e.target.value) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 1261
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 1201
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "fit-button mt-4 w-full", onClick: connect, children: connected ? "Save connection" : "Connect" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 1388
    }, this),
    /* @__PURE__ */ jsxDEV("details", { className: "mt-5 rounded-xl bg-[#f3f6f3] p-4 text-xs dark:bg-[#22322f]", children: [
      /* @__PURE__ */ jsxDEV("summary", { className: "cursor-pointer font-bold", children: "Database table and RLS policy" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 1577
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-muted", children: "Run in Supabase SQL editor. Never use a service-role key in the browser." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 1662
      }, this),
      /* @__PURE__ */ jsxDEV("pre", { className: "mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-[#e7eee8] p-3 text-[10px]", children: sql.join("\n") }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 1769
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-muted", children: "Review row-level security and email confirmation before production." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 1889
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 1497
    }, this),
    !N8N_WEBHOOK_URL && /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-[10px] text-muted", children: "Order webhook is not configured. Set N8N_WEBHOOK_URL in app.jsx to enable background notifications." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 2020
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 33,
    columnNumber: 581
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 33,
    columnNumber: 502
  }, this);
}
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 34,
  columnNumber: 52
}));
