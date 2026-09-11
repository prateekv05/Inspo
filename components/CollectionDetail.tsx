import Badge from "@/components/Badge";
import CopyButton from "@/components/CopyButton";

interface CollectionDetailProps {
  name: string;
  description: string;
  deployFor: string;
  vocabTags: string[];
  briefBlock: string;
}

export default function CollectionDetail({
  name,
  description,
  deployFor,
  vocabTags,
  briefBlock,
}: CollectionDetailProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-foreground/[0.03] p-4">
      <h2 className="text-lg font-medium tracking-tight">{name}</h2>
      <p className="text-sm text-foreground/70">{description}</p>
      <p className="text-sm text-foreground/70">
        <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
          Deploy for —{" "}
        </span>
        {deployFor}
      </p>
      {vocabTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {vocabTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <CopyButton text={briefBlock} label="Copy Brief Block" />
        <CopyButton text={vocabTags.join(", ")} label="Copy Vocab Only" />
      </div>
    </div>
  );
}
