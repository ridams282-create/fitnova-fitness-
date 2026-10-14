import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUp, Check, MessageCircle, Minus, ThumbsDown, ThumbsUp, X } from "lucide-react";
const welcome = "Hi! I am the Fitnova Assistant. Ask me anything about using the website. Fitnova is for wellness tracking, not medical advice.";
const chips = ["Login help", "How calculators work", "Find a workout", "Log food or water", "Place an order", "Pricing and plans", "Talk to Nova", "Report a bug", "Contact support"];
const chipIds = { "login help": 5, "how calculators work": 20, "find a workout": 27, "log food or water": 42, "place an order": 73, "pricing and plans": 85, "talk to nova": 92, "report a bug": 109, "contact support": 115 };
const pages = { home: "Home", auth: "Login / sign up", dashboard: "Dashboard", workouts: "Workouts", schedule: "Schedule", nutrition: "Food log", trackers: "Trackers", pcod: "PCOD tracker", calculators: "Calculators", store: "Store", checkout: "Checkout", coach: "Nova coach", pricing: "Pricing" };
const hints = { home: "From Home you can sign up, log in, explore workouts, or compare plans. Use the navigation after signing in to open trackers, calculators, Nova and the store.", dashboard: "Your Dashboard brings today's workout, calories, protein, water, sleep, mood and streak together. Log an entry to replace its sample data.", workouts: "Browse by level. Open a workout to watch it, or use the calendar button to schedule it.", schedule: "Choose a date and workout, then add it to your calendar. Select a scheduled workout to remove it.", nutrition: "Use Add a meal to log food manually. Add a glass to record water. Nutrition values are estimates.", trackers: "Log weight or sleep here, and use the mood and stress check-ins to note patterns. These tools do not diagnose conditions.", pcod: "Use this journal to record cycle dates and symptoms. It does not diagnose PCOD or PCOS; a doctor can help with concerns.", calculators: "Choose a calculator and enter the requested details. Results are general estimates, not medical advice or targets.", store: "Check a product's listed price and nutrition, then choose Order now to review it in checkout.", checkout: "Review the total, pay in your own UPI app, then confirm through WhatsApp. Never share your UPI PIN or OTP.", pricing: "The Pricing page compares Free and Premium. Some plan and billing details are not in the support guide; I can connect you with support.", coach: "Nova is Fitnova's separate AI coach for general workout ideas, meal ideas and motivation. Nova is not a medical professional.", auth: "Use the Login or Sign Up form here. Check your email spelling and connection if login fails. Never share your password or OTP." };
const stop = new Set("a about all an and are as at be can do does for from get how i in is it me my of on or the this to what with website fitnova help tell show explain work works use using page please".split(" "));
const tokens = (s) => String(s || "").toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 1 && !stop.has(t)) || [];
function answerFor(text, entries, page) {
  const q = text.toLowerCase();
  if (/suicid|kill myself|hurt myself|self.?harm|want to die|end my life|starv|purging|purge|anorexi|bulimi|eating disorder|very low weight|restricting food|binge eating|afraid to eat|throw up after eating|laxative abuse/.test(q)) return { text: "I am really sorry you are dealing with this. You deserve support right now. Please reach out to someone you trust, and contact local emergency services or a crisis helpline in your country if you may be in immediate danger. I will stay here with you. I can't give weight or calorie targets, but I can listen while you connect with real-world support." };
  if (/password|one.?time password|\botp\b|upi pin|card number|cvv|security code/.test(q)) return { text: "Please do not share passwords, OTPs, UPI PINs, or card details here. Fitnova Assistant will never ask for them. If you shared payment details, contact your bank or payment provider directly." };
  if (/diagnos|what disease|do i have|medicine|medication|dosage|dose|pregnan|injur|chest pain|medical advice|symptom/.test(q)) return { text: "I can't diagnose a condition or advise on medication or treatment. Please speak with a qualified doctor or pharmacist. Fitnova is for wellness tracking, not medical advice." };
  if (/meal idea|what should i eat|diet plan|workout plan|exercise plan|fitness advice|training plan|motivation|meal plan/.test(q)) return { text: "For general workout, meal and motivation ideas, please ask Nova, the separate AI fitness coach. Nova isn't a doctor or dietitian.", nova: true };
  if (/cricket|weather|stock price|politic|unrelated/.test(q)) return { text: "I can only help with Fitnova. Is something on the website giving you trouble?" };
  const forced = Object.entries(chipIds).find(([phrase]) => q.includes(phrase));
  let entry = forced ? entries.find((e) => e.id === forced[1]) : null;
  if (!entry) {
    const words = [...new Set(tokens(text))];
    let best = 0;
    for (const e of entries) {
      const title = tokens(e.question), body = tokens(e.answer);
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += 3;
        else if (body.includes(w)) score += 1;
      }
      if (e.category === page) score += 0.7;
      if (score > best) {
        best = score;
        entry = e;
      }
    }
    if (best < (words.length > 5 ? 2 : 1.5)) entry = null;
  }
  if (entry && entry.needsSupport) return { text: "I don't have that detail in my support guide, and I don't want to guess. Let me connect you with our team.", showForm: true };
  if (entry) {
    let text2 = entry.answer;
    if (entry.id === 5) text2 += " I can never see or ask for your password.";
    if (entry.id === 20 || entry.id === 23) text2 += " These are estimates, not medical advice or targets.";
    return { text: text2, entry };
  }
  if (hints[page] && /this page|here|where|this screen|what can i do|what is this|help me/.test(q)) return { text: hints[page] };
  return { text: "I'm not sure about that, and I don't want to guess. Let me connect you with our team.", showForm: true };
}
function Assistant() {
  const [open, setOpen] = useState(false), [page, setPage] = useState(document.body.dataset.fitnovaPage || "home"), [dark, setDark] = useState(document.body.dataset.fitnovaDark === "true"), [entries, setEntries] = useState([]), [messages, setMessages] = useState([{ id: 1, role: "assistant", text: welcome, quick: true }]), [draft, setDraft] = useState(""), [busy, setBusy] = useState(false), [support, setSupport] = useState(false), [ticket, setTicket] = useState(null), [issue, setIssue] = useState("Website problem"), [description, setDescription] = useState(""), [screenshot, setScreenshot] = useState(""), [votes, setVotes] = useState({}), [feedback, setFeedback] = useState({});
  const scroll = useRef(null);
  useEffect(() => {
    fetch("chatbot-knowledge.json").then((r) => {
      if (!r.ok) throw Error();
      return r.json();
    }).then((d) => setEntries(d.entries || [])).catch(() => setEntries([]));
    const observer = new MutationObserver(() => {
      setPage(document.body.dataset.fitnovaPage || "home");
      setDark(document.body.dataset.fitnovaDark === "true");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-fitnova-page", "data-fitnova-dark"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (open && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [messages, open, support, ticket]);
  function reply(text) {
    const result = answerFor(text, entries, page);
    setMessages((v) => [...v, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", ...result }]);
    if (result.showForm) setSupport(true);
  }
  function submit(e) {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    const text = draft.trim();
    setDraft("");
    setBusy(true);
    setTimeout(() => {
      reply(text);
      setBusy(false);
    }, 120);
  }
  function quick(text) {
    const id = chipIds[text.toLowerCase()];
    if (text === "Contact support" || text === "Report a bug") {
      reply(text);
      setSupport(true);
      return;
    }
    if (text === "Talk to Nova") {
      setMessages((v) => [...v, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", text: "Nova is the AI fitness coach for general workout ideas, meal ideas, habit tips and motivation. Nova is not a doctor or certified trainer.", nova: true }]);
      return;
    }
    const item = entries.find((x) => x.id === id);
    setMessages((v) => [...v, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", text: item ? item.answer : "I couldn't load the support guide just now. Please try again or contact support.", entry: item }]);
  }
  function openNova() {
    window.dispatchEvent(new CustomEvent("fitnova:navigate", { detail: { page: "coach" } }));
    setOpen(false);
  }
  function createTicket(e) {
    e.preventDefault();
    if (!description.trim()) return;
    const tickets = JSON.parse(localStorage.getItem("fitnova-support-tickets") || "[]"), id = "SUPPORT-" + (1042 + tickets.length);
    tickets.push({ id, issue, description: description.trim(), screenshot: screenshot || null, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    localStorage.setItem("fitnova-support-tickets", JSON.stringify(tickets));
    setTicket(id);
    setSupport(false);
    setDescription("");
    setScreenshot("");
    setMessages((v) => [...v, { id: Date.now(), role: "assistant", text: "Ticket " + id + " created. This prototype keeps tickets on this device; it is not connected to a support inbox." }]);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "fit-chat " + (dark ? "fit-chat-dark" : ""), children: [
    /* @__PURE__ */ jsxDEV("button", { className: "fit-chat-launch " + (open ? "is-open" : ""), onClick: () => setOpen(!open), "aria-label": open ? "Close Fitnova Assistant" : "Open Fitnova Assistant", title: "Fitnova Assistant", children: [
      open ? /* @__PURE__ */ jsxDEV(X, { size: 21 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 253
      }, this) : /* @__PURE__ */ jsxDEV(MessageCircle, { size: 22 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 268
      }, this),
      /* @__PURE__ */ jsxDEV("span", { children: open ? "" : "Help" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 295
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 64
    }, this),
    open && /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("button", { className: "fit-chat-backdrop", onClick: () => setOpen(false), "aria-label": "Close chat" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 342
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "fit-chat-panel", "aria-label": "Fitnova Assistant chat", children: [
        /* @__PURE__ */ jsxDEV("header", { className: "fit-chat-head", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-mark", children: [
            "f",
            /* @__PURE__ */ jsxDEV("span", { children: "." }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 572
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 540
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-heading", children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "Fitnova Assistant" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 626
            }, this),
            /* @__PURE__ */ jsxDEV("small", { children: [
              "Website help \xB7 On ",
              pages[page] || "Fitnova"
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 660
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 592
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-chat-icon", onClick: () => setOpen(false), "aria-label": "Minimize chat", children: /* @__PURE__ */ jsxDEV(Minus, { size: 18 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 813
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 723
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 506
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-feed", ref: scroll, "aria-live": "polite", children: messages.map((m) => /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-row " + m.role, children: [
          /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-bubble", children: [
            m.text,
            m.nova && /* @__PURE__ */ jsxDEV("button", { className: "fit-chat-nova", onClick: openNova, children: [
              "Open Nova ",
              /* @__PURE__ */ jsxDEV("span", { children: "\u2197" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1093
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 1030
            }, this),
            m.showForm && /* @__PURE__ */ jsxDEV("button", { className: "fit-chat-contact", onClick: () => setSupport(true), children: "Contact support" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 1130
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 980
          }, this),
          m.quick && /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-chips", children: chips.map((c) => /* @__PURE__ */ jsxDEV("button", { onClick: () => quick(c), children: c }, c, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 1285
          }, this)) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 1239
          }, this),
          m.role === "assistant" && !m.quick && /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-rating", children: [
              /* @__PURE__ */ jsxDEV("span", { children: votes[m.id] ? "Thanks for the feedback" : "Was this helpful?" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1413
              }, this),
              /* @__PURE__ */ jsxDEV("button", { "aria-label": "Helpful", className: votes[m.id] === "up" ? "chosen" : "", onClick: () => setVotes((v) => ({ ...v, [m.id]: "up" })), children: /* @__PURE__ */ jsxDEV(ThumbsUp, { size: 14 }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1605
              }, this) }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1485
              }, this),
              /* @__PURE__ */ jsxDEV("button", { "aria-label": "Not helpful", className: votes[m.id] === "down" ? "chosen" : "", onClick: () => setVotes((v) => ({ ...v, [m.id]: "down" })), children: /* @__PURE__ */ jsxDEV(ThumbsDown, { size: 14 }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1763
              }, this) }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1635
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 1380
            }, this),
            votes[m.id] === "down" && /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-feedback", children: [
              "What went wrong? ",
              /* @__PURE__ */ jsxDEV("select", { value: feedback[m.id] || "Unclear", onChange: (e) => setFeedback((v) => ({ ...v, [m.id]: e.target.value })), children: [
                /* @__PURE__ */ jsxDEV("option", { children: "Wrong answer" }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 32,
                  columnNumber: 1979
                }, this),
                /* @__PURE__ */ jsxDEV("option", { children: "Not helpful" }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 32,
                  columnNumber: 2008
                }, this),
                /* @__PURE__ */ jsxDEV("option", { children: "Unclear" }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 32,
                  columnNumber: 2036
                }, this)
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 1876
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 1824
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 1378
          }, this)
        ] }, m.id, true, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 929
        }, this)) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 849
        }, this),
        ticket && /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-ticket", children: [
          /* @__PURE__ */ jsxDEV(Check, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2136
          }, this),
          " Latest ticket: ",
          ticket,
          /* @__PURE__ */ jsxDEV("button", { onClick: () => setTicket(null), "aria-label": "Dismiss", children: /* @__PURE__ */ jsxDEV(X, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2237
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2178
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 2103
        }, this),
        support && /* @__PURE__ */ jsxDEV("form", { className: "fit-chat-support", onSubmit: createTicket, children: [
          /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-support-top", children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "Contact support" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 2374
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setSupport(false), "aria-label": "Close support form", children: /* @__PURE__ */ jsxDEV(X, { size: 16 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 2492
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 2406
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2336
          }, this),
          /* @__PURE__ */ jsxDEV("label", { children: [
            "Issue type",
            /* @__PURE__ */ jsxDEV("select", { value: issue, onChange: (e) => setIssue(e.target.value), children: [
              /* @__PURE__ */ jsxDEV("option", { children: "Website problem" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 2599
              }, this),
              /* @__PURE__ */ jsxDEV("option", { children: "Login or account" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 2631
              }, this),
              /* @__PURE__ */ jsxDEV("option", { children: "Bug report" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 2664
              }, this),
              /* @__PURE__ */ jsxDEV("option", { children: "Order or payment" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 2691
              }, this),
              /* @__PURE__ */ jsxDEV("option", { children: "Other question" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 32,
                columnNumber: 2724
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 2538
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2521
          }, this),
          /* @__PURE__ */ jsxDEV("label", { children: [
            "What happened?",
            /* @__PURE__ */ jsxDEV("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Describe the issue and which page you were on.", maxLength: 1200, required: true }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 2793
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2772
          }, this),
          /* @__PURE__ */ jsxDEV("label", { className: "fit-chat-file", children: [
            "Screenshot (optional; filename only in this prototype)",
            /* @__PURE__ */ jsxDEV("input", { type: "file", accept: "image/*", onChange: (e) => setScreenshot(e.target.files?.[0]?.name || "") }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 3051
            }, this),
            screenshot && /* @__PURE__ */ jsxDEV("small", { children: screenshot }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 3160
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 2964
          }, this),
          /* @__PURE__ */ jsxDEV("small", { className: "fit-chat-privacy", children: "Don't include passwords, OTPs, UPI PINs or card details. Tickets are stored on this device in this prototype." }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 3196
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "fit-chat-sendticket", type: "submit", children: [
            "Create ticket ",
            /* @__PURE__ */ jsxDEV(ArrowUp, { size: 15 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 32,
              columnNumber: 3417
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 3349
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 2277
        }, this),
        /* @__PURE__ */ jsxDEV("form", { className: "fit-chat-compose", onSubmit: submit, children: [
          /* @__PURE__ */ jsxDEV("input", { value: draft, onChange: (e) => setDraft(e.target.value), placeholder: "Ask how to use Fitnova\u2026", "aria-label": "Message Fitnova Assistant" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 3507
          }, this),
          /* @__PURE__ */ jsxDEV("button", { disabled: !draft.trim() || busy, "aria-label": "Send message", children: /* @__PURE__ */ jsxDEV(ArrowUp, { size: 18 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 3710
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 32,
            columnNumber: 3645
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 3454
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "fit-chat-disclaimer", children: "Support assistant \xB7 Not medical advice" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 32,
          columnNumber: 3746
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 32,
        columnNumber: 434
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 32,
      columnNumber: 340
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 32,
    columnNumber: 9
  }, this);
}
createRoot(document.getElementById("assistant-root")).render(/* @__PURE__ */ jsxDEV(Assistant, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 34,
  columnNumber: 62
}));
