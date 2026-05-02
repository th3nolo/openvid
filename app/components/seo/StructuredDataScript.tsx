"use client";

import { useServerInsertedHTML } from "next/navigation";

type StructuredDataScriptProps = {
  id: string;
  json: string;
};

export function StructuredDataScript({ id, json }: StructuredDataScriptProps) {
  useServerInsertedHTML(() => (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  ));

  return null;
}
