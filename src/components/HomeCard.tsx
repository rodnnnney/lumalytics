interface HomeCardProps {
  value: string | number;
  description: string;
}

export function HomeCard({ value, description }: HomeCardProps) {
  return (
    <div
      className="bg-[var(--light-green)] p-6 py-10
     rounded-lg shadow-sm border border-[var(--dark-green)]"
    >
      <p className="text-sm text-black font-semibold mt-2">{description}</p>
      <h2 className="text-4xl font-bold text-[var(--dark-green)]">{value}</h2>
    </div>
  );
}
