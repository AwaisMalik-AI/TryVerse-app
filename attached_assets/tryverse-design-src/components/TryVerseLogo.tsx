import logoAsset from "@/assets/tryverse-logo-vertical.png.asset.json";

type Props = {
  className?: string;
  height?: number;
  alt?: string;
};

export function TryVerseLogo({ className = "", height = 28, alt = "TryVerse" }: Props) {
  return (
    <img
      src={logoAsset.url}
      alt={alt}
      style={{ height, width: "auto" }}
      className={`tv-logo-img ${className}`}
      draggable={false}
    />
  );
}

export default TryVerseLogo;