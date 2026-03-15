import { Link } from "@/i18n/navigation";
import { getRandomColor } from "@/lib/helpers";
import { Category } from "@/lib/types";
import Image from "next/image";

const CategoryCard = ({ cat }: { cat: Category }) => {
  const color = getRandomColor();
  return (
    <>
      <Link
        href={"/category/" + cat.idx}
        className="cat-card group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card px-4 py-8 text-center"
      >
        <div className="cat-bg absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300" />

        <div
          className="cat-icon relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300"
          style={{
            background: `hsl(${color} / 0.12)`,
            color: `hsl(${color})`,
          }}
        >
          {cat.image ? (
            <Image src={cat.image} alt={cat.name} width={32} height={32} />
          ) : (
            <span className="text-xl">📂</span>
          )}
        </div>

        <span className="relative z-10 text-xs font-semibold leading-tight text-foreground transition-colors duration-300 cat-label">
          {cat.name}
        </span>

        <div
          className="cat-line absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full transition-all duration-300"
          style={{ background: `hsl(${color})` }}
        />
      </Link>
    </>
  );
};

export default CategoryCard;
