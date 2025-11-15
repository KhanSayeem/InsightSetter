import { redirect } from 'next/navigation';

export const revalidate = 0;

export default function CaseStudiesPage() {
  redirect('/categories/case-studies');
}
