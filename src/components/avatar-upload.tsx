"use client"

import * as React from "react"
import { Upload } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AvatarUpload({ src, fallback }: { src: string; fallback: string }) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [filename, setFilename] = React.useState("mia-ward.png")
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const take = (file: File | undefined) => {
    if (!file) return
    setFilename(file.name)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="flex items-start gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        tabIndex={-1}
        aria-label="Upload avatar file"
        onChange={(e) => take(e.target.files?.[0])}
      />
      <div className="relative">
        <button
          type="button"
          aria-label="Change avatar"
          data-dragging={dragging}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            take(e.dataTransfer.files?.[0])
          }}
          className="relative isolate shrink-0 rounded-full border-transparent bg-muted ring-[3px] ring-transparent outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 data-[dragging=true]:bg-accent data-[dragging=true]:ring-primary/50"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 flex origin-center items-center justify-center rounded-full bg-accent/50 opacity-0 backdrop-blur-xs transition-all duration-300"
          >
            <Upload className="size-4 text-accent-foreground duration-300" />
          </div>
          {/* In flow inside the button, not layered over it: the button has no
              size of its own, so the avatar is what gives it one. Positioning
              the avatar absolutely collapsed the button's muted circle. */}
          <Avatar size="lg" className="pointer-events-none bg-transparent">
            <AvatarImage
              src={preview ?? src}
              alt={filename}
              className="aspect-square size-full rounded-full object-cover object-center"
            />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <p className="font-medium">Upload Image</p>
          <span className="text-sm text-muted-foreground">
            Min 300x430px, PNG or JPEG
          </span>
        </div>
        <div className="flex">
          <Button
            variant="destructive"
            size="sm"
            aria-label="Remove image"
            onClick={() => {
              setPreview(null)
              setFilename("mia-ward.png")
            }}
          >
            Remove
          </Button>
        </div>
        <span className="sr-only" aria-live="polite">
          {filename}
        </span>
      </div>
    </div>
  )
}
