import { redirect } from "next/navigation";

export default async function LandsAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  redirect(`/catalog/${resolvedParams.id}`);
}
