"use client";

import { useEffect } from "react";
import { site } from "@/content/site";

/** A hello for the developers who open DevTools. */
export function ConsoleGreeting() {
  useEffect(() => {
    console.log(
      `%c${site.name.toUpperCase()}%c\n\nYou opened the console, so you're my kind of person.\nThe particles are a GPU simulation: positions and velocities live in float textures.\nSay hi: ${site.email}`,
      "font: 700 42px/1 system-ui, sans-serif; color: #d4ff3a; letter-spacing: -2px;",
      "font: 12px/1.6 ui-monospace, monospace; color: #8b8b85;",
    );
  }, []);
  return null;
}
