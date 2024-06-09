import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

const defaultFont = Syne({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Barbell Labs",
	description: "Barbell Labs aims to integrate into your existing workflows with nifty automations in Slack, Discord, Telegram, Instagram, and WhatsApp",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={defaultFont.className}>{children}</body>
		</html>
	);
}
