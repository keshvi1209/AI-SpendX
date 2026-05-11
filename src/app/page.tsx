// src/app/page.tsx
import { SpendForm } from "@/components/SpendForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <SpendForm />
    </main>
  );
}