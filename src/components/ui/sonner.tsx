
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
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-3 w-full p-4 rounded-lg border shadow-lg bg-emerald-50 text-emerald-900 border-emerald-300",
          title: "font-medium text-emerald-900",
          description: "text-emerald-700 text-sm",
          actionButton:
            "bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700",
          cancelButton:
            "bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-sm",
          closeButton: "text-emerald-600 hover:text-emerald-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
