import { getCase } from '$lib/loadCases.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const caseData = getCase(params.slug, 'ar');
  if (!caseData) throw error(404, 'Case not found');
  return { case: caseData };
}