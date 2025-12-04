
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-900 group-[.toaster]:border-emerald-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-emerald-950 dark:group-[.toaster]:text-emerald-100 dark:group-[.toaster]:border-emerald-800",
          description: "group-[.toast]:text-emerald-700 dark:group-[.toast]:text-emerald-300",
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white hover:group-[.toast]:bg-emerald-700",
          cancelButton:
            "group-[.toast]:bg-emerald-100 group-[.toast]:text-emerald-800 dark:group-[.toast]:bg-emerald-900 dark:group-[.toast]:text-emerald-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
