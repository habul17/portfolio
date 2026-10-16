"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { navigateWithTransition } from "@/components/providers/Transition";

type Props = ComponentProps<typeof Link> & { href: string; transitionLabel?: string };

/** A Next <Link> that plays the page transition. Modified clicks still open new tabs. */
export function TransitionLink({ href, transitionLabel, onClick, ...props }: Props) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigateWithTransition(href, transitionLabel);
  };
  return <Link href={href} onClick={handle} {...props} />;
}
