import type { Metadata } from "next";
import "./globals.css";
import { fontSans, fontHeading } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "seren",
  description: "Web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", fontSans.variable, fontHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
