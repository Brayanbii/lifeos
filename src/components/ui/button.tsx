import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-lg font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.95] active:brightness-90 shadow-sm relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary/90 to-purple-600/90 text-white hover:brightness-110 hover:shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
        destructive: "bg-gradient-to-br from-destructive/90 to-red-600/90 text-white hover:brightness-110 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
        outline: "border border-white/20 bg-white/5 hover:bg-white/10 text-foreground backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
        secondary: "bg-white/10 text-foreground hover:bg-white/20 backdrop-blur-md border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
        ghost: "hover:bg-white/10 text-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-5 py-3",
        sm: "h-11 rounded-xl px-4 text-base",
        lg: "h-16 rounded-[2rem] px-8 text-xl",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
