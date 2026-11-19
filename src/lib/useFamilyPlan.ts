"use client";
import { useEffect, useRef, useState } from "react";
import { useStored } from "@/lib/useStored";
import { createFamily, getPlan, isValidCode, normalizeCode, savePlan, type Tool } from "@/lib/familyCode";

// One code per family, kept once on this device and reused by every planning tool.
export const FAMILY_CODE_KEY = "burland-family-code";

export type SyncStatus = "idle" | "saving" | "saved" | "offline";

export interface FamilyState {
  code: string;
  status: SyncStatus;
  msg: string;
  busy: boolean;
  create: () => void;
  join: (raw: string) => void;
  leave: () => void;
  setMsg: (m: string) => void;
}

/**
 * Local state for a planning tool that also syncs to the family's shared plan when this device
 * has a family code. Edits save ~1s after typing stops; other households' edits arrive by polling.
 */
export function useFamilyPlan<T>(tool: Tool, localKey: string, initial: T) {
  const [s, setS, ready] = useStored<T>(localKey, initial);
  const [code, setCode, codeReady] = useStored<string>(FAMILY_CODE_KEY, "");
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const version = useRef(0);
  const linked = useRef(false); // true once this tool's plan is loaded from (or created on) the server
  const synced = useRef(""); // JSON of the plan as last seen on the server
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);
  const latest = useRef(s);
  latest.current = s;

  const applyRemote = (data: T, v: number) => {
    version.current = v;
    synced.current = JSON.stringify(data);
    setS(data);
  };

  const push = async (c: string, plan: T) => {
    if (saving.current) return;
    const json = JSON.stringify(plan);
    saving.current = true;
    try {
      const r = await savePlan(c, tool, plan, version.current);
      if (r.ok) { version.current = r.version; synced.current = json; setStatus("saved"); }
      else if (r.data) { applyRemote(r.data, r.version); setStatus("saved"); setMsg("Someone else just updated this plan, so you're seeing their latest. Re-enter your last change if it's missing."); }
    } catch { setStatus("offline"); }
    finally { saving.current = false; }
  };

  // Load this tool's plan for a code. If the family hasn't started this tool yet, share what's on this device.
  const link = async (raw: string) => {
    const r = await getPlan<T>(raw, tool);
    if (r.data) applyRemote(r.data, r.version);
    else { version.current = 0; synced.current = ""; await push(normalizeCode(raw), latest.current); }
    linked.current = true;
    setStatus("saved");
  };

  const join = async (raw: string, quiet = false) => {
    if (!isValidCode(raw)) { setMsg("That code doesn't look right. It's 8 letters and numbers, like K7QM-R2XD."); return; }
    setBusy(true);
    if (!quiet) setMsg("");
    try {
      await link(raw);
      setCode(normalizeCode(raw));
      if (!quiet) setMsg("You're in! Everyone with this family code sees the same plan.");
    } catch (e) {
      if ((e as { notFound?: boolean }).notFound) setMsg("We couldn't find that family code. Double-check it with whoever shared it.");
      else { setStatus("offline"); setMsg("Couldn't reach the server. Check your connection and try again."); }
    } finally { setBusy(false); }
  };

  const create = async () => {
    setBusy(true); setMsg("");
    try {
      const c = await createFamily(tool, s);
      version.current = 1;
      synced.current = JSON.stringify(s);
      linked.current = true;
      setCode(c);
      setStatus("saved");
      setMsg("Family code created. Share it so everyone can add to your plans. The same code works for meals, what to bring, and the itinerary.");
    } catch { setMsg("Couldn't create a code right now. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  const leave = () => {
    if (!confirm("Stop syncing on this device? Your family's plans stay saved under the code, and you can rejoin anytime.")) return;
    const old = code;
    setCode(""); setStatus("idle");
    version.current = 0; synced.current = ""; linked.current = false;
    setMsg(`Stopped syncing. Rejoin anytime with code ${old.slice(0, 4)}-${old.slice(4)}.`);
  };

  // Join from a share link (?family=CODE), or reconnect with the code saved on this device.
  useEffect(() => {
    if (!ready || !codeReady) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("family");
    if (fromUrl) {
      params.delete("family");
      const q = params.toString();
      history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
    }
    if (fromUrl && normalizeCode(fromUrl) !== code) join(fromUrl);
    else if (code) join(code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, codeReady]);

  // Save edits shortly after typing stops.
  useEffect(() => {
    if (!code || !linked.current) return;
    if (JSON.stringify(s) === synced.current) return;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { timer.current = null; push(code, latest.current); }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, code]);

  // Pick up other households' changes, and retry after being offline.
  useEffect(() => {
    if (!code) return;
    const tick = async () => {
      if (document.hidden || saving.current || timer.current) return;
      try {
        if (!linked.current) { await link(code); return; }
        if (JSON.stringify(latest.current) !== synced.current) { await push(code, latest.current); return; }
        const r = await getPlan<T>(code, tool);
        if (r.data && r.version > version.current) applyRemote(r.data, r.version);
        setStatus("saved");
      } catch { setStatus("offline"); }
    };
    const id = setInterval(tick, 10000);
    window.addEventListener("focus", tick);
    return () => { clearInterval(id); window.removeEventListener("focus", tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const family: FamilyState = { code, status, msg, busy, create, join: (r) => join(r), leave, setMsg };
  return [s, setS, ready, family] as const;
}
