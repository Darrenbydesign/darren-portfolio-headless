import type {
  DetailStat,
  ProgressItem,
  RichTextNode,
  StrapiMedia,
} from "./types";

const COVER_SIZES = new Set(["small", "medium", "large", "zen"]);

export function formatDate(dateValue?: string) {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateValue));
}

export function extractText(nodes?: RichTextNode[]) {
  if (!Array.isArray(nodes)) return "";

  return nodes
    .map((node) => {
      if (typeof node.text === "string") return node.text;
      return extractText(node.children);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractListItems(nodes?: RichTextNode[]) {
  if (!Array.isArray(nodes)) return [];

  return nodes
    .filter((node) => node.type === "list")
    .flatMap((node) => node.children ?? [])
    .map((item) => extractText(item.children))
    .filter(Boolean);
}

export function getPreviewText(text: string, length = 160) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

export function getCoverSize(value?: string) {
  return value && COVER_SIZES.has(value) ? value : "medium";
}

export function unwrapMedia(media?: StrapiMedia | null) {
  if (!media) return undefined;
  if (media.data) return unwrapMedia(media.data);
  return media.attributes ? { ...media.attributes, id: media.id } : media;
}

export function getMediaUrl(media: StrapiMedia | undefined, origin: string) {
  const normalized = unwrapMedia(media);
  const url = normalized?.url?.trim();

  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function normalizeMediaList(
  media?: StrapiMedia[] | { data?: StrapiMedia[] },
) {
  const items = Array.isArray(media) ? media : media?.data;
  return (items ?? []).map(unwrapMedia).filter(Boolean) as StrapiMedia[];
}

export function normalizeStats(stats?: DetailStat[]) {
  const normalized = (stats ?? [])
    .map((item) => ({
      label: item.label?.trim() ?? "",
      value: item.value?.trim() ?? "",
    }))
    .filter((item) => item.label && item.value);

  return normalized.length
    ? normalized
    : [
        { label: "Role", value: "UX Designer/Product Designer" },
        { label: "Duration", value: "1 month" },
        { label: "Industry", value: "Design" },
        { label: "Scope", value: "Internal Product" },
        { label: "Team", value: "Product, Engineering, Stakeholders" },
      ];
}

export function normalizeProgress(items?: ProgressItem[]) {
  const normalized = (items ?? [])
    .map((item) => ({
      label: item.label?.trim() ?? "",
      percentage: clampPercentage(item.percentage),
    }))
    .filter((item) => item.label);

  return normalized.length
    ? normalized
    : [
        { label: "Product Strategy", percentage: 100 },
        { label: "UX Research", percentage: 100 },
        { label: "Visual Design", percentage: 100 },
      ];
}

function clampPercentage(value?: number) {
  if (!Number.isFinite(value)) return 100;
  return Math.min(Math.max(Math.round(value as number), 0), 100);
}
