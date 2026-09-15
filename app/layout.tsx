import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
    title: { default: "FresherDesk — Learn. Build. Get Hired.", template: "%s | FresherDesk" },
    description: "Explore learning paths, build real projects and discover your next career opportunity with FresherDesk.",
    icons: {
        icon: [
            { url: "/images/favicon-512x512.png", sizes: "512x512", type: "image/png" },
            { url: "/favicon.ico" }
        ],
        apple: "/images/favicon-512x512.png"
    }
};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
