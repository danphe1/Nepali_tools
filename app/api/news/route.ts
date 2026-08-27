import { NextResponse } from "next/server";

export const revalidate = 900;
const publishers = [
  ["Onlinekhabar", "onlinekhabar.com"], ["Setopati", "setopati.com"], ["Kantipur", "ekantipur.com"],
  ["Baahrakhari", "baahrakhari.com"], ["TechPana", "techpana.com"]
];
const decode = (value: string) => value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const tag = (xml: string, name: string) => new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(xml)?.[1] ?? "";

export async function GET() {
  try {
    const entries = await Promise.all(publishers.map(async ([source, domain]) => {
      const url = `https://news.google.com/rss/search?q=site%3A${domain}%20when%3A2d&hl=ne&gl=NP&ceid=NP%3Ane`;
      const response = await fetch(url, { next: { revalidate: 900 }, headers: { "User-Agent": "NepaliTools/1.0" } });
      if (!response.ok) return null;
      const first = response.text ? await response.text() : "";
      const item = /<item>([\s\S]*?)<\/item>/i.exec(first)?.[1] ?? "";
      const title = decode(tag(item, "title")).replace(/\s+-\s+[^-]+$/, "");
      const link = decode(tag(item, "link"));
      return title && link ? { source, title, url: link } : null;
    }));
    return NextResponse.json(entries.filter(Boolean), { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch { return NextResponse.json([]); }
}
