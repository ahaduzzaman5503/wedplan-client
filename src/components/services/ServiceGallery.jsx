"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ServiceGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                index === active
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
