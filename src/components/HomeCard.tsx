import NumberFlow from '@number-flow/react';

interface HomeCardProps {
  value: string | number;
  description: string;
}

export function HomeCard({ value, description }: HomeCardProps) {
  const numericValue =
    typeof value === 'string'
      ? value.includes('%')
        ? parseFloat(value)
        : isNaN(Number(value))
          ? 0
          : Number(value)
      : value;

  return (
    <div
      className="bg-luma-light-green p-6 py-10
     rounded-lg shadow-sm border border-luma-dark-green"
    >
      <p className="text-sm text-black font-semibold mt-2">{description}</p>
      {typeof value === 'string' && isNaN(Number(value.replace('%', ''))) ? (
        <div className="text-4xl font-bold text-dark-green">{value}</div>
      ) : (
        <NumberFlow
          className="text-4xl font-bold text-[#5DAD6B]"
          value={numericValue}
          suffix={typeof value === 'string' && value.includes('%') ? '%' : undefined}
        />
      )}
    </div>
  );
}
