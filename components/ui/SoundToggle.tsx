"use client";

import { useEffect } from "react";
import { ambient } from "@/lib/audio";
import { useUI } from "@/lib/store";
import { cx } from "@/lib/utils";

/** Ambient drone on/off. Off by default; browsers only allow audio after a click anyway. */
export function SoundToggle({ className }: { className?: string }) {
  const sound = useUI((s) => s.sound);
  const setSound = useUI((s) => s.setSound);

  useEffect(() => {
    void ambient.setEnabled(sound);
  }, [sound]);

  return (
    <button
      type="button"
      onClick={() => setSound(!sound)}
      className={cx("group flex items-center gap-2.5 py-2", className)}
      aria-pressed={sound}
      aria-label={sound ? "Turn sound off" : "Turn sound on"}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cx("sound-bar w-[2px] rounded-full bg-current", sound && "is-on")}
            style={{ animationDelay: `${i * 0.13}s` }}
          />
        ))}
      </span>
      <span className="mono-label">Sound {sound ? "on" : "off"}</span>
    </button>
  );
}
