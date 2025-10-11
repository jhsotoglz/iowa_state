import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <h1 className="text-4xl font-bold text-primary mb-4">
        Hello, DaisyUI 🌼
      </h1>
      <button className="btn btn-primary">Click Me</button>
    </div>
  );
}
