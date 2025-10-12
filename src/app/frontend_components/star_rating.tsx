export default function StarRating({
  value,
  onChange,
  name = "rating",
}: {
  value: number | "";
  onChange: (n: number) => void;
  name?: string;
}) {
  return (
    <div className="rating rating-lg">
      {[1, 2, 3, 4, 5].map((n) => (
        <input
          key={n}
          type="radio"
          name={name}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          checked={value === n}
          onChange={() => onChange(n)}
          className={`mask mask-star-2 cursor-pointer ${
            n <= (value || 0) ? "bg-gray-300" : "bg-gray-100"
          }`}
        />
      ))}
    </div>
  );
}
