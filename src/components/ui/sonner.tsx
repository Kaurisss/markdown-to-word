import {
  CheckCircleLine,
  InformationLine as InfoIcon,
  LoadingLine as Loader2Icon,
  CloseCircleLine,
  AlertLine as TriangleAlertIcon,
} from "@mingcute/react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircleLine className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <CloseCircleLine className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": theme === "dark" ? "#27272a" : "#ffffff",
          "--normal-text": theme === "dark" ? "#f3f4f6" : "#111827",
          "--normal-border": theme === "dark" ? "#3f3f46" : "#e5e7eb",
          "--border-radius": "0.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
