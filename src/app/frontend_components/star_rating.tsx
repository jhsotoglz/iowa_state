export default function StarRating({
  value,
  onChange,
  name = "rating",
}: {
  value: number | "";
  onChange: (n: number) => void;
  name?: string;
}) {
  // Render 1..5 stars with radio inputs (accessible + keyboardable)
  return (
    <div className="rating rating-lg">
      {[1, 2, 3, 4, 5].map((n) => (
        <input
          key={n}
          type="radio"
          name={name}
          className="mask mask-star-2 bg-warning"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          checked={value === n}
          onChange={() => onChange(n)}
        />
      ))}
    </div>
  );
}
