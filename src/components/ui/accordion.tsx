"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

type AccordionProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
>;

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(function Accordion({ className = "", ...props }, ref) {
  return <AccordionPrimitive.Root ref={ref} className={className} {...props} />;
});

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className = "", ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={[
        "border-b",
        "border-[color:rgba(0,0,0,0.08)] dark:border-[color:rgba(255,255,255,0.1)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
});

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className = "", children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={[
          "group inline-flex w-full items-center justify-between py-6 text-left",
          "font-medium",
          "transition-colors",
          "hover:text-[var(--theme-primary)]",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
        <svg
          className="ml-4 h-5 w-5 shrink-0 text-[var(--theme-accent)] transition-transform duration-200 group-data-[state=open]:rotate-90"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className = "", children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={[
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-base text-[color:var(--theme-text)]",
        className,
      ].join(" ")}
      {...props}
    >
      <div className="pb-6 text-lg opacity-90">{children}</div>
    </AccordionPrimitive.Content>
  );
});
