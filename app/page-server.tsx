import { getStaticTimeline, getStaticTags } from '@/lib/cms/static-data';
import { TimelineStatic } from '@/components/landing/TimelineStatic';
import { DictionaryDefinition } from '@/components/landing/DictionaryDefinition';
import { FloatingNav } from '@/components/landing/FloatingNav';
import ClientWrapper from './page-client';

export default async function HomePage() {
  // Generate data at build time for static export
  const timelineData = await getStaticTimeline();
  const allTags = await getStaticTags();

  return (
    <ClientWrapper timelineData={timelineData} allTags={allTags} />
  );
}