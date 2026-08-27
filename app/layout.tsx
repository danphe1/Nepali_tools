import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "नेपाल टुल्स | Nepali Tools", description: "Nepali daily tools, live quizzes and trusted Nepal news." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ne"><body>{children}</body></html>;
}
