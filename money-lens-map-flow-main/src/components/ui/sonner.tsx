import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-white group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-green-600 group-[.toast]:text-white group-[.toast]:border-green-700 group-[.toast]:rounded-md",
          cancelButton: "group-[.toast]:bg-gray-600 group-[.toast]:text-white group-[.toast]:border-gray-700 group-[.toast]:rounded-md",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
