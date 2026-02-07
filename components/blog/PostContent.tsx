import Image from "next/image";

interface PostContentProps {
  content: unknown;
}

export function PostContent({ content }: PostContentProps) {
  const nodes = contentToReact(content);
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-p:font-serif prose-li:font-serif prose-blockquote:font-serif prose-pre:bg-stone-100 dark:prose-pre:bg-stone-900 prose-pre:border prose-pre:border-stone-200 dark:prose-pre:border-stone-700">
      {nodes}
    </div>
  );
}

function ImageNode({ src, alt, title }: { src: string; alt?: string; title?: string }) {
  const url = src.startsWith("http") ? src : `https:${src}`;
  try {
    return (
      <span className="block my-4 relative w-full aspect-video max-w-2xl mx-auto">
        <Image
          src={url}
          alt={alt ?? ""}
          title={title ?? undefined}
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, 672px"
          unoptimized={!url.includes("blob.vercel-storage")}
        />
      </span>
    );
  } catch {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={alt ?? ""} title={title} className="my-4 max-w-full rounded-lg" />
    );
  }
}

export function contentToReact(content: unknown): React.ReactNode[] {
  if (!content || typeof content !== "object") return [];
  const doc = content as { content?: Array<Record<string, unknown>> };
  const nodes = doc.content ?? [];
  return nodes.map((node, i) => renderNode(node, i));
}

function renderNode(node: Record<string, unknown>, key: number): React.ReactNode {
  const type = node.type as string;
  const content = node.content as Array<Record<string, unknown>> | undefined;
  const children = content?.map((c, i) => renderInlineOrBlock(c, i));

  switch (type) {
    case "paragraph":
      return <p key={key} className="my-4">{children}</p>;
    case "heading": {
      const level = ((node.attrs as any)?.level as number) ?? 1;
      const Tag = `h${Math.min(6, Math.max(1, level))}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return <Tag key={key} className="font-serif font-semibold mt-8 mb-2">{children}</Tag>;
    }
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-4 border-stone-300 dark:border-stone-600 pl-4 my-4 italic text-stone-600 dark:text-stone-400">
          {children}
        </blockquote>
      );
    case "bulletList":
      return <ul key={key} className="list-disc pl-6 my-4 space-y-1">{children}</ul>;
    case "orderedList":
      return <ol key={key} className="list-decimal pl-6 my-4 space-y-1">{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "codeBlock": {
      const lang = ((node.attrs as any)?.language as string) ?? "";
      const text = content?.map((n) => (n.type === "text" ? n.text : "")).join("") ?? "";
      return (
        <pre key={key} className="overflow-x-auto rounded-lg p-4 text-sm my-4">
          <code className={lang ? `language-${lang}` : undefined}>{text}</code>
        </pre>
      );
    }
    case "image": {
      const src = ((node.attrs as any)?.src as string) ?? "";
      const alt = ((node.attrs as any)?.alt as string) ?? "";
      const title = ((node.attrs as any)?.title as string) ?? "";
      return <ImageNode key={key} src={src} alt={alt} title={title} />;
    }
    case "horizontalRule":
      return <hr key={key} className="my-8 border-stone-200 dark:border-stone-700" />;
    default:
      return content?.length ? <div key={key}>{children}</div> : null;
  }
}

function renderInlineOrBlock(node: Record<string, unknown>, key: number): React.ReactNode {
  const type = node.type as string;
  const content = node.content as Array<Record<string, unknown>> | undefined;
  const children = content?.map((c, i) => renderInlineOrBlock(c, i));

  if (type === "text") {
    let text: React.ReactNode = node.text as string;
    const marks = (node.marks as Array<{ type: string }>) ?? [];
    for (const mark of marks) {
      if (mark.type === "bold") text = <strong key={key}>{text}</strong>;
      else if (mark.type === "italic") text = <em key={key}>{text}</em>;
      else if (mark.type === "underline") text = <u key={key}>{text}</u>;
      else if (mark.type === "code") text = <code key={key} className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-sm">{text}</code>;
    }
    return <span key={key}>{text}</span>;
  }
  return renderNode(node, key);
}
