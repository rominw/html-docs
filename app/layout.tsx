import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "https://html-notes.local";
  const image = new URL("/og.png", origin).toString();

  return {
    title: {
      default: "HTML 笔记",
      template: "%s · HTML 笔记",
    },
    description: "以原生 HTML 保存和发布的个人文章站。",
    openGraph: {
      title: "HTML 笔记",
      description: "原样保存，自由表达。",
      images: [{ url: image, width: 1707, height: 907, alt: "HTML 笔记" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "HTML 笔记",
      description: "原样保存，自由表达。",
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
