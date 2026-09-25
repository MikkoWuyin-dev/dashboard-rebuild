"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { navItems } from "@/components/nav-main"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

type Ctx = { open: boolean; setOpen: (open: boolean) => void }

const CommandPaletteContext = React.createContext<Ctx | null>(null)

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error("useCommandPalette must be used inside CommandPaletteProvider")
  }
  return ctx
}

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      setOpen((prev) => !prev)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const value = React.useMemo(() => ({ open, setOpen }), [open])
  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  )
}

// Rendered inside the header, where the reference keeps it: closed, the dialog
// contributes only its screen-reader title and description, which is exactly
// what the reference's markup has on every page. The panel itself is portalled
// and only exists while open, so this adds nothing to the captured page.
export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()

  const run = React.useCallback(
    (action: () => void) => {
      setOpen(false)
      action()
    },
    [setOpen],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Jump to a page in the dashboard."
    >
      {/* The generated CommandDialog drops its children straight into the
          dialog without a Command root, and cmdk's list, input and items all
          read from that root's store -- without it opening the palette throws
          on an undefined store. */}
      <Command>
      <CommandInput placeholder="Jump to a page in the dashboard." />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        <CommandGroup heading="Pages">
          {navItems.map((item) => (
            <CommandItem
              key={item.href}
              value={item.title}
              onSelect={() => run(() => router.push(item.href))}
            >
              <item.icon />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            value="Toggle theme"
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            Toggle theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  )
}
